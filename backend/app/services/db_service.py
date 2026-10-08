import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import aiosqlite
from supabase import create_client, Client

from app.core.config import settings
from app.models.schemas import (
    AgentName,
    FlaggedClauseItem,
    VendorStatus,
)

logger = logging.getLogger("nexus.db")

class DatabaseService:
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.use_supabase: bool = False
        self._init_supabase()

    def _init_supabase(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your_" not in settings.SUPABASE_URL:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                self.use_supabase = True
                logger.info("Initialized Supabase PostgreSQL Client successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to SQLite.")
                self.use_supabase = False
        else:
            logger.info("Supabase credentials not configured. Using local async database engine.")
            self.use_supabase = False

    async def init_sqlite(self):
        """Initializes the local SQLite schema if using fallback/local storage."""
        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            await db.execute("PRAGMA journal_mode=WAL;")
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS vendors (
                    id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    name TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    contract_text TEXT,
                    trust_score INTEGER,
                    reputation_summary TEXT,
                    overall_reasoning TEXT,
                    industry TEXT,
                    legal_entity_name TEXT,
                    is_alert_triggered INTEGER DEFAULT 0,
                    error_message TEXT
                );
            """)

            await db.execute("""
                CREATE TABLE IF NOT EXISTS agent_logs (
                    id TEXT PRIMARY KEY,
                    vendor_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    agent_name TEXT NOT NULL,
                    log_message TEXT NOT NULL,
                    metadata TEXT,
                    FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
                );
            """)

            await db.execute("""
                CREATE TABLE IF NOT EXISTS flagged_clauses (
                    id TEXT PRIMARY KEY,
                    vendor_id TEXT NOT NULL,
                    domain TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    clause_text TEXT NOT NULL,
                    agent_reasoning TEXT NOT NULL,
                    FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
                );
            """)

            await db.execute("""
                CREATE TABLE IF NOT EXISTS app_settings (
                    id TEXT PRIMARY KEY,
                    webhook_url TEXT DEFAULT '',
                    alert_threshold INTEGER DEFAULT 70,
                    updated_at TEXT NOT NULL
                );
            """)

            # Ensure default settings row exists
            async with db.execute("SELECT COUNT(*) FROM app_settings;") as cursor:
                row = await cursor.fetchone()
                if row and row[0] == 0:
                    now = datetime.now(timezone.utc).isoformat()
                    await db.execute(
                        "INSERT INTO app_settings (id, webhook_url, alert_threshold, updated_at) VALUES (?, ?, ?, ?)",
                        (str(uuid.uuid4()), settings.DEFAULT_WEBHOOK_URL, settings.DEFAULT_ALERT_THRESHOLD, now),
                    )

            await db.commit()
            logger.info("Local database initialized.")

    # -------------------------------------------------------------
    # Vendor Methods
    # -------------------------------------------------------------
    async def create_vendor(self, name: str, contract_text: str) -> str:
        vendor_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        if self.use_supabase and self.supabase:
            try:
                data = {
                    "id": vendor_id,
                    "created_at": now,
                    "updated_at": now,
                    "name": name,
                    "status": VendorStatus.PENDING.value,
                    "contract_text": contract_text,
                    "is_alert_triggered": False,
                }
                self.supabase.table("vendors").insert(data).execute()
                return vendor_id
            except Exception as e:
                logger.error(f"Supabase create_vendor failed: {e}. Falling back to SQLite.")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            await db.execute(
                """
                INSERT INTO vendors (id, created_at, updated_at, name, status, contract_text, is_alert_triggered)
                VALUES (?, ?, ?, ?, ?, ?, 0)
                """,
                (vendor_id, now, now, name, VendorStatus.PENDING.value, contract_text),
            )
            await db.commit()
        return vendor_id

    async def update_vendor(self, vendor_id: str, updates: Dict[str, Any]):
        now = datetime.now(timezone.utc).isoformat()
        updates["updated_at"] = now

        if self.use_supabase and self.supabase:
            try:
                self.supabase.table("vendors").update(updates).eq("id", vendor_id).execute()
                return
            except Exception as e:
                logger.error(f"Supabase update_vendor failed: {e}. Falling back to SQLite.")

        # SQLite fallback
        set_clauses = []
        params = []
        for k, v in updates.items():
            set_clauses.append(f"{k} = ?")
            if isinstance(v, bool):
                params.append(1 if v else 0)
            else:
                params.append(v)
        params.append(vendor_id)

        query = f"UPDATE vendors SET {', '.join(set_clauses)} WHERE id = ?"
        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            await db.execute(query, tuple(params))
            await db.commit()

    async def get_vendor(self, vendor_id: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase and self.supabase:
            try:
                res = self.supabase.table("vendors").select("*").eq("id", vendor_id).single().execute()
                if res.data:
                    vendor = res.data
                    vendor["flagged_clauses"] = await self.get_flagged_clauses(vendor_id)
                    vendor["agent_logs"] = await self.get_agent_logs(vendor_id)
                    return vendor
            except Exception as e:
                logger.warning(f"Supabase get_vendor fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM vendors WHERE id = ?", (vendor_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    return None
                vendor = dict(row)
                vendor["is_alert_triggered"] = bool(vendor.get("is_alert_triggered"))
                vendor["flagged_clauses"] = await self.get_flagged_clauses(vendor_id)
                vendor["agent_logs"] = await self.get_agent_logs(vendor_id)
                return vendor

    async def list_vendors(self) -> List[Dict[str, Any]]:
        if self.use_supabase and self.supabase:
            try:
                res = self.supabase.table("vendors").select("*").order("created_at", desc=True).execute()
                if res.data is not None:
                    vendors = []
                    for item in res.data:
                        clauses = await self.get_flagged_clauses(item["id"])
                        item["flagged_clauses_count"] = len(clauses)
                        vendors.append(item)
                    return vendors
            except Exception as e:
                logger.warning(f"Supabase list_vendors fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM vendors ORDER BY created_at DESC") as cursor:
                rows = await cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    item["is_alert_triggered"] = bool(item.get("is_alert_triggered"))
                    # get count of flagged clauses
                    async with db.execute("SELECT COUNT(*) FROM flagged_clauses WHERE vendor_id = ?", (item["id"],)) as c_cursor:
                        c_row = await c_cursor.fetchone()
                        item["flagged_clauses_count"] = c_row[0] if c_row else 0
                    results.append(item)
                return results

    # -------------------------------------------------------------
    # Agent Logs Methods
    # -------------------------------------------------------------
    async def add_agent_log(
        self,
        vendor_id: str,
        agent_name: str,
        log_message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        log_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        if self.use_supabase and self.supabase:
            try:
                self.supabase.table("agent_logs").insert({
                    "id": log_id,
                    "vendor_id": vendor_id,
                    "created_at": now,
                    "agent_name": agent_name,
                    "log_message": log_message,
                    "metadata": metadata or {},
                }).execute()
                return log_id
            except Exception as e:
                logger.warning(f"Supabase add_agent_log fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            meta_json = json.dumps(metadata) if metadata else None
            await db.execute(
                """
                INSERT INTO agent_logs (id, vendor_id, created_at, agent_name, log_message, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (log_id, vendor_id, now, agent_name, log_message, meta_json),
            )
            await db.commit()
        return log_id

    async def get_agent_logs(self, vendor_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase and self.supabase:
            try:
                res = (
                    self.supabase.table("agent_logs")
                    .select("*")
                    .eq("vendor_id", vendor_id)
                    .order("created_at", desc=False)
                    .execute()
                )
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_agent_logs fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM agent_logs WHERE vendor_id = ? ORDER BY created_at ASC", (vendor_id,)
            ) as cursor:
                rows = await cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    if item.get("metadata") and isinstance(item["metadata"], str):
                        try:
                            item["metadata"] = json.loads(item["metadata"])
                        except Exception:
                            item["metadata"] = {}
                    results.append(item)
                return results

    # -------------------------------------------------------------
    # Flagged Clauses Methods
    # -------------------------------------------------------------
    async def save_flagged_clauses(self, vendor_id: str, clauses: List[FlaggedClauseItem]):
        if self.use_supabase and self.supabase:
            try:
                records = [
                    {
                        "id": str(uuid.uuid4()),
                        "vendor_id": vendor_id,
                        "domain": c.domain.value if hasattr(c.domain, "value") else str(c.domain),
                        "severity": c.severity.value if hasattr(c.severity, "value") else str(c.severity),
                        "clause_text": c.clause_text,
                        "agent_reasoning": c.agent_reasoning,
                    }
                    for c in clauses
                ]
                if records:
                    self.supabase.table("flagged_clauses").insert(records).execute()
                return
            except Exception as e:
                logger.warning(f"Supabase save_flagged_clauses fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            for c in clauses:
                clause_id = str(uuid.uuid4())
                domain_val = c.domain.value if hasattr(c.domain, "value") else str(c.domain)
                sev_val = c.severity.value if hasattr(c.severity, "value") else str(c.severity)
                await db.execute(
                    """
                    INSERT INTO flagged_clauses (id, vendor_id, domain, severity, clause_text, agent_reasoning)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (clause_id, vendor_id, domain_val, sev_val, c.clause_text, c.agent_reasoning),
                )
            await db.commit()

    async def get_flagged_clauses(self, vendor_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase and self.supabase:
            try:
                res = self.supabase.table("flagged_clauses").select("*").eq("vendor_id", vendor_id).execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_flagged_clauses fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM flagged_clauses WHERE vendor_id = ?", (vendor_id,)
            ) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

    # -------------------------------------------------------------
    # App Settings Methods
    # -------------------------------------------------------------
    async def get_settings(self) -> Dict[str, Any]:
        if self.use_supabase and self.supabase:
            try:
                res = self.supabase.table("app_settings").select("*").limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase get_settings fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM app_settings LIMIT 1") as cursor:
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                
                # Default insert
                now = datetime.now(timezone.utc).isoformat()
                sid = str(uuid.uuid4())
                await db.execute(
                    "INSERT INTO app_settings (id, webhook_url, alert_threshold, updated_at) VALUES (?, ?, ?, ?)",
                    (sid, settings.DEFAULT_WEBHOOK_URL, settings.DEFAULT_ALERT_THRESHOLD, now),
                )
                await db.commit()
                return {
                    "id": sid,
                    "webhook_url": settings.DEFAULT_WEBHOOK_URL,
                    "alert_threshold": settings.DEFAULT_ALERT_THRESHOLD,
                    "updated_at": now,
                }

    async def update_settings(self, webhook_url: str, alert_threshold: int) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()

        if self.use_supabase and self.supabase:
            try:
                # check existing
                res = self.supabase.table("app_settings").select("id").limit(1).execute()
                if res.data and len(res.data) > 0:
                    sid = res.data[0]["id"]
                    self.supabase.table("app_settings").update({
                        "webhook_url": webhook_url,
                        "alert_threshold": alert_threshold,
                        "updated_at": now,
                    }).eq("id", sid).execute()
                else:
                    self.supabase.table("app_settings").insert({
                        "webhook_url": webhook_url,
                        "alert_threshold": alert_threshold,
                        "updated_at": now,
                    }).execute()
                return {"webhook_url": webhook_url, "alert_threshold": alert_threshold, "updated_at": now}
            except Exception as e:
                logger.warning(f"Supabase update_settings fallback: {e}")

        async with aiosqlite.connect(settings.SQLITE_DB_PATH) as db:
            async with db.execute("SELECT id FROM app_settings LIMIT 1") as cursor:
                row = await cursor.fetchone()
                if row:
                    sid = row[0]
                    await db.execute(
                        "UPDATE app_settings SET webhook_url = ?, alert_threshold = ?, updated_at = ? WHERE id = ?",
                        (webhook_url, alert_threshold, now, sid),
                    )
                else:
                    sid = str(uuid.uuid4())
                    await db.execute(
                        "INSERT INTO app_settings (id, webhook_url, alert_threshold, updated_at) VALUES (?, ?, ?, ?)",
                        (sid, webhook_url, alert_threshold, now),
                    )
                await db.commit()
        return {"webhook_url": webhook_url, "alert_threshold": alert_threshold, "updated_at": now}


db_service = DatabaseService()
