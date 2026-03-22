'use client'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
type LangType = 'de' | 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'zh-cn' | 'zh-tw'
const legalUi: Record<
  LangType,
  {
    brand: string
    back: string
    title: string
    subtitle: string
    toc: string
    terms: string
    privacy: string
    risk: string
    aml: string
    note: string
  }
> = {
  de: {
    brand: 'Agnopol',
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    toc: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    note: 'The legal text below is presented in standard English for drafting consistency.',
  },
  en: {
    brand: 'Agnopol',
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    toc: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    note: 'The legal text below is presented in standard English for drafting consistency.',
  },
  es: {
    brand: 'Agnopol',
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    toc: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    note: 'The legal text below is presented in standard English for drafting consistency.',
  },
  fr: {
    brand: 'Agnopol',
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    toc: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    note: 'The legal text below is presented in standard English for drafting consistency.',
  },
  ja: {
    brand: 'Agnopol',
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    toc: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    note: 'The legal text below is presented in standard English for drafting consistency.',
  },
  ko: {
    brand: 'Agnopol',
    back: 'Back',
    title: 'Legal',
    subtitle: 'Terms, privacy, risk, and compliance disclosures.',
    toc: 'Contents',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    risk: 'Risk Disclosure',
    aml: 'AML & Sanctions Compliance',
    note: 'The legal text below is presented in standard English for drafting consistency.',
  },
  'zh-cn': {
    brand: 'Agnopol',
    back: '返回',
    title: '法律页面',
    subtitle: '服务条款、隐私、风险与合规披露。',
    toc: '目录',
    terms: '服务条款',
    privacy: '隐私政策',
    risk: '风险披露',
    aml: '反洗钱与制裁合规',
    note: '以下法律正文为保持法条语义一致，统一以标准英文呈现。',
  },
  'zh-tw': {
    brand: 'Agnopol',
    back: '返回',
    title: '法律頁面',
    subtitle: '服務條款、隱私、風險與合規揭露。',
    toc: '目錄',
    terms: '服務條款',
    privacy: '隱私政策',
    risk: '風險揭露',
    aml: '反洗錢與制裁合規',
    note: '以下法律正文為保持法條語義一致，統一以標準英文呈現。',
  },
}

const LEGAL = {
  tosTitle: 'Terms of Service & Conduit Protocol',
  tosControl: 'Control No.: AGN-TOS-2026-FINAL',
  tosLaw:
    'Governing Law: Laws of the United States and the Commonwealth of Massachusetts',
  tosSections: [
    'Contract Formation. To the fullest extent permitted by applicable law, including the Electronic Signatures in Global and National Commerce Act, the precise moment at which you initiate any transaction or instruction to any ledger address associated with Agnopol may constitute affirmative electronic assent to these terms and related instruments.',
    'Conduit Characterization & Non-Entity. Agnopol is not presented as the issuer or merchant of any third-party digital entitlement. The interface is positioned as a neutral technical routing conduit that transmits automated cryptographic instructions. No agency, trust, fiduciary, partnership, or representative relationship is created by your use of the conduit.',
    'Asset Transfers & Finality. Performance by the conduit shall be deemed completed when the relevant API or routing instruction is successfully transmitted to the designated third-party gateway. Thereafter, delays, refusals, account restrictions, or downstream policy outcomes attributable to third parties shall fall outside the conduit’s completed transmission obligation.',
    'Final Sale & Routing Failure. All sales are final except where a refund is required by applicable law. You are solely responsible for the accuracy of submitted identifiers, addresses, target accounts, and formatting. In the limited event of complete routing failure caused by severe network disruption or underlying infrastructure failure, and where an automated return is technically triggered, network fees and a routing termination fee equal to the greater of 10% of principal or 5 USDT may be retained as a reasonable pre-estimate of administrative loss and not as a penalty, to the extent permitted by applicable law.',
    'Dispute Resolution & Waivers. Any dispute shall, to the fullest extent enforceable, be submitted to binding English-language arbitration administered by the International Centre for Dispute Resolution (ICDR) in Boston, Massachusetts, United States. Any class-action waiver, jury-trial waiver, or court-access limitation shall apply only to the extent enforceable under governing law.',
  ],
  privacyTitle: 'Privacy & Ephemeral Data Policy',
  privacyControl: 'Control No.: AGN-PRIV-2026-FINAL',
  privacyLevel: 'Data Classification: Zero-Knowledge / Ephemeral Obliteration',
  privacySections: [
    'Zero-Retention Architecture. Agnopol follows a strict data-minimization model and does not intentionally maintain a persistent registry of real names, physical addresses, or direct identity-linkage matrices unless technically necessary for service operation.',
    'Ephemeral Logs & Best-Effort Purge. Transient metadata generated in routing, including but not limited to IP fragments, hashes, and target identifiers, may exist only in volatile memory or short-lived infrastructure logs. Agnopol undertakes commercially reasonable best efforts to purge such transient artifacts within 48 hours after instruction completion.',
    'Technical Limitations. Because of caching layers, infrastructure snapshots, public-network propagation, and blockchain immutability, all deletion operates strictly on a best-effort basis. Agnopol disclaims any guarantee of absolute irrecoverability.',
    'Access Requests. Any request for access, deletion, correction, audit, or historical retrieval shall be handled only to the extent technically feasible and legally required. Where the architecture is ephemeral and non-persistent, fulfillment may be impossible in practice.',
  ],
  riskTitle: 'Risk & Jurisdiction Disclosures',
  riskControl: 'Control No.: AGN-RISK-2026-FINAL',
  riskSections: [
    'Restricted Territories. Access is prohibited from jurisdictions or territories that impose anti-crypto-asset prohibitions, strict capital controls, sanctions restrictions, or comparable sovereign limitations. You are solely responsible for compliance with the laws applicable to your location.',
    'Fraudulent Access & Assumption of Risk. Use of VPNs, proxy servers, or other masking tools to circumvent territorial restrictions may constitute material fraud against Agnopol. Any legal, financial, regulatory, or confiscatory consequence arising from such access remains solely your responsibility.',
    'Network Intervention Immunity. Agnopol is not responsible for transaction failure, denial of access, or inability to obtain entitlements caused by deep packet inspection, DNS interference, sovereign firewalls, internal filtering systems, or equivalent censorship infrastructure.',
    'Absolute Cap on Liability. To the fullest extent permitted by applicable law, Agnopol’s aggregate liability arising from any single transaction shall not exceed the net administrative fee actually retained in connection with that transaction, excluding principal and blockchain network fees.',
  ],
  amlTitle: 'AML & Sanctions Compliance',
  amlControl: 'Control No.: AGN-AML-2026-FINAL',
  amlSections: [
    'Non-MSB Position. Agnopol presents itself as a neutral technical conduit and not as a money services business, financial institution, or regulated custodian; however, this statement is a legal position only and not a conclusive regulatory determination, which may depend on specific facts and circumstances.',
    'Sanctions & Illicit Funds Exclusion. You represent on a continuing basis that you are not subject to applicable sanctions restrictions and that any digital assets used through this conduit do not derive from illicit sources, including but not limited to telecom fraud, darknet transactions, unlawful gambling, mixer protocols, terrorist financing, or sanctions evasion.',
    'Absolute Prohibition of Illicit Utilization. You shall not use the conduit or any related routing interface for money laundering, cyber fraud, terrorist financing, illegal gambling, sanctions evasion, or any unlawful conduct under applicable local, federal, or international law. Any such attempt constitutes material fraud against Agnopol.',
  ],
}

function Section(props: {
  id: string
  title: string
  control?: string
  subtitle?: string
  sections: string[]
}) {
  return (
    <section
      id={props.id}
      style={{
        padding: 20,
        borderRadius: 18,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255,255,255,0.82)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
        backdropFilter: 'blur(10px)',
        scrollMarginTop: 24,
      }}
    >
      <h2
        style={{
          margin: '0 0 10px 0',
          fontSize: 'clamp(22px, 3vw, 30px)',
          color: '#0f172a',
        }}
      >
        {props.title}
      </h2>

      {props.control ? <p style={{ margin: '0 0 8px 0', color: '#475569' }}>{props.control}</p> : null}
      {props.subtitle ? <p style={{ margin: '0 0 12px 0', color: '#475569' }}>{props.subtitle}</p> : null}

      {props.sections.map((item, index) => (
        <p key={index} style={{ margin: '0 0 12px 0', color: '#334155', lineHeight: 1.8 }}>
          {item}
        </p>
      ))}
    </section>
  )
}

export default function LegalPage() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get('lang') as LangType | null

  const lang = useMemo<LangType>(() => {
    if (
      langParam === 'de' ||
      langParam === 'en' ||
      langParam === 'es' ||
      langParam === 'fr' ||
      langParam === 'ja' ||
      langParam === 'ko' ||
      langParam === 'zh-cn' ||
      langParam === 'zh-tw'
    ) {
      return langParam
    }
    return 'en'
  }, [langParam])

  const t = legalUi[lang]

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
          <a
            href={`/?lang=${lang}`}
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontSize: 14,
            }}
          >
            ← {t.back}
          </a>
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
            {t.brand}
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
          <div style={{ color: '#475569', fontWeight: 800 }}>{t.toc}</div>
          <div className="legal-toc">
            <a href="#terms">{t.terms}</a>
            <a href="#privacy">{t.privacy}</a>
            <a href="#risk">{t.risk}</a>
            <a href="#aml">{t.aml}</a>
          </div>
        </div>

        <div className="legal-grid">
          <Section
            id="terms"
            title={LEGAL.tosTitle}
            control={LEGAL.tosControl}
            subtitle={LEGAL.tosLaw}
            sections={LEGAL.tosSections}
          />

          <Section
            id="privacy"
            title={LEGAL.privacyTitle}
            control={LEGAL.privacyControl}
            subtitle={LEGAL.privacyLevel}
            sections={LEGAL.privacySections}
          />

          <Section
            id="risk"
            title={LEGAL.riskTitle}
            control={LEGAL.riskControl}
            sections={LEGAL.riskSections}
          />

          <Section
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
