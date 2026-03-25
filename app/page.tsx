'use client'

import { Suspense, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useI18n } from '../components/language-provider'
import LanguageSwitcher from '../components/language-switcher'
import ThemeToggle from '../components/theme-toggle'
import { withLang } from '../lib/i18n'

type ProductType = 'premium' | 'stars'
type DurationType = '3m' | '6m' | '12m'

type OrderResult = {
  order_no: string
  status: string
  product_type: string | null
  duration: string | null
  stars_amount: number | null
  amount: number | null
  price_usd: number | null
  payment_network: string | null
  created_at: string | null
  public_note: string | null
  tx_hash: string | null
}

type PublicConfig = {
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  trc20_address: string
  base_address: string
  updated_at?: string
}

type LookupUi = {
  title: string
  subtitle: string
  placeholder: string
  button: string
  loading: string
  orderNo: string
  email: string
  status: string
  product: string
  amount: string
  network: string
  createdAt: string
  note: string
  txHash: string
  resubmit: string
  proofReady: string
  hashPlaceholder: string
  resubmitButton: string
  resubmitting: string
  noOrders: string
  pending: string
  paid: string
  completed: string
  cancelled: string
  resubmitSuccess: string
  resubmitError: string
}

const defaultConfig: PublicConfig = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  trc20_address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  base_address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
}

const LOOKUP_UI: Record<string, LookupUi> = {
  de: {
    title: 'Bestellabfrage',
    subtitle:
      'Geben Sie Ihre Bestell-E-Mail ein, um Status, Systemhinweise und eine erneute Einreichung des Zahlungsnachweises nach Admin-Hinweis zu prüfen.',
    placeholder: 'Bestell-E-Mail eingeben',
    button: 'Bestellung prüfen',
    loading: 'Wird geprüft...',
    orderNo: 'Bestellnummer',
    email: 'E-Mail',
    status: 'Status',
    product: 'Produkt',
    amount: 'Betrag',
    network: 'Zahlungsnetzwerk',
    createdAt: 'Erstellt am',
    note: 'Systemhinweis',
    txHash: 'Transaktions-Hash',
    resubmit: 'Nachweis erneut hochladen',
    proofReady: 'Neuer Nachweis ist bereit:',
    hashPlaceholder: 'Transaktions-Hash erneut eingeben (optional)',
    resubmitButton: 'Neuen Nachweis senden',
    resubmitting: 'Wird gesendet...',
    noOrders: 'Keine passenden Bestellungen gefunden.',
    pending: 'Ausstehende Zahlung',
    paid: 'Bezahlt',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    resubmitSuccess:
      'Der neue Zahlungsnachweis wurde erfolgreich übermittelt. Bitte prüfen Sie den Bestellstatus später erneut.',
    resubmitError: 'Der Zahlungsnachweis konnte nicht erneut übermittelt werden.',
  },
  en: {
    title: 'Order Lookup',
    subtitle:
      'Enter your order email to check status, system notices, and resubmit payment proof only when instructed by admin.',
    placeholder: 'Enter your order email',
    button: 'Check Orders',
    loading: 'Loading...',
    orderNo: 'Order No',
    email: 'Email',
    status: 'Status',
    product: 'Product',
    amount: 'Amount',
    network: 'Payment Network',
    createdAt: 'Created At',
    note: 'System Notice',
    txHash: 'Transaction Hash',
    resubmit: 'Resubmit Proof',
    proofReady: 'New proof ready:',
    hashPlaceholder: 'Resubmit transaction hash (optional)',
    resubmitButton: 'Submit New Proof',
    resubmitting: 'Submitting...',
    noOrders: 'No matching orders found.',
    pending: 'Pending Payment',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
    resubmitSuccess: 'Updated payment proof submitted successfully. Please check the order again later.',
    resubmitError: 'Failed to resubmit payment proof.',
  },
  es: {
    title: 'Consulta de pedido',
    subtitle:
      'Introduzca el correo de su pedido para comprobar el estado, los avisos del sistema y volver a enviar el comprobante de pago cuando el administrador lo indique.',
    placeholder: 'Introduzca el correo del pedido',
    button: 'Consultar pedido',
    loading: 'Consultando...',
    orderNo: 'Número de pedido',
    email: 'Correo electrónico',
    status: 'Estado',
    product: 'Producto',
    amount: 'Importe',
    network: 'Red de pago',
    createdAt: 'Fecha de creación',
    note: 'Aviso del sistema',
    txHash: 'Hash de transacción',
    resubmit: 'Volver a subir comprobante',
    proofReady: 'El nuevo comprobante está listo:',
    hashPlaceholder: 'Volver a escribir el hash de transacción (opcional)',
    resubmitButton: 'Enviar nuevo comprobante',
    resubmitting: 'Enviando...',
    noOrders: 'No se encontraron pedidos relacionados.',
    pending: 'Pago pendiente',
    paid: 'Pagado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    resubmitSuccess:
      'El nuevo comprobante de pago se ha enviado correctamente. Vuelva a consultar el estado del pedido más tarde.',
    resubmitError: 'No se pudo reenviar el comprobante de pago.',
  },
  fr: {
    title: 'Recherche de commande',
    subtitle:
      "Entrez l'e-mail de votre commande pour consulter le statut, les avis du système et renvoyer la preuve de paiement si l'administrateur le demande.",
    placeholder: "Entrez l'e-mail de commande",
    button: 'Rechercher la commande',
    loading: 'Recherche en cours...',
    orderNo: 'N° de commande',
    email: 'E-mail',
    status: 'Statut',
    product: 'Produit',
    amount: 'Montant',
    network: 'Réseau de paiement',
    createdAt: 'Créé le',
    note: 'Avis du système',
    txHash: 'Hash de transaction',
    resubmit: 'Téléverser à nouveau la preuve',
    proofReady: 'La nouvelle preuve est prête :',
    hashPlaceholder: 'Saisir à nouveau le hash de transaction (facultatif)',
    resubmitButton: 'Envoyer la nouvelle preuve',
    resubmitting: 'Envoi...',
    noOrders: 'Aucune commande correspondante trouvée.',
    pending: 'Paiement en attente',
    paid: 'Payé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    resubmitSuccess:
      'La nouvelle preuve de paiement a été envoyée avec succès. Veuillez consulter à nouveau le statut plus tard.',
    resubmitError: "Échec de l'envoi de la nouvelle preuve de paiement.",
  },
  ja: {
    title: '注文照会',
    subtitle:
      '注文時のメールアドレスを入力すると、注文状況、システム案内、管理者の案内に従った支払い証明の再提出を確認できます。',
    placeholder: '注文メールアドレスを入力',
    button: '注文を確認',
    loading: '照会中...',
    orderNo: '注文番号',
    email: 'メール',
    status: '状態',
    product: '商品',
    amount: '金額',
    network: '支払いネットワーク',
    createdAt: '作成時間',
    note: 'システム案内',
    txHash: 'トランザクションハッシュ',
    resubmit: '証明を再アップロード',
    proofReady: '新しい証明の準備ができました：',
    hashPlaceholder: 'トランザクションハッシュを再入力（任意）',
    resubmitButton: '新しい証明を送信',
    resubmitting: '送信中...',
    noOrders: '関連する注文が見つかりませんでした。',
    pending: '未払い',
    paid: '支払い済み',
    completed: '完了',
    cancelled: 'キャンセル済み',
    resubmitSuccess:
      '新しい支払い証明が正常に送信されました。しばらくしてから注文状況を再度ご確認ください。',
    resubmitError: '支払い証明の再送信に失敗しました。',
  },
  ko: {
    title: '주문 조회',
    subtitle:
      '주문 이메일을 입력하면 주문 상태, 시스템 안내, 그리고 관리자 안내에 따른 결제 증빙 재제출 여부를 확인할 수 있습니다.',
    placeholder: '주문 이메일 입력',
    button: '주문 조회',
    loading: '조회 중...',
    orderNo: '주문번호',
    email: '이메일',
    status: '상태',
    product: '상품',
    amount: '금액',
    network: '결제 네트워크',
    createdAt: '생성 시간',
    note: '시스템 안내',
    txHash: '거래 해시',
    resubmit: '증빙 다시 업로드',
    proofReady: '새 증빙이 준비되었습니다:',
    hashPlaceholder: '거래 해시 다시 입력 (선택)',
    resubmitButton: '새 증빙 제출',
    resubmitting: '제출 중...',
    noOrders: '관련 주문을 찾지 못했습니다.',
    pending: '미결제',
    paid: '결제됨',
    completed: '완료됨',
    cancelled: '취소됨',
    resubmitSuccess:
      '새 결제 증빙이 성공적으로 제출되었습니다. 잠시 후 주문 상태를 다시 조회하세요.',
    resubmitError: '결제 증빙 재제출에 실패했습니다.',
  },
  'zh-cn': {
    title: '订单查询',
    subtitle: '输入下单邮箱查询订单状态、系统提示，并可按后台提示重新补交付款凭证。',
    placeholder: '输入下单邮箱',
    button: '查询订单',
    loading: '查询中...',
    orderNo: '订单号',
    email: '邮箱',
    status: '状态',
    product: '产品',
    amount: '金额',
    network: '支付网络',
    createdAt: '创建时间',
    note: '系统提示',
    txHash: '交易哈希',
    resubmit: '重新上传凭证',
    proofReady: '新凭证已就绪：',
    hashPlaceholder: '重新填写交易哈希（可选）',
    resubmitButton: '提交新的凭证',
    resubmitting: '提交中...',
    noOrders: '未找到相关订单。',
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    resubmitSuccess: '新的付款凭证已提交成功，请稍后重新查询订单状态。',
    resubmitError: '重新提交付款凭证失败。',
  },
  'zh-tw': {
    title: '訂單查詢',
    subtitle: '輸入下單電子郵件查詢訂單狀態、系統提示，並可按後台提示重新補交付款憑證。',
    placeholder: '輸入下單電子郵件',
    button: '查詢訂單',
    loading: '查詢中...',
    orderNo: '訂單號',
    email: '電子郵件',
    status: '狀態',
    product: '產品',
    amount: '金額',
    network: '支付網路',
    createdAt: '建立時間',
    note: '系統提示',
    txHash: '交易哈希',
    resubmit: '重新上傳憑證',
    proofReady: '新憑證已就緒：',
    hashPlaceholder: '重新填寫交易哈希（可選）',
    resubmitButton: '提交新的憑證',
    resubmitting: '提交中...',
    noOrders: '未找到相關訂單。',
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    resubmitSuccess: '新的付款憑證已提交成功，請稍後重新查詢訂單狀態。',
    resubmitError: '重新提交付款憑證失敗。',
  },
}

const NAV_UI: Record<string, { preparing: string; redirecting: string }> = {
  de: { preparing: 'Bestellung wird vorbereitet...', redirecting: 'Weiter zur Zahlungsseite' },
  en: { preparing: 'Preparing your order...', redirecting: 'Redirecting to payment page' },
  es: { preparing: 'Preparando su pedido...', redirecting: 'Redirigiendo a la página de pago' },
  fr: { preparing: 'Préparation de votre commande...', redirecting: 'Redirection vers la page de paiement' },
  ja: { preparing: 'ご注文を準備中...', redirecting: '支払いページへ移動しています' },
  ko: { preparing: '주문을 준비하는 중...', redirecting: '결제 페이지로 이동 중' },
  'zh-cn': { preparing: '正在准备订单...', redirecting: '正在跳转支付页' },
  'zh-tw': { preparing: '正在準備訂單...', redirecting: '正在跳轉支付頁' },
}

const HOME_FORM_ERRORS: Record<string, { username: string; email: string; emailInvalid: string }> = {
  de: {
    username: 'Bitte geben Sie Ihren Telegram-Benutzernamen ein.',
    email: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
    emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
  },
  en: {
    username: 'Please enter your Telegram username.',
    email: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
  },
  es: {
    username: 'Por favor, introduzca su nombre de usuario de Telegram.',
    email: 'Por favor, introduzca su correo electrónico.',
    emailInvalid: 'Por favor, introduzca un correo electrónico válido.',
  },
  fr: {
    username: "Veuillez saisir votre nom d'utilisateur Telegram.",
    email: 'Veuillez saisir votre e-mail.',
    emailInvalid: 'Veuillez saisir une adresse e-mail valide.',
  },
  ja: {
    username: 'Telegramユーザー名を入力してください。',
    email: 'メールアドレスを入力してください。',
    emailInvalid: '有効なメールアドレスを入力してください。',
  },
  ko: {
    username: 'Telegram 사용자명을 입력하세요.',
    email: '이메일을 입력하세요.',
    emailInvalid: '올바른 이메일 주소를 입력하세요.',
  },
  'zh-cn': {
    username: '请输入 TG 用户名。',
    email: '请输入邮箱地址。',
    emailInvalid: '请输入有效的邮箱地址。',
  },
  'zh-tw': {
    username: '請輸入 TG 用戶名。',
    email: '請輸入電子郵件地址。',
    emailInvalid: '請輸入有效的電子郵件地址。',
  },
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getHomeFormError(lang: string, key: 'username' | 'email' | 'emailInvalid') {
  const messages = HOME_FORM_ERRORS[lang] || HOME_FORM_ERRORS.en
  return messages[key]
}

function formatBostonTime(value: string | null) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return value
  }
}

function OrderLookupSection() {
  const { t, lang } = useI18n()
  const ui = LOOKUP_UI[lang] || LOOKUP_UI.en

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [results, setResults] = useState<OrderResult[]>([])

  const [activeOrderNo, setActiveOrderNo] = useState('')
  const [resubmitHash, setResubmitHash] = useState('')
  const [resubmitProofName, setResubmitProofName] = useState('')
  const [resubmitProofBase64, setResubmitProofBase64] = useState('')
  const [resubmitLoading, setResubmitLoading] = useState(false)
  const [resubmitMessage, setResubmitMessage] = useState('')
  const [resubmitError, setResubmitError] = useState('')

  function getProductLabel(item: OrderResult) {
    if (item.product_type === 'tg_stars') {
      return `${t.home.tgStars} ${item.stars_amount ?? 0}`
    }
    if (item.duration === '3m') return `${t.home.tgPremium} ${t.home.months3}`
    if (item.duration === '6m') return `${t.home.tgPremium} ${t.home.months6}`
    return `${t.home.tgPremium} ${t.home.months12}`
  }

  function getStatusLabel(status: string | null | undefined) {
    const value = String(status || '').toLowerCase()
    if (value === 'pending' || value === 'pending_payment') return ui.pending
    if (value === 'paid') return ui.paid
    if (value === 'completed') return ui.completed
    if (value === 'failed' || value === 'cancelled') return ui.cancelled
    return status || '-'
  }

  async function handleLookup() {
    setLoading(true)
    setErrorText('')
    setResults([])
    setResubmitMessage('')
    setResubmitError('')

    try {
      const response = await fetch('/api/queryOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || ui.noOrders)
      }

      setResults(data.orders || [])
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : ui.noOrders)
    } finally {
      setLoading(false)
    }
  }

  function handleResubmitFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setResubmitProofName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setResubmitProofBase64(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleResubmit(orderNo: string) {
    setResubmitLoading(true)
    setResubmitMessage('')
    setResubmitError('')

    try {
      const response = await fetch('/api/resubmitPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          order_no: orderNo,
          tx_hash: resubmitHash.trim() || null,
          proof_image_base64: resubmitProofBase64 || null,
        }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || ui.resubmitError)
      }

      setResubmitMessage(ui.resubmitSuccess)
      setActiveOrderNo('')
      setResubmitHash('')
      setResubmitProofName('')
      setResubmitProofBase64('')

      await handleLookup()
    } catch (error) {
      setResubmitError(error instanceof Error ? error.message : ui.resubmitError)
    } finally {
      setResubmitLoading(false)
    }
  }

  return (
    <section className="card-soft lookup-wrap">
      <div className="lookup-title">{ui.title}</div>
      <div className="small-muted lookup-subtitle">{ui.subtitle}</div>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={ui.placeholder}
        className="input"
      />

      <button onClick={handleLookup} className="btn-primary lookup-btn">
        {loading ? ui.loading : ui.button}
      </button>

      {errorText ? <div className="status-box-error">{errorText}</div> : null}
      {resubmitMessage ? <div className="status-box-success">{resubmitMessage}</div> : null}
      {resubmitError ? <div className="status-box-error">{resubmitError}</div> : null}

      {results.length > 0 ? (
        <div className="lookup-result-grid">
          {results.map((item) => {
            const allowResubmit =
              Boolean(item.public_note) && String(item.status || '').toLowerCase() !== 'completed'

            return (
              <div key={item.order_no} className="lookup-item-card">
                <div><strong>{ui.orderNo}:</strong> {item.order_no}</div>
                <div><strong>{ui.email}:</strong> {email}</div>
                <div><strong>{ui.status}:</strong> {getStatusLabel(item.status)}</div>
                <div><strong>{ui.product}:</strong> {getProductLabel(item)}</div>
                <div><strong>{ui.amount}:</strong> ${item.price_usd ?? item.amount ?? 0}</div>
                <div><strong>{ui.network}:</strong> {item.payment_network || '-'}</div>
                <div><strong>{ui.createdAt}:</strong> {formatBostonTime(item.created_at)}</div>

                {item.tx_hash ? (
                  <div className="lookup-break-all">
                    <strong>{ui.txHash}:</strong> {item.tx_hash}
                  </div>
                ) : null}

                {item.public_note ? (
                  <div className="lookup-note-box">
                    <strong>{ui.note}:</strong> {item.public_note}
                  </div>
                ) : null}

                {allowResubmit ? (
                  <>
                    <button
                      type="button"
                      className="btn-secondary lookup-btn"
                      onClick={() => {
                        setActiveOrderNo(item.order_no)
                        setResubmitHash('')
                        setResubmitProofName('')
                        setResubmitProofBase64('')
                        setResubmitMessage('')
                        setResubmitError('')
                      }}
                    >
                      {ui.resubmit}
                    </button>

                    {activeOrderNo === item.order_no ? (
                      <div className="lookup-resubmit-box">
                        <input type="file" accept="image/*" onChange={handleResubmitFileChange} />

                        {resubmitProofName ? (
                          <div className="small-muted lookup-break-all">
                            {ui.proofReady} {resubmitProofName}
                          </div>
                        ) : null}

                        <input
                          value={resubmitHash}
                          onChange={(e) => setResubmitHash(e.target.value)}
                          placeholder={ui.hashPlaceholder}
                          className="input"
                        />

                        <button
                          type="button"
                          className="btn-primary lookup-btn"
                          onClick={() => handleResubmit(item.order_no)}
                        >
                          {resubmitLoading ? ui.resubmitting : ui.resubmitButton}
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

function HomePageInner() {
  const { lang, t } = useI18n()
  const navUi = NAV_UI[lang] || NAV_UI.en

  const [tab, setTab] = useState<ProductType>('premium')
  const [duration, setDuration] = useState<DurationType>('12m')
  const [stars, setStars] = useState(50)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
  const [configLoading, setConfigLoading] = useState(true)
  const [routingToPay, setRoutingToPay] = useState(false)
  const [formError, setFormError] = useState('')

  const startYear = 2026
  const currentYear = new Date().getFullYear()
  const copyrightText =
    currentYear > startYear
      ? `© ${startYear}–${currentYear} Agnopol. All rights reserved.`
      : `© ${startYear} Agnopol. All rights reserved.`

  useEffect(() => {
    let active = true

    async function loadConfig() {
      setConfigLoading(true)
      setConfigError('')

      try {
        const response = await fetch('/api/public/config', {
          cache: 'no-store',
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load config')
        }

        if (active && data?.item) {
          setConfig({
            premium_3m_price: Number(data.item.premium_3m_price ?? defaultConfig.premium_3m_price),
            premium_6m_price: Number(data.item.premium_6m_price ?? defaultConfig.premium_6m_price),
            premium_12m_price: Number(data.item.premium_12m_price ?? defaultConfig.premium_12m_price),
            stars_rate: Number(data.item.stars_rate ?? defaultConfig.stars_rate),
            trc20_address: String(data.item.trc20_address ?? defaultConfig.trc20_address),
            base_address: String(data.item.base_address ?? defaultConfig.base_address),
            updated_at: data.item.updated_at,
          })
        }
      } catch (error) {
        if (active) {
          setConfigError(error instanceof Error ? error.message : 'Failed to load config')
          setConfig(defaultConfig)
        }
      } finally {
        if (active) {
          setConfigLoading(false)
        }
      }
    }

    loadConfig()

    return () => {
      active = false
    }
  }, [])

  const safeStars = useMemo(() => {
    if (!Number.isFinite(stars)) return 50
    if (stars < 50) return 50
    return Math.floor(stars)
  }, [stars])

  const selectedPrice = useMemo(() => {
    if (tab === 'premium') {
      if (duration === '3m') return Number(config.premium_3m_price)
      if (duration === '6m') return Number(config.premium_6m_price)
      return Number(config.premium_12m_price)
    }
    return Number((safeStars * Number(config.stars_rate)).toFixed(2))
  }, [tab, duration, safeStars, config])

  const selectedTitle = useMemo(() => {
    if (tab === 'premium') {
      const durationText =
        duration === '3m' ? t.home.months3 : duration === '6m' ? t.home.months6 : t.home.months12
      return `${t.home.tgPremium} ${durationText}`
    }
    return `${t.home.tgStars} ${safeStars}`
  }, [tab, duration, safeStars, t])

  function goPay() {
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedUsername) {
      setFormError(getHomeFormError(lang, 'username'))
      return
    }

    if (!trimmedEmail) {
      setFormError(getHomeFormError(lang, 'email'))
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError(getHomeFormError(lang, 'emailInvalid'))
      return
    }

    setFormError('')

    const params = new URLSearchParams()
    params.set('lang', lang)
    params.set('username', trimmedUsername)
    params.set('email', trimmedEmail)
    params.set('price_usd', String(selectedPrice))

    if (tab === 'premium') {
      params.set('product_type', 'tg_premium')
      params.set('duration', duration)
    } else {
      params.set('product_type', 'tg_stars')
      params.set('stars_amount', String(safeStars))
    }

    setRoutingToPay(true)
    window.setTimeout(() => {
      window.location.href = `/pay?${params.toString()}`
    }, 420)
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <section className="hero-center hero-stack hero-stair-wrap">
          <h1 className="brand-title hero-step hero-step-1">{t.common.brand}</h1>
          <p className="brand-slogan hero-step hero-step-2">{t.common.slogan}</p>

          <div className="hero-tools hero-step hero-step-3">
            <LanguageSwitcher size="compact" />
          </div>

          <div className="hero-mode hero-step hero-step-4">
            <ThemeToggle />
          </div>
        </section>

        <div className="segment-tabs">
          <button
            type="button"
            onClick={() => setTab('premium')}
            className={`segment-btn ${tab === 'premium' ? 'active' : ''}`}
          >
            {t.home.premiumTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('stars')}
            className={`segment-btn ${tab === 'stars' ? 'active' : ''}`}
          >
            {t.home.starsTab}
          </button>
        </div>

        {configError ? <div className="status-box-error page-error-box">{configError}</div> : null}

        {tab === 'premium' ? (
          <>
            <p className="section-caption">{t.home.premiumPlans}</p>

            <div className="plan-grid">
              <div
                className={`card plan-card ${duration === '3m' ? 'active' : ''}`}
                onClick={() => setDuration('3m')}
              >
                <div className="plan-title">{t.home.months3}</div>
                <div className="plan-price">${Number(config.premium_3m_price)}</div>
              </div>

              <div
                className={`card plan-card ${duration === '6m' ? 'active' : ''}`}
                onClick={() => setDuration('6m')}
              >
                <div className="plan-title">{t.home.months6}</div>
                <div className="plan-price">${Number(config.premium_6m_price)}</div>
              </div>

              <div
                className={`card plan-card ${duration === '12m' ? 'active' : ''}`}
                onClick={() => setDuration('12m')}
              >
                <div className="plan-title">{t.home.months12}</div>
                <div className="plan-price">${Number(config.premium_12m_price)}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="section-caption">{t.home.starsPackage}</p>

            <div className="card single-box">
              <div className="field-title">{t.home.starsAmount}</div>

              <input
                type="number"
                min={50}
                step={1}
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                placeholder={t.home.starsPlaceholder}
                className="input"
              />

              <div className="field-hint">{t.home.starsMinHint}</div>
              <div className="field-hint">{t.home.autoPriceHint}</div>
            </div>
          </>
        )}

        <div className="summary-box card-soft">
          <div className="small-muted summary-label">{t.home.currentSelection}</div>
          <div className="summary-title">{selectedTitle}</div>
          <div className="summary-price">${selectedPrice}</div>

          {configLoading ? <div className="small-muted summary-loading">{t.common.loading}</div> : null}
        </div>

        <div className="form-stack">
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (formError) setFormError('')
            }}
            placeholder={t.home.usernamePlaceholder}
            className="input"
            autoComplete="off"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (formError) setFormError('')
            }}
            placeholder={t.home.emailPlaceholder}
            className="input"
            autoComplete="email"
            inputMode="email"
          />

          {formError ? <div className="status-box-error">{formError}</div> : null}

          <button
            onClick={goPay}
            className="btn-primary"
            disabled={routingToPay}
            style={{ opacity: routingToPay ? 0.8 : 1 }}
          >
            {routingToPay ? navUi.redirecting : t.home.createOrder}
          </button>
        </div>

        <div className="lookup-section">
          <OrderLookupSection />
        </div>

        <footer className="footer">
          <p>{copyrightText}</p>

          <p className="footer-email">
            <span className="footer-email-label">{t.common.officialEmail}:</span>
            <a href="mailto:hello@agnopol.com">hello@agnopol.com</a>
          </p>

          <div className="footer-links">
            <a href={withLang('/legal#terms', lang)}>{t.common.footerTerms}</a>
            <a href={withLang('/legal#privacy', lang)}>{t.common.footerPrivacy}</a>
            <a href={withLang('/legal#risk', lang)}>{t.common.footerRisk}</a>
          </div>
        </footer>
      </div>

      {routingToPay ? (
        <div className="route-overlay">
          <div className="route-card">
            <div className="route-spinner" />
            <div className="route-title">{navUi.preparing}</div>
            <div className="route-subtitle">{navUi.redirecting}</div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .site-container {
          max-width: 820px;
        }

        .hero-center {
          text-align: center;
          margin-bottom: 14px;
        }

        .hero-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .hero-stair-wrap {
          width: 100%;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-step {
          width: 100%;
        }

        .hero-step-1,
        .hero-step-2 {
          text-align: center;
        }

        .hero-step-3,
        .hero-step-4 {
          display: flex;
          justify-content: center;
        }

        .hero-tools {
          margin-top: 2px;
        }

        .hero-mode {
          margin-top: 4px;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(48px, 9vw, 86px);
          line-height: 0.95;
          font-weight: 900;
          color: var(--text-strong);
          letter-spacing: -0.04em;
        }

        .brand-slogan {
          margin: 6px 0 0;
          font-size: clamp(15px, 1.9vw, 18px);
          color: var(--text-soft);
        }

        .segment-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 14px auto 10px;
          max-width: 700px;
        }

        .segment-btn {
          min-height: 72px;
          border-radius: 20px;
          font-size: clamp(18px, 2.6vw, 21px);
          font-weight: 900;
        }

        .page-error-box {
          max-width: 700px;
          margin: 0 auto 12px;
        }

        .section-caption {
          text-align: center;
          color: var(--text-soft);
          font-size: clamp(16px, 2.2vw, 22px);
          margin: 14px 0 12px;
        }

        .plan-grid {
          display: grid;
          gap: 16px;
          max-width: 700px;
          margin: 0 auto;
        }

        .plan-card {
          padding: 22px 20px;
          border-radius: 22px;
          cursor: pointer;
          transition: all 0.16s ease;
        }

        .plan-title {
          font-size: clamp(20px, 2.8vw, 28px);
          font-weight: 900;
        }

        .plan-price {
          margin-top: 14px;
          font-size: clamp(30px, 4.6vw, 44px);
          font-weight: 900;
          line-height: 1;
        }

        .single-box {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
        }

        .field-title {
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 10px;
          color: var(--text-strong);
        }

        .field-hint {
          margin-top: 8px;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.6;
        }

        .summary-box {
          max-width: 700px;
          margin: 18px auto 0;
          padding: 20px 20px;
        }

        .summary-label {
          margin-bottom: 8px;
        }

        .summary-title {
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 900;
          color: var(--text-strong);
        }

        .summary-price {
          margin-top: 8px;
          font-size: clamp(38px, 6vw, 56px);
          font-weight: 900;
          line-height: 1;
          color: var(--text-strong);
        }

        .summary-loading {
          margin-top: 10px;
        }

        .form-stack {
          max-width: 700px;
          margin: 14px auto 0;
          display: grid;
          gap: 12px;
        }

        .input {
          width: 100%;
          min-height: 56px;
          border-radius: 18px;
          border: 1px solid var(--border-soft);
          background: var(--bg-input);
          color: var(--text-main);
          padding: 0 18px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.16s ease, box-shadow 0.16s ease;
        }

        .input:focus {
          border-color: rgba(245, 158, 11, 0.9);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
          min-height: 56px;
          border-radius: 18px;
          font-size: 18px;
          font-weight: 900;
          transition: all 0.16s ease;
        }

        .lookup-section {
          margin-top: 26px;
        }

        .lookup-wrap {
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
          padding: 18px;
        }

        .lookup-title {
          font-size: clamp(20px, 3vw, 26px);
          font-weight: 900;
          color: var(--text-strong);
          margin-bottom: 6px;
        }

        .lookup-subtitle {
          margin-bottom: 12px;
          line-height: 1.7;
        }

        .lookup-btn {
          margin-top: 12px;
        }

        .lookup-result-grid {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .lookup-item-card {
          padding: 15px;
          border-radius: 18px;
          background: var(--bg-muted);
          border: 1px solid var(--border-soft);
          display: grid;
          gap: 8px;
          line-height: 1.7;
        }

        .lookup-break-all {
          word-break: break-all;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .lookup-note-box {
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 236, 179, 0.45);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #7c2d12;
          line-height: 1.7;
        }

        .lookup-resubmit-box {
          margin-top: 6px;
          padding: 12px;
          border-radius: 14px;
          border: 1px dashed var(--border-soft);
          background: var(--bg-card-soft);
          display: grid;
          gap: 10px;
        }

        .footer-email {
          margin-top: 4px;
        }

        .footer-email-label {
          margin-right: 6px;
        }

        .route-overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(2, 6, 23, 0.42);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .route-card {
          width: min(420px, 100%);
          border-radius: 28px;
          padding: 28px 22px;
          background: var(--bg-card);
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-soft);
          text-align: center;
        }

        .route-spinner {
          width: 44px;
          height: 44px;
          margin: 0 auto 14px;
          border-radius: 999px;
          border: 3px solid rgba(255, 255, 255, 0.24);
          border-top-color: var(--brand);
          animation: spin 0.8s linear infinite;
        }

        .route-title {
          font-size: 18px;
          font-weight: 900;
          color: var(--text-strong);
        }

        .route-subtitle {
          margin-top: 8px;
          font-size: 14px;
          color: var(--text-soft);
        }

        @media (min-width: 768px) {
          .hero-step-1 {
            text-align: left;
          }

          .hero-step-2 {
            padding-left: 20px;
            text-align: left;
          }

          .hero-step-3 {
            justify-content: flex-start;
            padding-left: 40px;
          }

          .hero-step-4 {
            justify-content: flex-start;
            padding-left: 64px;
          }
        }

        @media (max-width: 640px) {
          .site-shell {
            padding: 16px 12px 28px;
          }

          .segment-btn {
            min-height: 66px;
            font-size: 17px;
          }

          .plan-card {
            padding: 20px 18px;
          }

          .input,
          .btn-primary,
          .btn-secondary {
            min-height: 54px;
            font-size: 17px;
          }

          .summary-box {
            padding: 18px;
          }

          .lookup-wrap {
            padding: 16px;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  )
}

function PageFallback() {
  return (
    <main className="site-shell">
      <div className="site-container">
        <section className="hero-center">
          <p className="small-muted" style={{ margin: 0 }}>
            Loading...
          </p>
        </section>
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <HomePageInner />
    </Suspense>
  )
}
