export interface SampleContract {
  id: string;
  name: string;
  description: string;
  expectedRisk: "CRITICAL" | "MODERATE" | "SAFE";
  vendorName: string;
  contractText: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: "apex-cloud-critical",
    name: "Apex Cloud Services (High Risk MSA - Data Breach & SEC Fine)",
    description: "Cloud infrastructure provider with capped liability, auto-renewal penalty, and past SEC investigation.",
    expectedRisk: "CRITICAL",
    vendorName: "Apex Cloud Infrastructure Ltd.",
    contractText: `MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is made effective between Client ("Customer") and Apex Cloud Infrastructure Ltd. ("Vendor"), a Delaware corporation.

1. SCOPE OF SERVICES
Vendor shall provide managed multi-tenant cloud storage, database clusters, and API ingress hosting to Customer as specified in Order Forms.

2. SECURITY & AUDIT STANDARDS
Vendor agrees to maintain reasonable commercial security controls. Customer acknowledges that multi-tenant infrastructure is shared and agrees that Customer shall NOT have direct physical or logical audit rights to Vendor production data centers or server clusters.

3. DATA PROTECTION & INCIDENT NOTIFICATION
In the event of a confirmed security incident resulting in unauthorized access to Customer Personal Data, Vendor shall notify Customer within forty-five (45) business days following completion of internal forensic verification.

4. LIMITATION OF LIABILITY
VENDOR'S TOTAL CUMULATIVE AND AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, INCLUDING BUT NOT LIMITED TO CLAIMS ARISING FROM DATA BREACHES, UNAUTHORIZED DISCLOSURES, DATA LOSS, OR SYSTEM DOWNTIME, SHALL UNDER NO CIRCUMSTANCES EXCEED THE TOTAL FEES ACTUALLY PAID BY CUSTOMER TO VENDOR IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY.

5. INDEMNIFICATION & REMEDIES
Vendor agrees to indemnify Customer against third-party patent infringement claims. This indemnification constitutes Customer's sole and exclusive remedy for any intellectual property disputes. Customer shall not settle or compromise any claim without Vendor's prior written consent.

6. REGULATORY COMPLIANCE DISCLAIMER
Vendor makes no representations or warranties that the Services comply with foreign or specialized regulatory frameworks, including without limitation CCPA, EU GDPR Article 28 data transfer protocols, HIPAA, or SEC Rule 10-K cyber reporting timelines.

7. TERM, AUTO-RENEWAL, AND TERMINATION
This Agreement shall commence on the Effective Date and continue for an initial term of twenty-four (24) months. Thereafter, the Agreement shall automatically renew for successive twenty-four (24) month terms unless Customer provides written notice of termination at least one hundred twenty (120) days prior to the expiration of the then-current term. Upon each renewal, subscription fees shall automatically increase by fifteen percent (15%).`,
  },
  {
    id: "fintech-paygate-moderate",
    name: "PayGate Global Systems (Moderate Risk - Financial & Arbitration)",
    description: "Fintech payment processing gateway with foreign jurisdiction, sole remedies, and CFPB inquiries.",
    expectedRisk: "MODERATE",
    vendorName: "PayGate Global Systems Inc.",
    contractText: `GLOBAL PAYMENT SERVICES AND SETTLEMENT AGREEMENT
This Agreement is entered into by and between Enterprise Customer ("Merchant") and PayGate Global Systems Inc. ("Processor").

1. TRANSACTION PROCESSING & SETTLEMENT
Processor shall capture, authorize, and clear card transactions. Processor reserves the unilateral right to withhold up to 25% of rolling settlement reserves in the event of disputed chargebacks or suspected fraud velocity.

2. COMPLIANCE & REGULATORY FINES
Merchant agrees to maintain PCI-DSS Level 1 compliance. In the event of any regulatory fine or card scheme penalty imposed on Processor arising from Merchant transactions, Merchant shall fully indemnify Processor within 5 business days.

3. LIABILITY CAP
Processor's liability for processing errors, network outages, or unauthorized transaction routing shall be capped at twelve (12) months of net transaction processing margins collected from Merchant.

4. GOVERNING LAW & MANDATORY ARBITRATION
All disputes arising out of this Agreement shall be governed exclusively by the laws of the Cayman Islands, without regard to conflict of law principles, and resolved through binding single-arbitrator proceedings. Merchant waives any right to join class-action litigation or pursue jury trial relief.

5. TERMINATION FOR CONVENIENCE
Either party may terminate this Agreement upon ninety (90) days prior written notice, provided Merchant pays an early de-provisioning fee equal to 50% of the remaining contract commitment value.`,
  },
  {
    id: "nordic-sentinel-safe",
    name: "Nordic Sentinel Security (Verified Safe - Enterprise Grade SLA)",
    description: "Enterprise cybersecurity firm with SOC 2 Type II, 24-hr incident notice, and mutual uncapped indemnity.",
    expectedRisk: "SAFE",
    vendorName: "Nordic Sentinel Security Systems Oy",
    contractText: `ENTERPRISE MASTER CLOUD SECURITY SERVICES AGREEMENT
This Master Agreement is entered into between Customer ("Enterprise") and Nordic Sentinel Security Systems Oy ("Vendor").

1. COMMITMENT TO SECURITY EXCELLENCE
Vendor represents and warrants that all infrastructure and services comply with ISO/IEC 27001, ISO 27701, and SOC 2 Type II trust criteria. Vendor shall undergo annual third-party independent audits and provide full unredacted SOC 2 reports to Customer upon request.

2. ZERO-DELAY INCIDENT NOTIFICATION
In the event of any confirmed or reasonably suspected security breach, data compromise, or unauthorized credential access, Vendor shall notify Customer's Security Operations Center in writing within twenty-four (24) hours of detection.

3. UNLIMITED INDEMNIFICATION FOR SECURITY & PRIVACY BREACHES
Vendor shall defend, indemnify, and hold harmless Customer, its affiliates, officers, and employees against any and all third-party claims, regulatory fines (including GDPR, CCPA, and SEC assessments), legal defense costs, and damages arising out of:
(a) Any breach of Vendor's data security or confidentiality obligations;
(b) Gross negligence or willful misconduct;
(c) Infringement of any third-party intellectual property right.
No limitation of liability or aggregate liability cap in this Agreement shall apply to Vendor's indemnification obligations under this Section.

4. REGULATORY COMPLIANCE & DPA
Vendor warrants full compliance with all applicable data protection laws, including GDPR Article 28 requirements, HIPAA BAA provisions, and US federal cybersecurity disclosure mandates.

5. AUDIT & PENETRATION TESTING RIGHTS
Customer or its accredited independent third-party auditor shall have the right, upon 10 business days' notice, to conduct comprehensive security assessments, vulnerability scans, and policy audits of Vendor's systems and data centers.

6. TERMINATION
Customer may terminate this Agreement for convenience at any time upon thirty (30) days' written notice without penalty, fee, or ongoing liability.`,
  },
];
