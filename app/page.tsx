'use client'

import { useEffect, useMemo, useState } from 'react'

type LangType = 'de' | 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'zh-cn' | 'zh-tw'
type ProductType = 'premium' | 'stars'
type DurationType = '3m' | '6m' | '12m'

type PriceData = {
  tg_premium_3m: number
  tg_premium_6m: number
  tg_premium_12m: number
  tg_stars_rate: number
}

const languageOptions: { code: LangType; label: string }[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-cn', label: '简体中文' },
  { code: 'zh-tw', label: '繁體中文' },
]

const messages: Record<
  LangType,
  {
    brand: string
    slogan: string
    premiumTitle: string
    starsTitle: string
    tabPremium: string
    tabStars: string
    plan3m: string
    plan6m: string
    plan12m: string
    currentSelection: string
    emailPlaceholder: string
    createOrder: string
    starsInputLabel: string
    starsInputPlaceholder: string
    starsMinHint: string
    starsPriceHint: string
    selectedPremium: string
    selectedStars: string
    disclaimer: string
    rights: string
    affiliation: string
    paymentWarning: string
    loading: string
  }
> = {
  de: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'TG Premium Pläne',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3 Monate',
    plan6m: '6 Monate',
    plan12m: '12 Monate',
    currentSelection: 'Aktuelle Auswahl',
    emailPlaceholder: 'E-Mail',
    createOrder: 'Bestellung erstellen',
    starsInputLabel: 'Stars Menge',
    starsInputPlaceholder: 'Mindestens 50',
    starsMinHint: 'Mindestbestellmenge: 50 Stars',
    starsPriceHint: 'Preis wird automatisch berechnet',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      'Hinweis: Dieser Dienst ist eine unabhängige Plattform und nicht mit Telegram verbunden. Alle digitalen Produkte werden virtuell geliefert und sind nach Bearbeitung nicht erstattungsfähig.',
    rights: '© {year} Agnopol. Alle Rechte vorbehalten.',
    affiliation:
      'Agnopol ist ein unabhängiger digitaler Dienstleister und steht in keiner Verbindung zu Telegram. Alle Marken und Produktnamen gehören ihren jeweiligen Inhabern.',
    paymentWarning:
      'Zahlungen müssen über das richtige Netzwerk und in exakt passender Höhe erfolgen. Falsche Zahlungen können zu einer fehlgeschlagenen Lieferung führen.',
    loading: 'Laden...',
  },
  en: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'TG Premium Plans',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3 Months',
    plan6m: '6 Months',
    plan12m: '12 Months',
    currentSelection: 'Current Selection',
    emailPlaceholder: 'Email',
    createOrder: 'Create Order',
    starsInputLabel: 'Stars Amount',
    starsInputPlaceholder: 'Minimum 50',
    starsMinHint: 'Minimum order: 50 stars',
    starsPriceHint: 'Price is calculated automatically',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      'Disclaimer: This service is an independent platform and is not affiliated with Telegram. All digital products are delivered virtually and are non-refundable once processed.',
    rights: '© {year} Agnopol. All rights reserved.',
    affiliation:
      'Agnopol is an independent digital service provider and is not affiliated with Telegram. All trademarks and product names belong to their respective owners.',
    paymentWarning:
      'Payments must be made using the correct network and exact amount. Incorrect payments may result in failed delivery.',
    loading: 'Loading...',
  },
  es: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'Planes TG Premium',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3 Meses',
    plan6m: '6 Meses',
    plan12m: '12 Meses',
    currentSelection: 'Selección actual',
    emailPlaceholder: 'Correo electrónico',
    createOrder: 'Crear pedido',
    starsInputLabel: 'Cantidad de Stars',
    starsInputPlaceholder: 'Mínimo 50',
    starsMinHint: 'Pedido mínimo: 50 stars',
    starsPriceHint: 'El precio se calcula automáticamente',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      'Aviso: Este servicio es una plataforma independiente y no está afiliada con Telegram. Todos los productos digitales se entregan virtualmente y no son reembolsables una vez procesados.',
    rights: '© {year} Agnopol. Todos los derechos reservados.',
    affiliation:
      'Agnopol es un proveedor independiente de servicios digitales y no está afiliado con Telegram. Todas las marcas y nombres de productos pertenecen a sus respectivos propietarios.',
    paymentWarning:
      'Los pagos deben realizarse usando la red correcta y el importe exacto. Los pagos incorrectos pueden causar fallos en la entrega.',
    loading: 'Cargando...',
  },
  fr: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'Offres TG Premium',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3 Mois',
    plan6m: '6 Mois',
    plan12m: '12 Mois',
    currentSelection: 'Sélection actuelle',
    emailPlaceholder: 'E-mail',
    createOrder: 'Créer la commande',
    starsInputLabel: 'Quantité de Stars',
    starsInputPlaceholder: 'Minimum 50',
    starsMinHint: 'Commande minimum : 50 stars',
    starsPriceHint: 'Le prix est calculé automatiquement',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      'Avertissement : Ce service est une plateforme indépendante et n’est pas affiliée à Telegram. Tous les produits numériques sont livrés virtuellement et ne sont pas remboursables une fois traités.',
    rights: '© {year} Agnopol. Tous droits réservés.',
    affiliation:
      'Agnopol est un prestataire indépendant de services numériques et n’est pas affilié à Telegram. Toutes les marques et tous les noms de produits appartiennent à leurs propriétaires respectifs.',
    paymentWarning:
      'Les paiements doivent être effectués sur le bon réseau et pour le montant exact. Des paiements incorrects peuvent entraîner un échec de livraison.',
    loading: 'Chargement...',
  },
  ja: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'TG Premium プラン',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3か月',
    plan6m: '6か月',
    plan12m: '12か月',
    currentSelection: '現在の選択',
    emailPlaceholder: 'メールアドレス',
    createOrder: '注文を作成',
    starsInputLabel: 'Stars 数量',
    starsInputPlaceholder: '最低 50',
    starsMinHint: '最低注文数：50 Stars',
    starsPriceHint: '価格は自動計算されます',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      '免責事項：このサービスは独立したプラットフォームであり、Telegram とは提携していません。すべてのデジタル商品はバーチャルで提供され、処理後の返金はできません。',
    rights: '© {year} Agnopol. All rights reserved.',
    affiliation:
      'Agnopol は独立したデジタルサービス事業者であり、Telegram とは提携していません。すべての商標および製品名は各権利者に帰属します。',
    paymentWarning:
      '支払いは正しいネットワークと正確な金額で行う必要があります。誤った支払いは配達失敗の原因となる場合があります。',
    loading: '読み込み中...',
  },
  ko: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'TG Premium 플랜',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3개월',
    plan6m: '6개월',
    plan12m: '12개월',
    currentSelection: '현재 선택',
    emailPlaceholder: '이메일',
    createOrder: '주문 생성',
    starsInputLabel: 'Stars 수량',
    starsInputPlaceholder: '최소 50',
    starsMinHint: '최소 주문: 50 stars',
    starsPriceHint: '가격은 자동으로 계산됩니다',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      '고지: 이 서비스는 독립 플랫폼이며 Telegram과 제휴되어 있지 않습니다. 모든 디지털 상품은 가상으로 제공되며 처리 후 환불되지 않습니다.',
    rights: '© {year} Agnopol. All rights reserved.',
    affiliation:
      'Agnopol은 독립 디지털 서비스 제공업체이며 Telegram과 제휴되어 있지 않습니다. 모든 상표와 제품명은 각 소유자에게 귀속됩니다.',
    paymentWarning:
      '결제는 올바른 네트워크와 정확한 금액으로 이루어져야 합니다. 잘못된 결제는 배송 실패를 초래할 수 있습니다.',
    loading: '로딩 중...',
  },
  'zh-cn': {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'TG Premium 套餐',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3个月',
    plan6m: '6个月',
    plan12m: '12个月',
    currentSelection: '当前选择',
    emailPlaceholder: '电子邮件',
    createOrder: '创建订单',
    starsInputLabel: 'Stars 数量',
    starsInputPlaceholder: '最少 50',
    starsMinHint: '最低下单数量：50 Stars',
    starsPriceHint: '价格将自动计算',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      '免责声明：本服务为独立平台，与 Telegram 无关联。所有数字商品均为虚拟交付，一经处理不支持退款。',
    rights: '© {year} Agnopol。保留所有权利。',
    affiliation:
      'Agnopol 是独立数字服务提供商，与 Telegram 无关联。所有商标及产品名称归其各自权利人所有。',
    paymentWarning:
      '支付必须使用正确网络并保证金额完全一致。错误支付可能导致交付失败。',
    loading: '加载中...',
  },
  'zh-tw': {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    premiumTitle: 'TG Premium 方案',
    starsTitle: 'TG Stars',
    tabPremium: 'Premium',
    tabStars: 'Stars',
    plan3m: '3個月',
    plan6m: '6個月',
    plan12m: '12個月',
    currentSelection: '目前選擇',
    emailPlaceholder: '電子郵件',
    createOrder: '建立訂單',
    starsInputLabel: 'Stars 數量',
    starsInputPlaceholder: '最少 50',
    starsMinHint: '最低下單數量：50 Stars',
    starsPriceHint: '價格將自動計算',
    selectedPremium: 'TG Premium',
    selectedStars: 'TG Stars',
    disclaimer:
      '免責聲明：本服務為獨立平台，與 Telegram 無關聯。所有數位商品均為虛擬交付，一經處理不支援退款。',
    rights: '© {year} Agnopol。保留所有權利。',
    affiliation:
      'Agnopol 是獨立數位服務提供商，與 Telegram 無關聯。所有商標及產品名稱均屬其各自權利人所有。',
    paymentWarning:
      '支付必須使用正確網路並保證金額完全一致。錯誤支付可能導致交付失敗。',
    loading: '載入中...',
  },
}

export default function Home() {
  const [prices, setPrices] = useState<PriceData | null>(null)
  const [lang, setLang] = useState<LangType>('en')
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('premium')
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('12m')
  const [starsAmount, setStarsAmount] = useState<string>('50')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/getPrices')
      .then((res) => res.json())
      .then((data) => {
        setPrices({
          tg_premium_3m: Number(data.tg_premium_3m),
          tg_premium_6m: Number(data.tg_premium_6m),
          tg_premium_12m: Number(data.tg_premium_12m),
          tg_stars_rate: Number(data.tg_stars_rate),
        })
      })
      .catch(() => {
        setPrices(null)
      })
  }, [])

  const t = messages[lang]
  const currentYear = new Date().getFullYear()

  const safeStarsAmount = useMemo(() => {
    const num = Number(starsAmount)
    if (!Number.isFinite(num)) return 50
    if (num < 50) return 50
    return Math.floor(num)
  }, [starsAmount])

  const currentPremiumPrice = useMemo(() => {
    if (!prices) return null
    if (selectedDuration === '3m') return prices.tg_premium_3m
    if (selectedDuration === '6m') return prices.tg_premium_6m
    return prices.tg_premium_12m
  }, [prices, selectedDuration])

  const currentStarsPrice = useMemo(() => {
    if (!prices) return null
    return Number((safeStarsAmount * prices.tg_stars_rate).toFixed(2))
  }, [prices, safeStarsAmount])

  const selectedTitle = useMemo(() => {
    if (selectedProduct === 'premium') {
      const durationLabel =
        selectedDuration === '3m'
          ? t.plan3m
          : selectedDuration === '6m'
          ? t.plan6m
          : t.plan12m
      return `${t.selectedPremium} ${durationLabel}`
    }
    return `${t.selectedStars} ${safeStarsAmount}`
  }, [selectedProduct, selectedDuration, safeStarsAmount, t])

  const selectedPrice =
    selectedProduct === 'premium' ? currentPremiumPrice : currentStarsPrice

  function cardStyle(active: boolean): React.CSSProperties {
    return {
      padding: 18,
      borderRadius: 18,
      border: active ? '1px solid #0b1733' : '1px solid #d1d5db',
      background: active ? '#0b1733' : '#ffffff',
      color: active ? '#ffffff' : '#111827',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      boxSizing: 'border-box',
      minHeight: 108,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }
  }

  function tabStyle(active: boolean): React.CSSProperties {
    return {
      flex: 1,
      minWidth: 0,
      padding: '12px 14px',
      borderRadius: 12,
      border: active ? '1px solid #0b1733' : '1px solid #d1d5db',
      background: active ? '#0b1733' : '#ffffff',
      color: active ? '#ffffff' : '#111827',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }
  }

  function handleCreateOrder() {
    const params = new URLSearchParams()

    params.set('lang', lang)
    params.set('email', email)

    if (selectedProduct === 'premium') {
      params.set('product_type', 'tg_premium')
      params.set('duration', selectedDuration)
      params.set('price_usd', String(currentPremiumPrice ?? ''))
    } else {
      params.set('product_type', 'tg_stars')
      params.set('stars_amount', String(safeStarsAmount))
      params.set('price_usd', String(currentStarsPrice ?? ''))
    }

    window.location.href = `/pay?${params.toString()}`
  }

  return (
    <main
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '20px 16px 36px',
        fontFamily: 'system-ui, Arial, sans-serif',
        background: '#ffffff',
      }}
    >
      <style>{`
        .agnopol-shell {
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
        }

        .agnopol-lang-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 18px;
        }

        .agnopol-lang-box {
          width: 100%;
          max-width: 220px;
        }

        .agnopol-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .agnopol-plan-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 900px) {
          .agnopol-plan-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .agnopol-lang-box {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="agnopol-shell">
        <div className="agnopol-lang-row">
          <div className="agnopol-lang-box">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangType)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                fontSize: 16,
                boxSizing: 'border-box',
              }}
            >
              {languageOptions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 'clamp(34px, 6vw, 58px)',
              fontWeight: 800,
              margin: 0,
              color: '#111827',
              lineHeight: 1.03,
              wordBreak: 'break-word',
            }}
          >
            {t.brand}
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: '#6b7280',
              fontSize: 'clamp(15px, 2.4vw, 18px)',
              fontWeight: 500,
            }}
          >
            {t.slogan}
          </p>
        </section>

        <div className="agnopol-tabs">
          <button
            type="button"
            onClick={() => setSelectedProduct('premium')}
            style={tabStyle(selectedProduct === 'premium')}
          >
            {t.tabPremium}
          </button>
          <button
            type="button"
            onClick={() => setSelectedProduct('stars')}
            style={tabStyle(selectedProduct === 'stars')}
          >
            {t.tabStars}
          </button>
        </div>

        {selectedProduct === 'premium' ? (
          <>
            <p style={{ fontSize: 18, marginBottom: 12, color: '#4b5563' }}>
              {t.premiumTitle}
            </p>

            <div className="agnopol-plan-grid">
              <div
                onClick={() => setSelectedDuration('3m')}
                style={cardStyle(selectedDuration === '3m')}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{t.plan3m}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800 }}>
                  ${prices ? prices.tg_premium_3m : t.loading}
                </div>
              </div>

              <div
                onClick={() => setSelectedDuration('6m')}
                style={cardStyle(selectedDuration === '6m')}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{t.plan6m}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800 }}>
                  ${prices ? prices.tg_premium_6m : t.loading}
                </div>
              </div>

              <div
                onClick={() => setSelectedDuration('12m')}
                style={cardStyle(selectedDuration === '12m')}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{t.plan12m}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800 }}>
                  ${prices ? prices.tg_premium_12m : t.loading}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 18, marginBottom: 12, color: '#4b5563' }}>
              {t.starsTitle}
            </p>

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
                {t.starsInputLabel}
              </div>

              <input
                type="number"
                min={50}
                step={1}
                value={starsAmount}
                onChange={(e) => setStarsAmount(e.target.value)}
                placeholder={t.starsInputPlaceholder}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid #d1d5db',
                  fontSize: 16,
                }}
              />

              <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
                {t.starsMinHint}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>
                {t.starsPriceHint}
              </div>
            </div>
          </>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            border: '1px solid #e5e7eb',
            background: '#f8fafc',
          }}
        >
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            {t.currentSelection}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
            {selectedTitle}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 'clamp(28px, 5vw, 38px)',
              fontWeight: 800,
              color: '#111827',
              wordBreak: 'break-word',
            }}
          >
            {selectedPrice === null ? t.loading : `$${selectedPrice}`}
          </div>
        </div>

        <input
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            marginTop: 20,
            width: '100%',
            boxSizing: 'border-box',
            padding: 14,
            borderRadius: 14,
            border: '1px solid #d1d5db',
            fontSize: 16,
          }}
        />

        <button
          onClick={handleCreateOrder}
          style={{
            marginTop: 18,
            width: '100%',
            padding: 16,
            background: '#0b1733',
            color: '#ffffff',
            borderRadius: 14,
            border: 'none',
            fontWeight: 800,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          {t.createOrder}
        </button>

        <footer
          style={{
            marginTop: 32,
            paddingTop: 18,
            borderTop: '1px solid #e5e7eb',
            fontSize: 12,
            color: '#6b7280',
            lineHeight: 1.7,
          }}
        >
          <p>{t.rights.replace('{year}', String(currentYear))}</p>
          <p>{t.disclaimer}</p>
          <p>{t.affiliation}</p>
          <p>{t.paymentWarning}</p>
        </footer>
      </div>
    </main>
  )
}
