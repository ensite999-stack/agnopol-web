'use client'

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

type PayParams = {
  username: string
  email: string
  productType: string
  duration: string
  starsAmount: string
  priceUsd: string
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

type PaymentMethod = {
  id: number
  display_name: string
  chain_name: string
  token_name: string
  address: string
  sort_order: number
  is_enabled: boolean
}

const defaultConfig: PublicConfig = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  trc20_address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  base_address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
}

function getQueryParams(): PayParams {
  if (typeof window === 'undefined') {
    return {
      username: '',
      email: '',
      productType: 'tg_premium',
      duration: '12m',
      starsAmount: '50',
      priceUsd: '0',
    }
  }

  const searchParams = new URLSearchParams(window.location.search)

  return {
    username: (searchParams.get('username') || '').trim(),
    email: (searchParams.get('email') || '').trim().toLowerCase(),
    productType: searchParams.get('product_type') || 'tg_premium',
    duration: searchParams.get('duration') || '12m',
    starsAmount: searchParams.get('stars_amount') || '50',
    priceUsd: searchParams.get('price_usd') || '0',
  }
}

function buildUi(lang: string) {
  if (lang === 'de') {
    return {
      title: 'Zahlung',
      subtitle: 'Schließen Sie Ihre Bestellung sicher ab.',
      back: 'Zurück',
      summary: 'Bestellübersicht',
      product: 'Produkt',
      amount: 'Betrag',
      username: 'Telegram-Benutzername',
      email: 'E-Mail',
      warningTitle: 'Wichtiger Hinweis',
      warningBody:
        'Bitte verwenden Sie für die Überweisung nur die zur aktuell ausgewählten Zahlungsmethode passende korrekte Chain und Coin. Verwenden Sie keine andere Chain. Der eingegangene Betrag muss exakt dem Bestellbetrag entsprechen.',
      eta: 'Zur Gewährleistung der Sicherheit der Gelder und der Compliance-Prüfung beträgt unsere Standardbearbeitungszeit 5 bis 15 Minuten. Bei Netzüberlastung kann es bis zu 2 Stunden dauern.',
      paymentMethod: 'Zahlungsmethode',
      network: 'Netzwerk',
      copy: 'Kopieren',
      copied: 'Kopiert',
      copySuccess: 'Empfangsadresse wurde kopiert.',
      uploadTitle: 'Zahlungsnachweis',
      uploadHint: 'Laden Sie einen Screenshot Ihres abgeschlossenen Transfers hoch.',
      selectFile: 'Datei auswählen',
      proofReady: 'Nachweisdatei ist bereit.',
      noProof: 'Noch kein Nachweis hochgeladen.',
      preview: 'Vorschau',
      txHashTitle: 'Transaktions-Hash',
      txHashPlaceholder: 'Optionaler Transaktions-Hash',
      proofOrHashHint: 'Sie können einen Screenshot hochladen und/oder einen Transaktions-Hash eingeben.',
      submit: 'Zahlung bestätigen',
      submitting: 'Wird bestätigt...',
      orderCreated: 'Zahlungsinformationen wurden erfolgreich übermittelt.',
      orderNo: 'Bestellnummer',
      successDesc:
        'Ihre Bestellung befindet sich nun in Bearbeitung. Bitte prüfen Sie die Bestelldetails später über die Bestellabfrage auf der Startseite.',
      lockedHint:
        'Diese Zahlungsseite ist nach dem Absenden gesperrt. Falls Sie einen Nachweis erneut hochladen müssen, warten Sie bitte auf einen Hinweis des Admins und nutzen Sie dann die Bestellabfrage auf der Startseite.',
      invalidOrder: 'Ungültige Bestellinformationen.',
      createError: 'Übermittlung der Zahlung fehlgeschlagen.',
      goLookup: 'Zur Bestellabfrage auf der Startseite',
    }
  }

  if (lang === 'es') {
    return {
      title: 'Pago',
      subtitle: 'Complete su pedido de forma segura.',
      back: 'Volver',
      summary: 'Resumen del pedido',
      product: 'Producto',
      amount: 'Importe',
      username: 'Nombre de usuario de Telegram',
      email: 'Correo electrónico',
      warningTitle: 'Aviso importante',
      warningBody:
        'Para la transferencia, utilice únicamente la cadena y la moneda correctas correspondientes al método de pago seleccionado actualmente. No utilice otra red. El importe recibido debe coincidir exactamente con el importe del pedido.',
      eta: 'Para garantizar la seguridad de los fondos y la revisión de cumplimiento, nuestro tiempo estándar de procesamiento es de 5 a 15 minutos. En caso de congestión de red, puede tardar hasta 2 horas.',
      paymentMethod: 'Método de pago',
      network: 'Red',
      copy: 'Copiar',
      copied: 'Copiado',
      copySuccess: 'La dirección de recepción se ha copiado.',
      uploadTitle: 'Comprobante de pago',
      uploadHint: 'Suba una captura de pantalla de su pago completado.',
      selectFile: 'Seleccionar archivo',
      proofReady: 'El archivo del comprobante está listo.',
      noProof: 'Aún no se ha subido ningún comprobante.',
      preview: 'Vista previa',
      txHashTitle: 'Hash de transacción',
      txHashPlaceholder: 'Hash de transacción opcional',
      proofOrHashHint: 'Puede subir una captura y/o introducir un hash de transacción.',
      submit: 'Confirmar pago',
      submitting: 'Enviando...',
      orderCreated: 'La información del pago se ha enviado correctamente.',
      orderNo: 'Número de pedido',
      successDesc:
        'Su pedido ha entrado en proceso. Consulte más tarde los detalles desde la búsqueda de pedidos en la página principal.',
      lockedHint:
        'Esta página de pago queda bloqueada después del envío. Si necesita volver a subir un comprobante, espere la indicación del administrador y use la búsqueda de pedidos de la página principal.',
      invalidOrder: 'Información de pedido no válida.',
      createError: 'No se pudo enviar el pago.',
      goLookup: 'Ir a la búsqueda de pedidos',
    }
  }

  if (lang === 'fr') {
    return {
      title: 'Paiement',
      subtitle: 'Finalisez votre commande en toute sécurité.',
      back: 'Retour',
      summary: 'Résumé de la commande',
      product: 'Produit',
      amount: 'Montant',
      username: "Nom d'utilisateur Telegram",
      email: 'E-mail',
      warningTitle: 'Avis important',
      warningBody:
        "Pour le transfert, utilisez uniquement la chaîne et le jeton corrects correspondant au mode de paiement actuellement sélectionné. N'utilisez aucun autre réseau. Le montant reçu doit correspondre exactement au montant de la commande.",
      eta: "Afin de garantir la sécurité des fonds et le contrôle de conformité, notre délai de traitement standard est de 5 à 15 minutes. En cas de congestion du réseau, cela peut prendre jusqu'à 2 heures.",
      paymentMethod: 'Mode de paiement',
      network: 'Réseau',
      copy: 'Copier',
      copied: 'Copié',
      copySuccess: "L'adresse de réception a été copiée.",
      uploadTitle: 'Preuve de paiement',
      uploadHint: "Téléversez une capture d'écran de votre paiement effectué.",
      selectFile: 'Choisir un fichier',
      proofReady: 'Le fichier de preuve est prêt.',
      noProof: "Aucune preuve n'a encore été téléversée.",
      preview: 'Aperçu',
      txHashTitle: 'Hash de transaction',
      txHashPlaceholder: 'Hash de transaction facultatif',
      proofOrHashHint: "Vous pouvez téléverser une capture d'écran et/ou saisir un hash de transaction.",
      submit: 'Confirmer le paiement',
      submitting: 'Envoi...',
      orderCreated: 'Les informations de paiement ont été envoyées avec succès.',
      orderNo: 'N° de commande',
      successDesc:
        "Votre commande est en cours de traitement. Veuillez consulter plus tard les détails depuis la recherche de commande sur la page d'accueil.",
      lockedHint:
        "Cette page de paiement est verrouillée après l'envoi. Si vous devez soumettre à nouveau une preuve, attendez l'instruction de l'administrateur puis utilisez la recherche de commande de la page d'accueil.",
      invalidOrder: 'Informations de commande invalides.',
      createError: "Échec de l'envoi du paiement.",
      goLookup: "Aller à la recherche de commande",
    }
  }

  if (lang === 'ja') {
    return {
      title: '支払い',
      subtitle: 'ご注文の支払いを安全に完了してください。',
      back: '戻る',
      summary: '注文概要',
      product: '商品',
      amount: '金額',
      username: 'Telegramユーザー名',
      email: 'メール',
      warningTitle: '重要なお知らせ',
      warningBody:
        '送金の際は、現在選択中の支払い方法に対応する正しいチェーンと通貨のみを使用してください。他のネットワークは使用しないでください。着金額は注文金額と完全に一致している必要があります。',
      eta: '資金の安全性とコンプライアンス確認のため、通常の処理時間は5〜15分です。ネットワーク混雑時は最大2時間かかる場合があります。',
      paymentMethod: '支払い方法',
      network: 'ネットワーク',
      copy: 'コピー',
      copied: 'コピー済み',
      copySuccess: '受取アドレスをコピーしました。',
      uploadTitle: '支払い証明',
      uploadHint: '支払い完了後のスクリーンショットをアップロードしてください。',
      selectFile: 'ファイルを選択',
      proofReady: '証明ファイルの準備ができました。',
      noProof: 'まだ証明ファイルはアップロードされていません。',
      preview: 'プレビュー',
      txHashTitle: 'トランザクションハッシュ',
      txHashPlaceholder: '任意のトランザクションハッシュ',
      proofOrHashHint: 'スクリーンショットのアップロード、および/またはトランザクションハッシュの入力ができます。',
      submit: '支払いを確認',
      submitting: '送信中...',
      orderCreated: '支払い情報を正常に送信しました。',
      orderNo: '注文番号',
      successDesc:
        'ご注文は現在処理中です。詳細は後ほどトップページの注文照会からご確認ください。',
      lockedHint:
        'この支払いページは送信後にロックされます。証明を再提出する必要がある場合は、管理者からの案内を待ってからトップページの注文照会をご利用ください。',
      invalidOrder: '注文情報が無効です。',
      createError: '支払いの送信に失敗しました。',
      goLookup: 'トップページで注文を確認',
    }
  }

  if (lang === 'ko') {
    return {
      title: '결제',
      subtitle: '주문 결제를 안전하게 완료하세요.',
      back: '뒤로',
      summary: '주문 요약',
      product: '상품',
      amount: '금액',
      username: 'Telegram 사용자명',
      email: '이메일',
      warningTitle: '중요 안내',
      warningBody:
        '송금 시 현재 선택한 결제수단에 해당하는 올바른 체인과 코인만 사용하세요. 다른 네트워크는 사용하지 마세요. 실제 입금 금액은 주문 금액과 정확히 일치해야 합니다.',
      eta: '자금 보안과 규정 준수 검토를 위해 기본 처리 시간은 5~15분입니다. 네트워크 혼잡 시 최대 2시간이 걸릴 수 있습니다.',
      paymentMethod: '결제 방식',
      network: '네트워크',
      copy: '복사',
      copied: '복사됨',
      copySuccess: '수금 주소가 복사되었습니다.',
      uploadTitle: '결제 증빙',
      uploadHint: '결제가 완료된 스크린샷 증빙을 업로드하세요.',
      selectFile: '파일 선택',
      proofReady: '증빙 파일이 준비되었습니다.',
      noProof: '아직 업로드된 증빙이 없습니다.',
      preview: '미리보기',
      txHashTitle: '거래 해시',
      txHashPlaceholder: '선택 입력 거래 해시',
      proofOrHashHint: '스크린샷을 업로드하고/또는 거래 해시를 입력할 수 있습니다.',
      submit: '결제 확인',
      submitting: '제출 중...',
      orderCreated: '결제 정보가 성공적으로 제출되었습니다.',
      orderNo: '주문번호',
      successDesc:
        '주문이 처리 대기열에 들어갔습니다. 자세한 내용은 나중에 홈페이지 주문 조회에서 확인하세요.',
      lockedHint:
        '이 결제 페이지는 제출 후 잠깁니다. 증빙을 다시 제출해야 하면 관리자 안내를 기다린 뒤 홈페이지 주문 조회를 이용하세요.',
      invalidOrder: '주문 정보가 유효하지 않습니다.',
      createError: '결제 제출에 실패했습니다.',
      goLookup: '홈페이지 주문 조회로 이동',
    }
  }

  if (lang === 'zh-cn') {
    return {
      title: '付款',
      subtitle: '安全完成您的订单付款。',
      back: '返回',
      summary: '订单摘要',
      product: '产品',
      amount: '金额',
      username: 'Telegram 用户名',
      email: '邮箱',
      warningTitle: '重要提示',
      warningBody:
        '转账请使用当前所选支付方式对应的正确链与币种，不要使用其他网络。实际到账金额必须与订单金额完全一致。',
      eta: '为了确保资金安全与合规审查，我们的标准处理时间为 5 - 15 分钟。在网络拥堵时，最迟不超过 2 小时。',
      paymentMethod: '支付方式',
      network: '网络',
      copy: '复制',
      copied: '已复制',
      copySuccess: '收款地址已复制。',
      uploadTitle: '支付凭证',
      uploadHint: '上传您已完成支付的截图凭证。',
      selectFile: '选择文件',
      proofReady: '凭证文件已就绪。',
      noProof: '暂未上传凭证。',
      preview: '预览',
      txHashTitle: '交易哈希',
      txHashPlaceholder: '可选填写交易哈希',
      proofOrHashHint: '您可以上传截图，和/或填写交易哈希。',
      submit: '确认付款',
      submitting: '确认中...',
      orderCreated: '付款信息已提交成功。',
      orderNo: '订单号',
      successDesc:
        '您的订单已进入处理流程。预计五分钟内处理完成，请稍后通过首页订单查询功能查看订单详细信息。',
      lockedHint:
        '当前支付页已锁定，不能再次修改付款凭证。如需补交，请等待后台提示后，通过首页订单查询页重新上传。',
      invalidOrder: '订单信息无效。',
      createError: '提交付款失败。',
      goLookup: '返回首页查询订单',
    }
  }

  if (lang === 'zh-tw') {
    return {
      title: '付款',
      subtitle: '安全完成您的訂單付款。',
      back: '返回',
      summary: '訂單摘要',
      product: '產品',
      amount: '金額',
      username: 'Telegram 用戶名',
      email: '電子郵件',
      warningTitle: '重要提示',
      warningBody:
        '轉帳請使用目前所選支付方式對應的正確鏈與幣種，不要使用其他網路。實際到帳金額必須與訂單金額完全一致。',
      eta: '為了確保資金安全與合規審查，我們的標準處理時間為 5 - 15 分鐘。在網路擁堵時，最遲不超過 2 小時。',
      paymentMethod: '支付方式',
      network: '網路',
      copy: '複製',
      copied: '已複製',
      copySuccess: '收款地址已複製。',
      uploadTitle: '支付憑證',
      uploadHint: '上傳您已完成支付的截圖憑證。',
      selectFile: '選擇文件',
      proofReady: '憑證文件已就緒。',
      noProof: '暫未上傳憑證。',
      preview: '預覽',
      txHashTitle: '交易哈希',
      txHashPlaceholder: '可選填寫交易哈希',
      proofOrHashHint: '您可以上傳截圖，和/或填寫交易哈希。',
      submit: '確認付款',
      submitting: '確認中...',
      orderCreated: '付款資訊已提交成功。',
      orderNo: '訂單號',
      successDesc:
        '您的訂單已進入處理流程。預計五分鐘內處理完成，請稍後透過首頁訂單查詢功能查看訂單詳細資訊。',
      lockedHint:
        '當前支付頁已鎖定，不能再次修改付款憑證。如需補交，請等待後台提示後，透過首頁訂單查詢頁重新上傳。',
      invalidOrder: '訂單資訊無效。',
      createError: '提交付款失敗。',
      goLookup: '返回首頁查詢訂單',
    }
  }

  return {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    username: 'Telegram Username',
    email: 'Email',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct network and token for the currently selected payment method only. The received amount must exactly match the order amount.',
    eta: 'For fund security and compliance review, our standard processing time is 5 - 15 minutes. During network congestion, it may take up to 2 hours.',
    paymentMethod: 'Payment Method',
    network: 'Network',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    proofReady: 'Proof file ready.',
    noProof: 'No proof uploaded yet.',
    preview: 'Preview',
    txHashTitle: 'Transaction Hash',
    txHashPlaceholder: 'Optional transaction hash',
    proofOrHashHint: 'You may upload a screenshot and/or enter a transaction hash.',
    submit: 'Confirm Payment',
    submitting: 'Submitting...',
    orderCreated: 'Payment information submitted successfully.',
    orderNo: 'Order No',
    successDesc:
      'Your order has entered processing. Please check the order details later from the homepage lookup.',
    lockedHint:
      'This payment page is locked after submission. If you need to resubmit proof, wait for the admin instruction and use the homepage order lookup page.',
    invalidOrder: 'Invalid order information.',
    createError: 'Failed to submit payment.',
    goLookup: 'Go to homepage lookup',
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getMissingUsernameMessage(lang: string) {
  if (lang === 'de') return 'Bitte geben Sie Ihren Telegram-Benutzernamen ein.'
  if (lang === 'es') return 'Por favor, introduzca su nombre de usuario de Telegram.'
  if (lang === 'fr') return "Veuillez saisir votre nom d'utilisateur Telegram."
  if (lang === 'ja') return 'Telegramユーザー名を入力してください。'
  if (lang === 'ko') return 'Telegram 사용자명을 입력하세요.'
  if (lang === 'zh-cn') return '请输入 TG 用户名。'
  if (lang === 'zh-tw') return '請輸入 TG 用戶名。'
  return 'Please enter your Telegram username.'
}

function getMissingEmailMessage(lang: string) {
  if (lang === 'de') return 'Bitte geben Sie Ihre E-Mail-Adresse ein.'
  if (lang === 'es') return 'Por favor, introduzca su correo electrónico.'
  if (lang === 'fr') return 'Veuillez saisir votre e-mail.'
  if (lang === 'ja') return 'メールアドレスを入力してください。'
  if (lang === 'ko') return '이메일을 입력하세요.'
  if (lang === 'zh-cn') return '请输入邮箱地址。'
  if (lang === 'zh-tw') return '請輸入電子郵件地址。'
  return 'Please enter your email address.'
}

function getInvalidEmailMessage(lang: string) {
  if (lang === 'de') return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  if (lang === 'es') return 'Por favor, introduzca un correo electrónico válido.'
  if (lang === 'fr') return 'Veuillez saisir une adresse e-mail valide.'
  if (lang === 'ja') return '有効なメールアドレスを入力してください。'
  if (lang === 'ko') return '올바른 이메일 주소를 입력하세요.'
  if (lang === 'zh-cn') return '请输入有效的邮箱地址。'
  if (lang === 'zh-tw') return '請輸入有效的電子郵件地址。'
  return 'Please enter a valid email address.'
}

function getNoPaymentMethodMessage(lang: string) {
  if (lang === 'zh-cn') return '当前没有可用的支付方式。'
  if (lang === 'zh-tw') return '目前沒有可用的支付方式。'
  if (lang === 'ja') return '現在利用可能な支払い方法がありません。'
  if (lang === 'ko') return '현재 사용 가능한 결제 방식이 없습니다.'
  if (lang === 'de') return 'Derzeit sind keine Zahlungsmethoden verfügbar.'
  if (lang === 'es') return 'Actualmente no hay métodos de pago disponibles.'
  if (lang === 'fr') return "Aucun mode de paiement n'est actuellement disponible."
  return 'No enabled payment methods are available.'
}

export default function PayPage() {
  const { lang, t } = useI18n()
  const ui = useMemo(() => buildUi(lang), [lang])

  const [params, setParams] = useState<PayParams>({
    username: '',
    email: '',
    productType: 'tg_premium',
    duration: '12m',
    starsAmount: '50',
    priceUsd: '0',
  })

  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [configError, setConfigError] = useState('')
  const [ready, setReady] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
  const [copiedMethodId, setCopiedMethodId] = useState<number | null>(null)
  const [proofName, setProofName] = useState('')
  const [proofBase64, setProofBase64] = useState('')
  const [proofPreview, setProofPreview] = useState('')
  const [txHash, setTxHash] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOrderNo, setSuccessOrderNo] = useState('')
  const [errorText, setErrorText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let active = true

    async function boot() {
      const nextParams = getQueryParams()
      setParams(nextParams)

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

        const methodsResponse = await fetch('/api/public/payment-methods', {
          cache: 'no-store',
        })
        const methodsData = await methodsResponse.json()

        if (!methodsResponse.ok) {
          throw new Error(methodsData?.error || 'Failed to load payment methods')
        }

        if (active) {
          const nextMethods = Array.isArray(methodsData?.items) ? methodsData.items : []
          setPaymentMethods(nextMethods)
          setSelectedMethodId(nextMethods[0]?.id ?? null)
        }
      } catch (error) {
        if (active) {
          setConfigError(error instanceof Error ? error.message : 'Failed to load config')
          setConfig(defaultConfig)
        }
      } finally {
        if (active) {
          setReady(true)
        }
      }
    }

    boot()

    return () => {
      active = false
    }
  }, [])

  const pageLockKey = useMemo(() => {
    if (!ready) return ''
    return `agnopol-pay-lock:${params.email}:${params.productType}:${params.duration}:${params.starsAmount}:${params.priceUsd}`
  }, [ready, params.email, params.productType, params.duration, params.starsAmount, params.priceUsd])

  useEffect(() => {
    if (!pageLockKey) return

    try {
      const saved = sessionStorage.getItem(pageLockKey)
      if (!saved) return

      const parsed = JSON.parse(saved)
      if (parsed?.order_no) {
        setSuccessOrderNo(parsed.order_no)
        setProofName(parsed.proof_name || '')
        setProofPreview(parsed.proof_preview || '')
        setTxHash(parsed.tx_hash || '')
      }
    } catch {
      // ignore
    }
  }, [pageLockKey])

  const isLocked = Boolean(successOrderNo)

  const selectedMethod = useMemo(
    () => paymentMethods.find((item) => item.id === selectedMethodId) || null,
    [paymentMethods, selectedMethodId]
  )

  const networkAddress = selectedMethod?.address || ''

  const productLabel = useMemo(() => {
    if (params.productType === 'tg_stars') {
      return `${t.home.tgStars} ${params.starsAmount}`
    }

    if (params.duration === '3m') return `${t.home.tgPremium} ${t.home.months3}`
    if (params.duration === '6m') return `${t.home.tgPremium} ${t.home.months6}`
    return `${t.home.tgPremium} ${t.home.months12}`
  }, [params, t])

  async function handleCopy(text: string, methodId: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMethodId(methodId)
      window.setTimeout(() => setCopiedMethodId(null), 1800)
    } catch {
      setCopiedMethodId(null)
    }
  }

  function handleChooseFile() {
    if (isLocked) return
    fileRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setProofName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      setProofBase64(result)
      setProofPreview(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    setErrorText('')

    const trimmedUsername = params.username.trim()
    const trimmedEmail = params.email.trim().toLowerCase()

    if (!trimmedUsername) {
      setErrorText(getMissingUsernameMessage(lang))
      return
    }

    if (!trimmedEmail) {
      setErrorText(getMissingEmailMessage(lang))
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorText(getInvalidEmailMessage(lang))
      return
    }

    if (!params.priceUsd || Number(params.priceUsd) <= 0) {
      setErrorText(ui.invalidOrder)
      return
    }

    if (!selectedMethod) {
      setErrorText(getNoPaymentMethodMessage(lang))
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        username: trimmedUsername,
        email: trimmedEmail,
        product_type: params.productType,
        duration: params.productType === 'tg_premium' ? params.duration : null,
        stars_amount: params.productType === 'tg_stars' ? Number(params.starsAmount) : null,
        price_usd: Number(params.priceUsd),
        payment_network: selectedMethod.display_name,
        payment_address: selectedMethod.address,
        proof_image_base64: proofBase64 || null,
        tx_hash: txHash.trim() || null,
      }

      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || ui.createError)
      }

      const orderNo = String(data?.order_no || '')
      setSuccessOrderNo(orderNo)

      if (pageLockKey) {
        sessionStorage.setItem(
          pageLockKey,
          JSON.stringify({
            order_no: orderNo,
            proof_name: proofName,
            proof_preview: proofPreview,
            tx_hash: txHash.trim(),
          })
        )
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : ui.createError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <a href={`/?lang=${lang}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← {ui.back}
          </a>

          <LanguageSwitcher />
        </div>

        <header className="hero-center" style={{ marginBottom: 18 }}>
          <h1 className="brand-title" style={{ marginBottom: 8 }}>
            {ui.title}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
            {ui.subtitle}
          </p>
        </header>

        {configError ? (
          <div className="status-box-error" style={{ maxWidth: 1120, margin: '0 auto 16px' }}>
            {configError}
          </div>
        ) : null}

        <div className="two-col">
          <section className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
              {ui.summary}
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: 14,
              }}
            >
              ${params.priceUsd}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div className="small-muted">{ui.product}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{productLabel}</div>
              </div>

              <div>
                <div className="small-muted">{ui.amount}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>${params.priceUsd}</div>
              </div>

              <div>
                <div className="small-muted">{ui.username}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {params.username || '-'}
                </div>
              </div>

              <div>
                <div className="small-muted">{ui.email}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {params.email || '-'}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 16,
                padding: 14,
                background: 'rgba(15, 23, 42, 0.035)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: 8,
                }}
              >
                {ui.warningTitle}
              </div>

              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                {ui.warningBody}
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 8px 0' }}>{t.common.slogan}</p>
              <p style={{ margin: 0 }}>{ui.eta}</p>
            </div>
          </section>

          <section className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, color: '#64748b' }}>{ui.paymentMethod}</div>

            <div className="network-tabs">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`network-tab ${selectedMethodId === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMethodId(method.id)}
                  disabled={isLocked}
                >
                  {method.display_name}
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 16,
                background: 'rgba(15, 23, 42, 0.035)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
              }}
            >
              <div className="small-muted" style={{ marginBottom: 6 }}>
                {ui.network}
              </div>

              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                {selectedMethod?.display_name || '-'}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: '#0f172a',
                  wordBreak: 'break-all',
                  lineHeight: 1.7,
                  padding: 12,
                  borderRadius: 12,
                  background: '#fff',
                  border:
                    copiedMethodId === selectedMethod?.id
                      ? '1px solid rgba(34, 197, 94, 0.45)'
                      : '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                {networkAddress}
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => selectedMethod && handleCopy(networkAddress, selectedMethod.id)}
                style={{ marginTop: 10 }}
              >
                {copiedMethodId === selectedMethod?.id ? `${ui.copied} ✓` : ui.copy}
              </button>

              {copiedMethodId === selectedMethod?.id ? (
                <div className="status-box-success" style={{ textAlign: 'center' }}>
                  {ui.copySuccess}
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                {ui.uploadTitle}
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: '1px dashed rgba(15, 23, 42, 0.18)',
                  background: 'rgba(255,255,255,0.62)',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
                  {ui.uploadHint}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleChooseFile}
                  disabled={isLocked}
                  style={{ opacity: isLocked ? 0.7 : 1 }}
                >
                  {ui.selectFile}
                </button>

                <div style={{ marginTop: 10, fontSize: 13, color: '#475569', wordBreak: 'break-all' }}>
                  {proofName ? `${ui.proofReady} ${proofName}` : ui.noProof}
                </div>

                {proofPreview ? (
                  <div style={{ marginTop: 12 }}>
                    <div className="small-muted" style={{ marginBottom: 6 }}>
                      {ui.preview}
                    </div>

                    <img
                      src={proofPreview}
                      alt="proof preview"
                      style={{
                        width: '100%',
                        borderRadius: 14,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : null}

                <div style={{ marginTop: 14, fontSize: 13, color: '#475569', marginBottom: 8 }}>
                  {ui.txHashTitle}
                </div>

                <input
                  value={txHash}
                  onChange={(e) => {
                    if (isLocked) return
                    setTxHash(e.target.value)
                  }}
                  placeholder={ui.txHashPlaceholder}
                  className="input"
                  readOnly={isLocked}
                  style={{
                    padding: 12,
                    fontSize: 14,
                    opacity: isLocked ? 0.85 : 1,
                  }}
                />

                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                  {ui.proofOrHashHint}
                </div>
              </div>
            </div>

            {!isLocked ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !params.username.trim() ||
                  !params.email.trim() ||
                  !isValidEmail(params.email) ||
                  !selectedMethod
                }
                className="btn-primary"
                style={{
                  marginTop: 16,
                  opacity:
                    submitting ||
                    !params.username.trim() ||
                    !params.email.trim() ||
                    !isValidEmail(params.email) ||
                    !selectedMethod
                      ? 0.8
                      : 1,
                }}
              >
                {submitting ? ui.submitting : ui.submit}
              </button>
            ) : null}

            {successOrderNo ? (
              <>
                <div className="status-box-success">
                  <div style={{ fontWeight: 800 }}>{ui.orderCreated}</div>
                  <div style={{ marginTop: 6 }}>
                    {ui.orderNo}: {successOrderNo}
                  </div>
                  <div style={{ marginTop: 8 }}>{ui.successDesc}</div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 16,
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    color: '#92400e',
                    lineHeight: 1.7,
                  }}
                >
                  {ui.lockedHint}
                </div>

                <a
                  href={`/?lang=${lang}`}
                  className="btn-secondary"
                  style={{
                    marginTop: 12,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ui.goLookup}
                </a>
              </>
            ) : null}

            {errorText ? <div className="status-box-error">{errorText}</div> : null}
          </section>
        </div>
      </div>
    </main>
  )
}
