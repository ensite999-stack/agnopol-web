import Link from 'next/link'

type LangType =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'zh-cn'
  | 'zh-tw'

function normalizeLang(value?: string): LangType {
  const allowed: LangType[] = ['de', 'en', 'es', 'fr', 'ja', 'ko', 'zh-cn', 'zh-tw']
  return allowed.includes(value as LangType) ? (value as LangType) : 'en'
}

const uiText: Record<
  LangType,
  {
    back: string
    title: string
    subtitle: string
    note: string
    contents: string
    terms: string
    privacy: string
    risk: string
    aml: string
    legalTextLabel: string
  }
> = {
  de: {
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    note: 'The full legal text below is presented in standard English for drafting consistency.',
    contents: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    legalTextLabel: 'Legal Text',
  },
  en: {
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    note: 'The full legal text below is presented in standard English for drafting consistency.',
    contents: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    legalTextLabel: 'Legal Text',
  },
  es: {
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    note: 'The full legal text below is presented in standard English for drafting consistency.',
    contents: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    legalTextLabel: 'Legal Text',
  },
  fr: {
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    note: 'The full legal text below is presented in standard English for drafting consistency.',
    contents: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    legalTextLabel: 'Legal Text',
  },
  ja: {
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    note: 'The full legal text below is presented in standard English for drafting consistency.',
    contents: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    legalTextLabel: 'Legal Text',
  },
  ko: {
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    note: 'The full legal text below is presented in standard English for drafting consistency.',
    contents: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    legalTextLabel: 'Legal Text',
  },
  'zh-cn': {
    back: '返回',
    title: '法律页面',
    subtitle: '服务条款、隐私、风险与合规披露。',
    note: '下方完整法律正文统一以标准英文呈现，以保持法律语义稳定。',
    contents: '目录',
    terms: '服务条款',
    privacy: '隐私政策',
    risk: '风险披露',
    aml: '反洗钱与制裁合规',
    legalTextLabel: '法律正文',
  },
  'zh-tw': {
    back: '返回',
    title: '法律頁面',
    subtitle: '服務條款、隱私、風險與合規揭露。',
    note: '下方完整法律正文統一以標準英文呈現，以保持法律語義穩定。',
    contents: '目錄',
    terms: '服務條款',
    privacy: '隱私政策',
    risk: '風險揭露',
    aml: '反洗錢與制裁合規',
    legalTextLabel: '法律正文',
  },
}

const LEGAL = {
  tosTitle: 'Terms of Service & Conduit Protocol',
  tosControl: 'Control No.: AGN-TOS-2026-FINAL',
  tosLaw: 'Governing Law: Laws of the United States and the Commonwealth of Massachusetts',
  tosSections: [
    {
      heading: '1. Contract Formation',
      body:
        'To the fullest extent permitted by applicable law, including the Electronic Signatures in Global and National Commerce Act, the precise moment at which you initiate any transaction or interaction instruction to any ledger address associated with Agnopol may constitute an affirmative electronic signature and binding assent to this Agreement and all related instruments. By transmitting value or an instruction through the conduit, you acknowledge that such action may evidence your intent to be bound by the operative terms then in effect.',
    },
    {
      heading: '2. Conduit Characterization & Non-Entity',
      body:
        'Agnopol is not represented as the issuer, redeemer, reseller, or merchant of any third-party digital entitlement, including but not limited to Telegram-related value-added services. The interface is characterized solely as a neutral technical routing conduit used for the transmission and automation of cryptographic instructions. No trust, fiduciary duty, agency, partnership, mandate, custody, or representative relationship is created between you and any maintainer, operator, or contributor. To the fullest extent permitted by law, no personal joint or several liability shall attach to any anonymous or pseudonymous contributor solely by reason of maintenance or technical participation.',
    },
    {
      heading: '3. Asset Transfers & Finality',
      body:
        'Any digital asset submitted into the conduit workflow may be treated as property transferred for routing and execution purposes under applicable commercial law principles. Performance by the conduit shall be deemed completed exclusively upon successful transmission of the relevant API or routing instruction to the designated third-party gateway. Once such transmission occurs, the conduit’s performance obligation shall be considered fully discharged, regardless of any later refusal, delay, downgrade, denial, account restriction, compliance review, or policy action attributable to any downstream platform, intermediary, or external system.',
    },
    {
      heading: '4. Final Sale & Abort Fee',
      body:
        'All transactions are final except where a refund is expressly required by applicable law. You are solely responsible for all submitted identifiers, addresses, account references, target UID values, memo fields, formats, and routing instructions. The conduit bears no general verification duty. Where a transaction fails solely due to severe network failure, infrastructure collapse, or comparable foundational disruption, and where an automated return is technically triggered, the conduit may retain blockchain network fees, miner fees, and a routing termination fee equal to the greater of ten percent (10%) of principal or five (5) USDT as a reasonable pre-estimate of administrative loss, system load, and failed execution overhead, and not as a penalty, to the fullest extent permitted by law.',
    },
    {
      heading: '5. Dispute Resolution & Waivers',
      body:
        'Any dispute, claim, or controversy arising out of or relating to this conduit, these terms, or any related transaction shall, to the fullest extent enforceable, be resolved by binding English-language arbitration administered by the International Centre for Dispute Resolution (ICDR) in Boston, Massachusetts, United States. Any purported class-action waiver, jury-trial waiver, limitation on forum, or restriction on collective proceedings shall apply only to the extent valid and enforceable under governing law.',
    },
  ],
  privacyTitle: 'Privacy & Ephemeral Data Policy',
  privacyControl: 'Control No.: AGN-PRIV-2026-FINAL',
  privacyLevel: 'Data Classification: Zero-Knowledge / Ephemeral Obliteration',
  privacySections: [
    {
      heading: '1. Zero-Retention Architecture',
      body:
        'Agnopol follows a strict data-minimization model. The conduit is designed, to the extent technically feasible, not to maintain a persistent registry of real names, physical addresses, or direct identity-linkage matrices unless strictly necessary for operation, abuse prevention, accounting, or legal compliance. The service is engineered around minimal retention and short-lived operational state wherever possible.',
    },
    {
      heading: '2. Ephemeral Logs & Best-Effort Purge',
      body:
        'Transient metadata created in connection with routing, processing, abuse prevention, or delivery attempts, including but not limited to IP fragments, hashes, wallet traces, timing records, and target identifiers, may exist within volatile memory, edge logs, temporary caches, or short-lived infrastructure records. Agnopol undertakes commercially reasonable best efforts to purge such transient artifacts within forty-eight (48) hours after instruction completion. All such deletion commitments are expressly best-effort in nature.',
    },
    {
      heading: '3. Technical Limits of Deletion',
      body:
        'Because public-network propagation, infrastructure snapshotting, CDN caching, asynchronous logging pipelines, and blockchain immutability are inherent technical realities, Agnopol disclaims any representation or warranty that any datum is absolutely irrecoverable, fully erased in every layer, or permanently inaccessible in all circumstances. Residual persistence caused by lower-layer technical conditions remains outside any strict deletion guarantee.',
    },
    {
      heading: '4. Access Requests & Historical Retrieval',
      body:
        'Any request for access, deletion, correction, export, audit, or historical reconstruction shall be handled only to the extent technically feasible and legally required. Where system design is ephemeral, partial, non-persistent, or non-indexed, fulfillment may be objectively impossible in practice. Nothing in these terms shall be interpreted as waiving any non-waivable statutory rights that may apply under mandatory law.',
    },
  ],
  riskTitle: 'Risk & Jurisdiction Disclosures',
  riskControl: 'Control No.: AGN-RISK-2026-FINAL',
  riskSections: [
    {
      heading: '1. Restricted Territories Prohibition',
      body:
        'This conduit operates across the public internet and may not lawfully be accessible from every jurisdiction. Access is prohibited from territories or sovereign domains that impose anti-crypto-asset prohibitions, sanctions restrictions, strict capital controls, or comparable legal limitations. You are solely responsible for understanding and complying with the laws applicable to your location, citizenship, residency, and network origin.',
    },
    {
      heading: '2. Fraudulent Access & Assumption of Risk',
      body:
        'Use of VPNs, proxy servers, location masking tools, nominee identities, or comparable concealment techniques to circumvent territorial restrictions may constitute material fraud against Agnopol. If you nevertheless choose to access or interact from a prohibited or restricted territory, you assume one hundred percent (100%) of the resulting legal, financial, regulatory, tax, confiscatory, and enforcement risk.',
    },
    {
      heading: '3. Network Intervention Immunity',
      body:
        'Agnopol is not responsible for loss, delay, or failed access caused by deep packet inspection, DNS interference, firewall rules, ISP controls, censorship layers, sovereign network segmentation, or similar interventions. Where blockchain settlement has reached finality but resulting access or enjoyment is blocked by local conditions, no refund, chargeback, replacement, or compensation obligation shall arise except where required by non-waivable law.',
    },
    {
      heading: '4. Absolute Cap on Liability',
      body:
        'To the fullest extent permitted by applicable law, Agnopol’s aggregate liability arising from any single transaction, event, or claim shall not exceed the net administrative fee actually retained by the conduit in connection with that transaction, expressly excluding principal, blockchain network fees, miner fees, and third-party costs.',
    },
  ],
  amlTitle: 'AML & Sanctions Compliance',
  amlControl: 'Control No.: AGN-AML-2026-FINAL',
  amlSections: [
    {
      heading: '1. Non-MSB Position',
      body:
        'Agnopol presents itself as a neutral technical conduit and not as a money services business, financial institution, exchanger, administrator, or regulated custodian; however, this statement is a legal position only and not a conclusive regulatory determination. Regulatory characterization may depend on evolving facts, jurisdiction-specific rules, and actual operational conduct.',
    },
    {
      heading: '2. Sanctions & Illicit Funds Exclusion',
      body:
        'You represent and warrant on a continuing basis that you are not a restricted person under applicable sanctions programs and that no digital asset, stablecoin, or on-chain value introduced through the conduit derives from illicit activity, including but not limited to telecom fraud, darknet transactions, unlawful gambling, stolen assets, sanctioned counterparties, mixer protocols, terrorist financing, or sanctions evasion.',
    },
    {
      heading: '3. Absolute Prohibition of Illicit Utilization',
      body:
        'You shall not use the conduit or any associated routing interface for money laundering, cyber fraud, social engineering fraud, terrorist financing, illegal gambling, sanctions evasion, or any unlawful conduct under applicable local, federal, or international law. Any such use or attempted use constitutes material fraud against Agnopol and may result in refusal, blocking, logging, preservation, reporting, or other defensive actions to the extent permitted or required by law.',
    },
  ],
}

function LegalSection(props: {
  id: string
  title: string
  control?: string
  subtitle?: string
  sections: { heading: string; body: string }[]
}) {
  return (
    <section
      id={props.id}
      style={{
        padding: 22,
        borderRadius: 20,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255,255,255,0.86)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
        backdropFilter: 'blur(10px)',
        scrollMarginTop: 24,
      }}
    >
      <h2
        style={{
          margin: '0 0 10px 0',
          fontSize: 'clamp(24px, 3vw, 32px)',
          color: '#0f172a',
          lineHeight: 1.1,
        }}
      >
        {props.title}
      </h2>

      {props.control ? (
        <p style={{ margin: '0 0 8px 0', color: '#475569', fontWeight: 600 }}>
          {props.control}
        </p>
      ) : null}

      {props.subtitle ? (
        <p style={{ margin: '0 0 14px 0', color: '#475569' }}>{props.subtitle}</p>
      ) : null}

      {props.sections.map((item, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontWeight: 800,
              color: '#1e293b',
              marginBottom: 6,
            }}
          >
            {item.heading}
          </div>
          <p
            style={{
              margin: 0,
              color: '#334155',
              lineHeight: 1.85,
            }}
          >
            {item.body}
          </p>
        </div>
      ))}
    </section>
  )
}

export default function LegalPage({
  searchParams,
}: {
  searchParams?: { lang?: string }
}) {
  const lang = normalizeLang(searchParams?.lang)
  const t = uiText[lang]

  return (
    <main
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '24px 14px 40px',
        fontFamily: 'system-ui, Arial, sans-serif',
        background:
          'radial-gradient(circle at top, rgba(224,231,255,0.45), rgba(247,248,250,0) 38%), linear-gradient(180deg, #f8fafc 0%, #f5f7fb 100%)',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .legal-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .legal-toc {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .legal-toc a {
          text-decoration: none;
          color: #334155;
          padding: 10px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
        }

        .legal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 18px;
        }
      `}</style>

      <div className="legal-container">
        <div style={{ marginBottom: 18 }}>
          <Link
            href={`/?lang=${lang}`}
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontSize: 14,
            }}
          >
            ← {t.back}
          </Link>
        </div>

        <header style={{ textAlign: 'center' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(42px, 8vw, 76px)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 0.96,
              letterSpacing: '-0.04em',
            }}
          >
            Agnopol
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: '#64748b',
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 700,
            }}
          >
            {t.title}
          </p>

          <p
            style={{
              marginTop: 8,
              color: '#64748b',
              fontSize: 15,
            }}
          >
            {t.subtitle}
          </p>

          <p
            style={{
              marginTop: 8,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            {t.note}
          </p>
        </header>

        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#475569', fontWeight: 800 }}>{t.contents}</div>
          <div className="legal-toc">
            <a href="#terms">{t.terms}</a>
            <a href="#privacy">{t.privacy}</a>
            <a href="#risk">{t.risk}</a>
            <a href="#aml">{t.aml}</a>
          </div>
        </div>

        <div className="legal-grid">
          <LegalSection
            id="terms"
            title={LEGAL.tosTitle}
            control={LEGAL.tosControl}
            subtitle={LEGAL.tosLaw}
            sections={LEGAL.tosSections}
          />

          <LegalSection
            id="privacy"
            title={LEGAL.privacyTitle}
            control={LEGAL.privacyControl}
            subtitle={LEGAL.privacyLevel}
            sections={LEGAL.privacySections}
          />

          <LegalSection
            id="risk"
            title={LEGAL.riskTitle}
            control={LEGAL.riskControl}
            sections={LEGAL.riskSections}
          />

          <LegalSection
            id="aml"
            title={LEGAL.amlTitle}
            control={LEGAL.amlControl}
            sections={LEGAL.amlSections}
          />
        </div>
      </div>
    </main>
  )
}
