'use client'

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'
import ThemeToggle from '../../components/theme-toggle'
import { withLang } from '../../lib/i18n'

type DurationType = '3m' | '6m' | '12m'

type PublicConfig = {
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  trc20_address: string
  base_address: string
  updated_at?: string
}

type PaymentMethod = {
  id: string | number
  display_name?: string | null
  chain_name?: string | null
  token_name?: string | null
  address?: string | null
  active?: boolean | null
  sort_order?: number | null
}

const CREATE_ORDER_ENDPOINT = '/api/createOrder'

const defaultConfig: PublicConfig = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  trc20_address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  base_address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
}

type PayUi = {
  back: string
  title: string
  subtitle: string
  invalidParams: string
  invalidParamsHint: string
  summaryTitle: string
  product: string
  username: string
  email: string
  amountDue: string
  networkTitle: string
  addressTitle: string
  copy: string
  copied: string
  warningTitle: string
  deliveryTitle: string
  deliveryText: string
  txHashTitle: string
  txHashHint: string
  txHashPlaceholder: string
  proofTitle: string
  proofHint: string
  uploadButton: string
  noFile: string
  proofReady: string
  txHashRequired: string
  submit: string
  submitting: string
  successTitle: string
  successText: string
  trackOrder: string
  createError: string
}

const PAY_UI: Record<string, PayUi> = {
  de: {
    back: 'Zurück zur Startseite',
    title: 'Zahlung abschließen',
    subtitle: 'Prüfen Sie Ihre Bestellinformationen, wählen Sie die Zahlungsmethode und reichen Sie dann den Zahlungsnachweis ein.',
    invalidParams: 'Die Bestellinformationen sind unvollständig oder ungültig.',
    invalidParamsHint: 'Bitte kehren Sie zur Startseite zurück und erstellen Sie die Bestellung mit gültigem TG-Benutzernamen und E-Mail erneut.',
    summaryTitle: 'Bestellübersicht',
    product: 'Produkt',
    username: 'TG-Benutzername',
    email: 'E-Mail',
    amountDue: 'Fälliger Betrag',
    networkTitle: 'Zahlungsmethode wählen',
    addressTitle: 'Empfangsadresse',
    copy: 'Adresse kopieren',
    copied: 'Kopiert',
    warningTitle: 'Wichtiger Zahlungshinweis',
    deliveryTitle: 'Lieferzeit',
    deliveryText:
      'Um die Sicherheit der Gelder und die Compliance-Prüfung zu gewährleisten, beträgt unsere Standardbearbeitungszeit 5 bis 15 Minuten. Bei Netzwerküberlastung dauert es spätestens bis zu 2 Stunden.',
    txHashTitle: 'Transaktions-Hash',
    txHashHint: 'Bitte tragen Sie zuerst den Transaktions-Hash ein. Dies ist der primäre Zahlungsnachweis.',
    txHashPlaceholder: 'Bitte Transaktions-Hash eingeben',
    proofTitle: 'Zusätzlicher Screenshot oder Beleg',
    proofHint: 'Sie können zusätzlich einen Screenshot oder Beleg als unterstützenden Nachweis hochladen.',
    uploadButton: 'Screenshot auswählen',
    noFile: 'Keine Datei ausgewählt',
    proofReady: 'Ausgewählte Datei:',
    txHashRequired: 'Bitte tragen Sie zuerst den Transaktions-Hash ein.',
    submit: 'Zahlungsnachweis einreichen',
    submitting: 'Wird eingereicht...',
    successTitle: 'Zahlungsnachweis eingereicht',
    successText: 'Ihre Bestellung wurde erstellt und der Zahlungsnachweis erfolgreich eingereicht.',
    trackOrder: 'Bestellung verfolgen',
    createError: 'Bestellung konnte nicht erstellt werden.',
  },
  en: {
    back: 'Back to home',
    title: 'Complete payment',
    subtitle: 'Review your order details, choose the payment method, then submit your payment proof.',
    invalidParams: 'Order information is incomplete or invalid.',
    invalidParamsHint:
      'Please go back to the home page and create the order again with a valid TG username and email.',
    summaryTitle: 'Order summary',
    product: 'Product',
    username: 'TG Username',
    email: 'Email',
    amountDue: 'Amount due',
    networkTitle: 'Choose payment method',
    addressTitle: 'Payment address',
    copy: 'Copy address',
    copied: 'Copied',
    warningTitle: 'Important payment notice',
    deliveryTitle: 'Delivery time',
    deliveryText:
      'To ensure fund safety and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it will not exceed 2 hours.',
    txHashTitle: 'Transaction hash',
    txHashHint: 'Please fill in the transaction hash first. This is the primary payment proof.',
    txHashPlaceholder: 'Enter your transaction hash',
    proofTitle: 'Auxiliary screenshot or receipt',
    proofHint: 'You may also upload a screenshot or receipt as supporting proof.',
    uploadButton: 'Choose screenshot',
    noFile: 'No file selected',
    proofReady: 'Selected file:',
    txHashRequired: 'Please fill in the transaction hash first.',
    submit: 'Submit payment proof',
    submitting: 'Submitting...',
    successTitle: 'Payment proof submitted',
    successText: 'Your order has been created and the payment proof has been submitted successfully.',
    trackOrder: 'Track order',
    createError: 'Failed to create the order.',
  },
  es: {
    back: 'Volver al inicio',
    title: 'Completar pago',
    subtitle: 'Revise los datos del pedido, elija el método de pago y luego envíe su comprobante.',
    invalidParams: 'La información del pedido es incompleta o no es válida.',
    invalidParamsHint:
      'Vuelva a la página principal y cree el pedido de nuevo con un nombre de usuario TG y un correo válidos.',
    summaryTitle: 'Resumen del pedido',
    product: 'Producto',
    username: 'Usuario de TG',
    email: 'Correo electrónico',
    amountDue: 'Importe a pagar',
    networkTitle: 'Elegir método de pago',
    addressTitle: 'Dirección de pago',
    copy: 'Copiar dirección',
    copied: 'Copiado',
    warningTitle: 'Aviso importante de pago',
    deliveryTitle: 'Tiempo de entrega',
    deliveryText:
      'Para garantizar la seguridad de los fondos y la revisión de cumplimiento, nuestro tiempo estándar de entrega es de 5 a 15 minutos. En caso de congestión de red, no superará las 2 horas.',
    txHashTitle: 'Hash de transacción',
    txHashHint: 'Complete primero el hash de transacción. Es el comprobante principal de pago.',
    txHashPlaceholder: 'Introduzca el hash de transacción',
    proofTitle: 'Captura o recibo auxiliar',
    proofHint: 'También puede subir una captura o recibo como comprobante de apoyo.',
    uploadButton: 'Elegir captura',
    noFile: 'No se ha seleccionado ningún archivo',
    proofReady: 'Archivo seleccionado:',
    txHashRequired: 'Complete primero el hash de transacción.',
    submit: 'Enviar comprobante de pago',
    submitting: 'Enviando...',
    successTitle: 'Comprobante enviado',
    successText: 'Su pedido se ha creado y el comprobante de pago se ha enviado correctamente.',
    trackOrder: 'Seguir pedido',
    createError: 'No se pudo crear el pedido.',
  },
  fr: {
    back: "Retour à l'accueil",
    title: 'Finaliser le paiement',
    subtitle: 'Vérifiez les détails de votre commande, choisissez le mode de paiement, puis soumettez votre preuve de paiement.',
    invalidParams: 'Les informations de commande sont incomplètes ou invalides.',
    invalidParamsHint:
      "Veuillez revenir à la page d'accueil et recréer la commande avec un nom d'utilisateur TG et un e-mail valides.",
    summaryTitle: 'Résumé de la commande',
    product: 'Produit',
    username: "Nom d'utilisateur TG",
    email: 'E-mail',
    amountDue: 'Montant à payer',
    networkTitle: 'Choisir le mode de paiement',
    addressTitle: 'Adresse de paiement',
    copy: "Copier l'adresse",
    copied: 'Copié',
    warningTitle: 'Avis de paiement important',
    deliveryTitle: 'Délai de livraison',
    deliveryText:
      'Afin de garantir la sécurité des fonds et la conformité, notre délai standard de traitement est de 5 à 15 minutes. En cas de congestion réseau, il ne dépassera pas 2 heures.',
    txHashTitle: 'Hash de transaction',
    txHashHint: 'Veuillez renseigner d’abord le hash de transaction. Il s’agit de la preuve principale de paiement.',
    txHashPlaceholder: 'Veuillez saisir le hash de transaction',
    proofTitle: 'Capture ou reçu complémentaire',
    proofHint: 'Vous pouvez également téléverser une capture ou un reçu comme preuve complémentaire.',
    uploadButton: 'Choisir une capture',
    noFile: 'Aucun fichier sélectionné',
    proofReady: 'Fichier sélectionné :',
    txHashRequired: 'Veuillez d’abord renseigner le hash de transaction.',
    submit: 'Soumettre la preuve de paiement',
    submitting: 'Envoi...',
    successTitle: 'Preuve de paiement soumise',
    successText: 'Votre commande a été créée et la preuve de paiement a été soumise avec succès.',
    trackOrder: 'Suivre la commande',
    createError: 'Échec de la création de la commande.',
  },
  ja: {
    back: 'ホームへ戻る',
    title: '支払いを完了',
    subtitle: '注文内容を確認し、支払い方法を選択してから、支払い証明を送信してください。',
    invalidParams: '注文情報が不完全、または無効です。',
    invalidParamsHint:
      'ホームに戻り、有効なTGユーザー名とメールアドレスで再度注文を作成してください。',
    summaryTitle: '注文概要',
    product: '商品',
    username: 'TGユーザー名',
    email: 'メール',
    amountDue: '支払金額',
    networkTitle: '支払い方法を選択',
    addressTitle: '送金先アドレス',
    copy: 'アドレスをコピー',
    copied: 'コピー済み',
    warningTitle: '重要な支払い案内',
    deliveryTitle: '納品時間',
    deliveryText:
      '資金の安全性とコンプライアンス審査を確保するため、通常の納品時間は 5〜15 分です。ネットワーク混雑時でも最長 2 時間を超えません。',
    txHashTitle: '取引ハッシュ',
    txHashHint: 'まず取引ハッシュを入力してください。これが主要な支払い証明です。',
    txHashPlaceholder: '取引ハッシュを入力してください',
    proofTitle: '補助スクリーンショットまたは領収書',
    proofHint: '補助証明としてスクリーンショットや領収書もアップロードできます。',
    uploadButton: 'スクリーンショットを選択',
    noFile: 'ファイルが選択されていません',
    proofReady: '選択されたファイル：',
    txHashRequired: '先に取引ハッシュを入力してください。',
    submit: '支払い証明を送信',
    submitting: '送信中...',
    successTitle: '支払い証明を送信しました',
    successText: '注文が作成され、支払い証明も正常に送信されました。',
    trackOrder: '注文を追跡',
    createError: '注文の作成に失敗しました。',
  },
  ko: {
    back: '홈으로 돌아가기',
    title: '결제 완료',
    subtitle: '주문 정보를 확인하고 결제 방식을 선택한 뒤 결제 증빙을 제출하세요.',
    invalidParams: '주문 정보가 불완전하거나 유효하지 않습니다.',
    invalidParamsHint:
      '홈으로 돌아가 올바른 TG 사용자명과 이메일로 다시 주문을 생성하세요.',
    summaryTitle: '주문 요약',
    product: '상품',
    username: 'TG 사용자명',
    email: '이메일',
    amountDue: '결제 금액',
    networkTitle: '결제 방식 선택',
    addressTitle: '수취 주소',
    copy: '주소 복사',
    copied: '복사됨',
    warningTitle: '중요한 결제 안내',
    deliveryTitle: '처리 시간',
    deliveryText:
      '자금 안전과 규정 준수 심사를 위해 표준 처리 시간은 5~15분입니다. 네트워크 혼잡 시에도 최대 2시간을 넘지 않습니다.',
    txHashTitle: '거래 해시',
    txHashHint: '먼저 거래 해시를 입력하세요. 이것이 주요 결제 증빙입니다.',
    txHashPlaceholder: '거래 해시를 입력하세요',
    proofTitle: '보조 스크린샷 또는 영수증',
    proofHint: '보조 증빙으로 스크린샷 또는 영수증을 업로드할 수도 있습니다.',
    uploadButton: '스크린샷 선택',
    noFile: '선택된 파일 없음',
    proofReady: '선택한 파일:',
    txHashRequired: '먼저 거래 해시를 입력하세요.',
    submit: '결제 증빙 제출',
    submitting: '제출 중...',
    successTitle: '결제 증빙 제출 완료',
    successText: '주문이 생성되었고 결제 증빙도 성공적으로 제출되었습니다.',
    trackOrder: '주문 추적',
    createError: '주문 생성에 실패했습니다.',
  },
  'zh-cn': {
    back: '返回首页',
    title: '完成付款',
    subtitle: '核对订单信息，选择支付方式，然后提交付款凭证。',
    invalidParams: '订单信息不完整或格式无效。',
    invalidParamsHint: '请返回首页重新下单，并确认 TG 用户名与邮箱格式正确。',
    summaryTitle: '订单摘要',
    product: '商品',
    username: 'TG 用户名',
    email: '邮箱',
    amountDue: '应付金额',
    networkTitle: '选择支付方式',
    addressTitle: '收款地址',
    copy: '复制地址',
    copied: '已复制',
    warningTitle: '重要支付提示',
    deliveryTitle: '交付时效',
    deliveryText:
      '为了确保资金安全与合规审查，我们的标准交付时间为 5 - 15 分钟。在网络拥堵时，最迟不超过 2 小时。',
    txHashTitle: '交易哈希',
    txHashHint: '请优先填写交易哈希，这是主要付款凭证。',
    txHashPlaceholder: '请填写交易哈希',
    proofTitle: '辅助截图或收据',
    proofHint: '你也可以上传付款截图或收据，作为辅助凭证。',
    uploadButton: '选择截图',
    noFile: '未选择任何文件',
    proofReady: '已选择文件：',
    txHashRequired: '请先填写交易哈希。',
    submit: '提交付款凭证',
    submitting: '提交中...',
    successTitle: '付款凭证已提交',
    successText: '你的订单已创建，付款凭证也已成功提交。',
    trackOrder: '追踪订单',
    createError: '创建订单失败。',
  },
  'zh-tw': {
    back: '返回首頁',
    title: '完成付款',
    subtitle: '核對訂單資訊，選擇支付方式，然後提交付款憑證。',
    invalidParams: '訂單資訊不完整或格式無效。',
    invalidParamsHint: '請返回首頁重新下單，並確認 TG 用戶名與電子郵件格式正確。',
    summaryTitle: '訂單摘要',
    product: '商品',
    username: 'TG 用戶名',
    email: '電子郵件',
    amountDue: '應付金額',
    networkTitle: '選擇支付方式',
    addressTitle: '收款地址',
    copy: '複製地址',
    copied: '已複製',
    warningTitle: '重要支付提示',
    deliveryTitle: '交付時效',
    deliveryText:
      '為了確保資金安全與合規審查，我們的標準交付時間為 5 - 15 分鐘。在網路壅塞時，最遲不超過 2 小時。',
    txHashTitle: '交易雜湊',
    txHashHint: '請優先填寫交易雜湊，這是主要付款憑證。',
    txHashPlaceholder: '請填寫交易雜湊',
    proofTitle: '輔助截圖或收據',
    proofHint: '你也可以上傳付款截圖或收據，作為輔助憑證。',
    uploadButton: '選擇截圖',
    noFile: '未選擇任何檔案',
    proofReady: '已選擇檔案：',
    txHashRequired: '請先填寫交易雜湊。',
    submit: '提交付款憑證',
    submitting: '提交中...',
    successTitle: '付款憑證已提交',
    successText: '你的訂單已建立，付款憑證也已成功提交。',
    trackOrder: '追蹤訂單',
    createError: '建立訂單失敗。',
  },
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidTelegramUsername(value: string) {
  return /^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value.trim())
}

function formatMoney(value: number) {
  const fixed = Number(value.toFixed(2))
  return Number.isInteger(fixed) ? String(fixed) : fixed.toFixed(2).replace(/\.?0+$/, '')
}

function scheduleFieldIntoView(target: HTMLInputElement) {
  ;[0, 120, 260].forEach((delay) => {
    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: 'auto',
        block: 'start',
        inline: 'nearest',
      })
    }, delay)
  })
}

function getMethodLabel(method?: PaymentMethod | null) {
  if (!method) return ''

  const displayName = String(method.display_name || '').trim()
  if (displayName) return displayName

  const chain = String(method.chain_name || '').trim()
  const token = String(method.token_name || '').trim()
  return [chain, token].filter(Boolean).join(' / ')
}

function getMethodShortLabel(method?: PaymentMethod | null) {
  if (!method) return ''

  const chain = String(method.chain_name || '').trim()
  const token = String(method.token_name || '').trim()

  if (chain && token) return `${chain} ${token}`
  return getMethodLabel(method)
}

function getWarningText(lang: string, methodLabel: string) {
  if (lang === 'zh-cn') {
    return `转账请务必使用当前所选支付方式 ${methodLabel} 对应的正确链与币种，不要混用其他网络。实际到账金额必须与订单显示金额完全一致。`
  }

  if (lang === 'zh-tw') {
    return `轉帳請務必使用目前所選支付方式 ${methodLabel} 對應的正確鏈與幣種，不要混用其他網路。實際到帳金額必須與訂單顯示金額完全一致。`
  }

  if (lang === 'de') {
    return `Bitte verwenden Sie ausschließlich die korrekte Chain und den korrekten Token für die aktuell ausgewählte Zahlungsmethode ${methodLabel}. Der tatsächlich eingegangene Betrag muss exakt dem Bestellbetrag entsprechen.`
  }

  if (lang === 'es') {
    return `Utilice únicamente la red y el token correctos para el método de pago seleccionado actualmente: ${methodLabel}. El importe recibido debe coincidir exactamente con el importe del pedido.`
  }

  if (lang === 'fr') {
    return `Veuillez utiliser uniquement le bon réseau et le bon jeton pour le mode de paiement actuellement sélectionné : ${methodLabel}. Le montant reçu doit correspondre exactement au montant de la commande.`
  }

  if (lang === 'ja') {
    return `現在選択中の支払い方法 ${methodLabel} に対応する正しいチェーンと通貨のみを使用してください。着金額は注文金額と完全に一致している必要があります。`
  }

  if (lang === 'ko') {
    return `현재 선택한 결제 방식 ${methodLabel} 에 해당하는 올바른 체인과 코인만 사용하세요. 실제 입금 금액은 주문 금액과 정확히 일치해야 합니다.`
  }

  return `Please use only the correct chain and token for the currently selected payment method ${methodLabel}. The received amount must exactly match the order amount.`
}

function PayPageInner() {
  const { lang, t } = useI18n()
  const ui = PAY_UI[lang] || PAY_UI.en
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState<string>('')
  const [txHash, setTxHash] = useState('')
  const [proofName, setProofName] = useState('')
  const [proofBase64, setProofBase64] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdOrderNo, setCreatedOrderNo] = useState('')
  const [successVisible, setSuccessVisible] = useState(false)

  const username = searchParams.get('username')?.trim() || ''
  const email = searchParams.get('email')?.trim().toLowerCase() || ''
  const priceUsd = Number(searchParams.get('price_usd') || 0)
  const productType = searchParams.get('product_type') || ''
  const duration = (searchParams.get('duration') || '') as DurationType
  const starsAmount = Number(searchParams.get('stars_amount') || 0)

  const isOrderContextValid = useMemo(() => {
    if (!isValidTelegramUsername(username)) return false
    if (!isValidEmail(email)) return false
    if (!(priceUsd > 0)) return false

    if (productType === 'tg_premium') {
      return ['3m', '6m', '12m'].includes(duration)
    }

    if (productType === 'tg_stars') {
      return starsAmount >= 50
    }

    return false
  }, [username, email, priceUsd, productType, duration, starsAmount])

  useEffect(() => {
    let active = true

    async function loadConfigAndMethods() {
      try {
        const [configResponse, methodsResponse] = await Promise.allSettled([
          fetch('/api/public/config', { cache: 'no-store' }),
          fetch('/api/public/payment-methods', { cache: 'no-store' }),
        ])

        let nextConfig = defaultConfig

        if (configResponse.status === 'fulfilled') {
          const response = configResponse.value
          const data = await response.json()

          if (response.ok && active && data?.item) {
            nextConfig = {
              premium_3m_price: Number(data.item.premium_3m_price ?? defaultConfig.premium_3m_price),
              premium_6m_price: Number(data.item.premium_6m_price ?? defaultConfig.premium_6m_price),
              premium_12m_price: Number(data.item.premium_12m_price ?? defaultConfig.premium_12m_price),
              stars_rate: Number(data.item.stars_rate ?? defaultConfig.stars_rate),
              trc20_address: String(data.item.trc20_address ?? defaultConfig.trc20_address),
              base_address: String(data.item.base_address ?? defaultConfig.base_address),
              updated_at: data.item.updated_at,
            }
            setConfig(nextConfig)
          } else if (active && !response.ok) {
            setConfigError(data?.error || 'Failed to load config')
          }
        }

        let methods: PaymentMethod[] = []

        if (methodsResponse.status === 'fulfilled') {
          const response = methodsResponse.value
          const data = await response.json()

          if (response.ok && Array.isArray(data?.items)) {
            methods = data.items
              .filter((item: PaymentMethod) => item && item.active !== false && item.address)
              .sort((a: PaymentMethod, b: PaymentMethod) => {
                const ao = Number(a.sort_order ?? 0)
                const bo = Number(b.sort_order ?? 0)
                return ao - bo
              })
          }
        }

        if (!methods.length) {
          methods = [
            {
              id: 'fallback-trc20',
              display_name: 'TRC20 / USDT',
              chain_name: 'TRC20',
              token_name: 'USDT',
              address: nextConfig.trc20_address,
              active: true,
              sort_order: 1,
            },
            {
              id: 'fallback-base',
              display_name: 'BASE / USDC',
              chain_name: 'BASE',
              token_name: 'USDC',
              address: nextConfig.base_address,
              active: true,
              sort_order: 2,
            },
          ]
        }

        if (active) {
          setPaymentMethods(methods)
          if (methods[0]) {
            setSelectedMethodId(String(methods[0].id))
          }
        }
      } catch (error) {
        if (active) {
          setConfig(defaultConfig)
          setPaymentMethods([
            {
              id: 'fallback-trc20',
              display_name: 'TRC20 / USDT',
              chain_name: 'TRC20',
              token_name: 'USDT',
              address: defaultConfig.trc20_address,
              active: true,
              sort_order: 1,
            },
            {
              id: 'fallback-base',
              display_name: 'BASE / USDC',
              chain_name: 'BASE',
              token_name: 'USDC',
              address: defaultConfig.base_address,
              active: true,
              sort_order: 2,
            },
          ])
          setSelectedMethodId('fallback-trc20')
          setConfigError(error instanceof Error ? error.message : 'Failed to load payment config')
        }
      }
    }

    loadConfigAndMethods()

    return () => {
      active = false
    }
  }, [])

  const selectedMethod = useMemo(
    () => paymentMethods.find((item) => String(item.id) === selectedMethodId) || null,
    [paymentMethods, selectedMethodId]
  )

  const selectedMethodLabel = useMemo(() => getMethodLabel(selectedMethod), [selectedMethod])
  const selectedMethodShortLabel = useMemo(
    () => getMethodShortLabel(selectedMethod),
    [selectedMethod]
  )

  const selectedAddress = useMemo(() => {
    if (selectedMethod?.address) return String(selectedMethod.address)
    return ''
  }, [selectedMethod])

  const productTitle = useMemo(() => {
    if (productType === 'tg_premium') {
      const durationText =
        duration === '3m' ? t.home.months3 : duration === '6m' ? t.home.months6 : t.home.months12
      return `${t.home.tgPremium} ${durationText}`
    }

    if (productType === 'tg_stars') {
      return `${t.home.tgStars} ${starsAmount}`
    }

    return '-'
  }, [duration, productType, starsAmount, t])

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(selectedAddress)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      // ignore
    }
  }

  function handleProofChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setProofName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      setProofBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleFieldFocus(event: FocusEvent<HTMLInputElement>) {
    scheduleFieldIntoView(event.currentTarget)
  }

  async function handleSubmit() {
    setSubmitError('')

    if (!isOrderContextValid) {
      setSubmitError(ui.invalidParamsHint)
      return
    }

    if (!selectedMethodLabel || !selectedAddress) {
      setSubmitError(ui.createError)
      return
    }

    if (!txHash.trim()) {
      setSubmitError(ui.txHashRequired)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(CREATE_ORDER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          product_type: productType,
          duration: productType === 'tg_premium' ? duration : null,
          stars_amount: productType === 'tg_stars' ? starsAmount : null,
          price_usd: priceUsd,
          payment_network: selectedMethodLabel,
          tx_hash: txHash.trim(),
          proof_image_base64: proofBase64 || null,
        }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || ui.createError)
      }

      setCreatedOrderNo(data?.order_no || data?.order?.order_no || '')
      setSuccessVisible(true)
      setTxHash('')
      setProofName('')
      setProofBase64('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : ui.createError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="site-shell pay-page-shell">
      <div className="site-container">
        <section className="hero-center hero-stack hero-stair-wrap">
          <h1 className="brand-title hero-step hero-step-1">{t.common.brand}</h1>
          <p className="brand-slogan hero-step hero-step-2">{t.common.slogan}</p>

          <div className="hero-stair hero-step hero-step-3">
            <div className="hero-tools">
              <LanguageSwitcher size="compact" />
            </div>

            <div className="hero-mode">
              <ThemeToggle />
            </div>
          </div>
        </section>

        <div className="pay-back-wrap">
          <a href={withLang('/', lang)} className="back-link back-link-pill">
            <span className="back-link-arrow">←</span>
            <span>{ui.back}</span>
          </a>
        </div>

        {!isOrderContextValid ? (
          <section className="pay-main-card card-soft">
            <div className="pay-title">{ui.invalidParams}</div>
            <div className="status-box-error">{ui.invalidParamsHint}</div>
          </section>
        ) : (
          <section className="pay-main-card card-soft">
            <div className="pay-title">{ui.title}</div>
            <div className="small-muted pay-subtitle">{ui.subtitle}</div>

            {configError ? <div className="status-box-error">{configError}</div> : null}

            <div className="pay-grid">
              <div className="pay-info-card card-soft-sub">
                <div className="section-mini-title">{ui.summaryTitle}</div>

                <div className="summary-row">
                  <span>{ui.product}</span>
                  <strong>{productTitle}</strong>
                </div>

                <div className="summary-row">
                  <span>{ui.username}</span>
                  <strong>{username}</strong>
                </div>

                <div className="summary-row">
                  <span>{ui.email}</span>
                  <strong>{email}</strong>
                </div>

                <div className="summary-row summary-row-amount">
                  <span>{ui.amountDue}</span>
                  <strong>${formatMoney(priceUsd)}</strong>
                </div>
              </div>

              <div className="pay-info-card card-soft-sub">
                <div className="section-mini-title">{ui.networkTitle}</div>

                <div className="network-switch">
                  {paymentMethods.map((item) => {
                    const itemId = String(item.id)
                    const active = itemId === selectedMethodId

                    return (
                      <button
                        key={itemId}
                        type="button"
                        className={`network-option ${active ? 'active' : ''}`}
                        onClick={() => setSelectedMethodId(itemId)}
                      >
                        {getMethodLabel(item)}
                      </button>
                    )
                  })}
                </div>

                <div className="address-card">
                  <div className="address-label">{ui.addressTitle}</div>
                  <div className="address-value">{selectedAddress}</div>

                  <button
                    type="button"
                    className="btn-secondary small-line-button"
                    onClick={copyAddress}
                  >
                    {copyState === 'copied' ? ui.copied : ui.copy}
                  </button>
                </div>
              </div>
            </div>

            <div className="notice-grid">
              <div className="notice-card notice-card-warning">
                <div className="section-mini-title">{ui.warningTitle}</div>
                <div className="notice-text">{getWarningText(lang, selectedMethodShortLabel)}</div>
              </div>

              <div className="notice-card">
                <div className="section-mini-title">{ui.deliveryTitle}</div>
                <div className="notice-text">{ui.deliveryText}</div>
              </div>
            </div>

            <div className="proof-card card-soft-sub">
              <div className="section-mini-title">{ui.txHashTitle}</div>
              <div className="small-muted proof-hint">{ui.txHashHint}</div>

              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                onFocus={handleFieldFocus}
                placeholder={ui.txHashPlaceholder}
                className="input"
              />

              <div className="section-mini-title proof-second-title">{ui.proofTitle}</div>
              <div className="small-muted proof-hint">{ui.proofHint}</div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProofChange}
                className="native-file-input"
              />

              <div className="file-upload-shell">
                <button
                  type="button"
                  className="file-trigger"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {ui.uploadButton}
                </button>

                <div className="file-name" title={proofName || ui.noFile}>
                  {proofName || ui.noFile}
                </div>
              </div>

              {proofName ? (
                <div className="small-muted proof-ready">
                  {ui.proofReady} {proofName}
                </div>
              ) : null}

              {submitError ? <div className="status-box-error">{submitError}</div> : null}

              <button type="button" className="btn-primary" onClick={handleSubmit}>
                {submitting ? ui.submitting : ui.submit}
              </button>
            </div>

            {successVisible ? (
              <div className="status-box-success success-box">
                <div className="success-title">{ui.successTitle}</div>
                <div className="success-text">{ui.successText}</div>
                {createdOrderNo ? <div className="success-order-no">#{createdOrderNo}</div> : null}

                <a href={withLang('/lookup', lang)} className="btn-secondary link-button success-link">
                  {ui.trackOrder}
                </a>
              </div>
            ) : null}
          </section>
        )}

        <footer className="footer">
          <p>© 2026 Agnopol. All rights reserved.</p>

          <p className="footer-email">
            <span className="footer-email-label">{t.common.officialEmail}:</span>{' '}
            <a href="mailto:hello@agnopol.com">hello@agnopol.com</a>
          </p>

          <div className="footer-links">
            <a href={withLang('/legal#terms', lang)}>{t.common.footerTerms}</a>
            <a href={withLang('/legal#privacy', lang)}>{t.common.footerPrivacy}</a>
            <a href={withLang('/legal#risk', lang)}>{t.common.footerRisk}</a>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .pay-page-shell {
          min-height: 100vh;
          padding: clamp(16px, 3vw, 28px) clamp(14px, 4vw, 24px) 36px;
          background:
            radial-gradient(circle at top, rgba(82, 110, 255, 0.07), transparent 36%),
            var(--bg-page, #f6f8fc);
        }

        .site-container {
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
        }

        .card-soft,
        .card-soft-sub {
          border-radius: 28px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          backdrop-filter: blur(14px);
          box-sizing: border-box;
          min-width: 0;
        }

        .card-soft-sub {
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          border-radius: 22px;
          box-shadow: none;
        }

        .hero-center {
          text-align: center;
          margin-bottom: 12px;
        }

        .hero-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .hero-stair-wrap {
          width: 100%;
          max-width: min(100%, 560px);
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

        .hero-stair {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
        }

        .hero-tools,
        .hero-mode {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .hero-tools {
          max-width: clamp(176px, 42vw, 196px);
        }

        .hero-mode {
          max-width: clamp(148px, 34vw, 164px);
          margin-top: -2px;
          margin-bottom: 10px;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(48px, 9vw, 86px);
          line-height: 0.95;
          font-weight: 900;
          color: var(--text-strong, #08142f);
          letter-spacing: -0.04em;
        }

        .brand-slogan {
          margin: 6px 0 0;
          padding: 0 10px;
          max-width: 100%;
          font-size: clamp(15px, 1.9vw, 18px);
          color: var(--text-soft, #7b8798);
        }

        .pay-back-wrap {
          max-width: 700px;
          margin: 0 auto 16px;
        }

        .back-link {
          color: var(--text-main, #0a1736);
          text-decoration: none;
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease;
        }

        .back-link:hover {
          transform: translateY(-1px);
        }

        .back-link-pill {
          width: 100%;
          min-height: 52px;
          padding: 0 18px;
          border-radius: 20px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-sizing: border-box;
          font-size: 15px;
          font-weight: 800;
        }

        .back-link-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          line-height: 1;
        }

        .pay-main-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          box-sizing: border-box;
          min-width: 0;
        }

        .pay-title {
          font-size: clamp(26px, 4.8vw, 34px);
          font-weight: 900;
          color: var(--text-main, #0a1736);
        }

        .pay-subtitle {
          margin-top: 8px;
          margin-bottom: 16px;
          color: var(--text-soft, #7b8798);
          line-height: 1.7;
        }

        .pay-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          min-width: 0;
        }

        .pay-info-card,
        .proof-card {
          padding: 16px;
          box-sizing: border-box;
          min-width: 0;
        }

        .section-mini-title {
          font-size: 16px;
          font-weight: 900;
          color: var(--text-main, #0a1736);
          margin-bottom: 12px;
        }

        .proof-second-title {
          margin-top: 6px;
          margin-bottom: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(10, 23, 54, 0.06);
          color: var(--text-main, #0a1736);
          font-size: 14px;
          min-width: 0;
        }

        .summary-row span,
        .summary-row strong {
          min-width: 0;
        }

        .summary-row strong {
          text-align: right;
          word-break: break-word;
        }

        .summary-row:last-child {
          border-bottom: 0;
        }

        .summary-row-amount strong {
          font-size: 20px;
          color: var(--brand, #0b2570);
        }

        .network-switch {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .network-option {
          min-height: 48px;
          border-radius: 16px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          color: var(--text-main, #0a1736);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            border-color 0.16s ease;
          padding: 8px 10px;
          word-break: break-word;
          text-align: center;
        }

        .network-option:hover {
          transform: translateY(-1px);
        }

        .network-option.active {
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
          border-color: var(--brand, #0b2570);
        }

        .address-card {
          margin-top: 14px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(11, 37, 112, 0.04);
          border: 1px solid rgba(11, 37, 112, 0.1);
          min-width: 0;
          box-sizing: border-box;
        }

        .address-label {
          font-size: 13px;
          color: var(--text-soft, #7b8798);
          margin-bottom: 8px;
        }

        .address-value {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-main, #0a1736);
          word-break: break-all;
          margin-bottom: 12px;
        }

        .notice-grid {
          display: grid;
          gap: 12px;
          margin-top: 14px;
          min-width: 0;
        }

        .notice-card {
          padding: 16px;
          border-radius: 22px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          box-sizing: border-box;
          min-width: 0;
        }

        .notice-card-warning {
          background: rgba(255, 179, 0, 0.08);
          border-color: rgba(255, 179, 0, 0.22);
        }

        .notice-text {
          color: var(--text-main, #0a1736);
          line-height: 1.7;
          font-size: 14px;
          word-break: break-word;
        }

        .proof-card {
          margin-top: 14px;
          display: grid;
          gap: 10px;
          min-width: 0;
        }

        .proof-hint,
        .proof-ready {
          color: var(--text-soft, #7b8798);
          word-break: break-word;
        }

        .input {
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, #fff);
          color: var(--text-main, #0a1736);
          padding: 0 16px;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }

        .input::placeholder {
          color: var(--text-soft, #7b8798);
        }

        .native-file-input {
          display: none;
        }

        .file-upload-shell {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          box-sizing: border-box;
        }

        .file-trigger {
          flex: 0 0 auto;
          min-height: 46px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1.5px solid var(--brand, #0b2570);
          background: rgba(11, 37, 112, 0.04);
          color: var(--brand, #0b2570);
          font-size: 14px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .file-name {
          flex: 1 1 220px;
          min-width: 0;
          min-height: 46px;
          padding: 0 14px;
          border-radius: 16px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          color: var(--text-soft, #7b8798);
          font-size: 14px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-primary,
        .btn-secondary,
        .small-line-button,
        .file-trigger {
          appearance: none;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease,
            border-color 0.16s ease;
        }

        .btn-primary:hover,
        .btn-secondary:hover,
        .small-line-button:hover,
        .file-trigger:hover {
          transform: translateY(-1px);
        }

        .btn-primary {
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
          font-size: 15px;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(11, 37, 112, 0.2);
          border: 0;
          box-sizing: border-box;
          max-width: 100%;
        }

        .btn-secondary,
        .small-line-button,
        .link-button {
          width: 100%;
          min-height: 48px;
          border-radius: 16px;
          background: rgba(11, 37, 112, 0.04);
          color: var(--brand, #0b2570);
          border: 1.5px solid var(--brand, #0b2570);
          font-size: 14px;
          font-weight: 800;
          box-sizing: border-box;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-secondary:hover,
        .small-line-button:hover,
        .link-button:hover,
        .file-trigger:hover {
          background: rgba(11, 37, 112, 0.08);
        }

        .status-box-error,
        .status-box-success {
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 14px;
          line-height: 1.6;
          margin-top: 10px;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          word-break: break-word;
        }

        .status-box-error {
          background: rgba(220, 53, 69, 0.08);
          border: 1px solid rgba(220, 53, 69, 0.18);
          color: #b42318;
        }

        .status-box-success {
          background: rgba(18, 183, 106, 0.08);
          border: 1px solid rgba(18, 183, 106, 0.18);
          color: #067647;
        }

        .success-box {
          margin-top: 14px;
        }

        .success-title {
          font-size: 16px;
          font-weight: 900;
        }

        .success-text {
          margin-top: 6px;
        }

        .success-order-no {
          margin-top: 8px;
          font-weight: 900;
        }

        .success-link {
          margin-top: 12px;
        }

        .footer {
          text-align: center;
          margin-top: 26px;
          padding-top: 8px;
          color: var(--text-soft, #7b8798);
          font-size: 14px;
        }

        .footer p {
          margin: 8px 0;
        }

        .footer-email-label {
          color: var(--text-main, #0a1736);
          font-weight: 700;
        }

        .footer-email a,
        .footer-links a {
          color: var(--text-main, #0a1736);
          text-decoration: none;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px 18px;
          margin-top: 10px;
        }

        @media (min-width: 768px) {
          .hero-tools {
            transform: translateX(-18px);
          }

          .hero-mode {
            transform: translateX(18px);
          }
        }

        @media (max-width: 767px) {
          .pay-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .pay-page-shell {
            padding: 14px 12px 30px;
          }

          .hero-stair {
            gap: 9px;
            margin-top: 12px;
          }

          .hero-tools {
            max-width: min(100%, 190px);
            transform: none;
          }

          .hero-mode {
            max-width: min(100%, 156px);
            margin-bottom: 10px;
            transform: none;
          }

          .brand-slogan {
            padding: 0 6px;
          }

          .pay-main-card {
            padding: 16px;
          }

          .file-upload-shell {
            align-items: stretch;
          }

          .file-trigger,
          .file-name {
            width: 100%;
          }

          .footer-links {
            gap: 10px 14px;
          }
        }

        @media (max-width: 420px) {
          .pay-page-shell {
            padding-left: 10px;
            padding-right: 10px;
          }

          .brand-title {
            font-size: clamp(42px, 15vw, 60px);
          }
        }
      `}</style>
    </main>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={null}>
      <PayPageInner />
    </Suspense>
  )
}
