export type LangCode =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'zh-cn'
  | 'zh-tw'

export const LANG_STORAGE_KEY = 'agnopol.lang'

export const languageOptions: { code: LangCode; label: string }[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-cn', label: '简体中文' },
  { code: 'zh-tw', label: '繁體中文' },
]

export function normalizeLang(input?: string | null): LangCode {
  const value = String(input || '').toLowerCase()
  if (value === 'de') return 'de'
  if (value === 'en') return 'en'
  if (value === 'es') return 'es'
  if (value === 'fr') return 'fr'
  if (value === 'ja') return 'ja'
  if (value === 'ko') return 'ko'
  if (value === 'zh-cn' || value === 'zh' || value === 'zh-hans') return 'zh-cn'
  if (value === 'zh-tw' || value === 'zh-hant') return 'zh-tw'
  return 'en'
}

export function detectBrowserLang(): LangCode {
  if (typeof window === 'undefined') return 'en'
  const raw = (navigator.language || 'en').toLowerCase()

  if (raw.startsWith('de')) return 'de'
  if (raw.startsWith('es')) return 'es'
  if (raw.startsWith('fr')) return 'fr'
  if (raw.startsWith('ja')) return 'ja'
  if (raw.startsWith('ko')) return 'ko'
  if (raw.startsWith('zh-tw') || raw.includes('hant')) return 'zh-tw'
  if (raw.startsWith('zh')) return 'zh-cn'
  return 'en'
}

export function withLang(href: string, lang: LangCode) {
  const url = new URL(href, 'https://agnopol.local')
  url.searchParams.set('lang', lang)
  return `${url.pathname}${url.search}${url.hash}`
}

export type Messages = {
  common: {
    brand: string
    slogan: string
    language: string
    back: string
    email: string
    username: string
    copy: string
    copied: string
    loading: string
    officialEmail: string
    rights: string
    footerTerms: string
    footerPrivacy: string
    footerRisk: string
  }
  home: {
    premiumTab: string
    starsTab: string
    premiumPlans: string
    starsPackage: string
    currentSelection: string
    createOrder: string
    usernamePlaceholder: string
    emailPlaceholder: string
    starsAmount: string
    starsPlaceholder: string
    starsMinHint: string
    autoPriceHint: string
    months3: string
    months6: string
    months12: string
    tgPremium: string
    tgStars: string
  }
  lookup: {
    title: string
    subtitle: string
    placeholder: string
    button: string
    loading: string
    notFound: string
    email: string
    orderNo: string
    status: string
    product: string
    amount: string
    network: string
    createdAt: string
    note: string
    pending: string
    processing: string
    completed: string
    failed: string
  }
  pay: {
    title: string
    subtitle: string
    summary: string
    product: string
    amount: string
    paymentMethod: string
    trc20Label: string
    baseLabel: string
    copySuccess: string
    uploadTitle: string
    uploadHint: string
    selectFile: string
    proofReady: string
    noProof: string
    preview: string
    txHashTitle: string
    txHashPlaceholder: string
    proofOrHashHint: string
    submit: string
    submitting: string
    orderCreated: string
    orderNo: string
    successDesc: string
    warningTitle: string
    warningBody: string
    eta: string
    network: string
    invalidOrder: string
    createError: string
  }
  admin: {
    title: string
    subtitle: string
    orders: string
    pricing: string
    settings: string
    pendingOrders: string
    totalOrders: string
    searchPlaceholder: string
    save: string
    saved: string
    customerEmail: string
    telegramUsername: string
    paymentNetwork: string
    createdAt: string
    status: string
  }
}

const en: Messages = {
  common: {
    brand: 'Agnopol',
    slogan: 'One world, one breath.',
    language: 'Language',
    back: 'Back',
    email: 'Email',
    username: 'Telegram Username',
    copy: 'Copy',
    copied: 'Copied',
    loading: 'Loading...',
    officialEmail: 'Official Email',
    rights: '© {year} Agnopol. All rights reserved.',
    footerTerms: 'Terms of Service',
    footerPrivacy: 'Privacy Policy',
    footerRisk: 'Risk Disclosure',
  },
  home: {
    premiumTab: 'Premium',
    starsTab: 'Stars',
    premiumPlans: 'TG Premium Plans',
    starsPackage: 'TG Stars',
    currentSelection: 'Current Selection',
    createOrder: 'Create Order',
    usernamePlaceholder: 'Telegram Username',
    emailPlaceholder: 'Email',
    starsAmount: 'Stars Amount',
    starsPlaceholder: 'Minimum 50',
    starsMinHint: 'Minimum order: 50 stars',
    autoPriceHint: 'Price is calculated automatically',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
    tgPremium: 'TG Premium',
    tgStars: 'TG Stars',
  },
  lookup: {
    title: 'Order Lookup',
    subtitle: 'Enter your email to check recent order records.',
    placeholder: 'Enter your email',
    button: 'Check Orders',
    loading: 'Checking...',
    notFound: 'No orders found for this email.',
    email: 'Email',
    orderNo: 'Order No',
    status: 'Status',
    product: 'Product',
    amount: 'Amount',
    network: 'Payment Network',
    createdAt: 'Created At',
    note: 'Note',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  },
  pay: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    proofReady: 'Proof file ready.',
    noProof: 'No proof uploaded yet.',
    preview: 'Preview',
    txHashTitle: 'Transaction Hash',
    txHashPlaceholder: 'Paste your transaction hash here (optional)',
    proofOrHashHint: 'You may upload a screenshot and/or submit a transaction hash.',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderNo: 'Order No',
    successDesc:
      'Your order has entered the processing queue. Estimated completion time is within 5 minutes. Please return to the homepage and use Order Lookup with your email to check detailed order information.',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    eta:
      'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    network: 'Network',
    invalidOrder:
      'Invalid order information. Please return to the homepage and create the order again.',
    createError: 'Failed to create order.',
  },
  admin: {
    title: 'Admin Console',
    subtitle: 'Unified multilingual admin interface.',
    orders: 'Orders',
    pricing: 'Pricing',
    settings: 'Settings',
    pendingOrders: 'Pending Orders',
    totalOrders: 'Total Orders',
    searchPlaceholder: 'Search by email / order no / username',
    save: 'Save',
    saved: 'Saved',
    customerEmail: 'Customer Email',
    telegramUsername: 'Telegram Username',
    paymentNetwork: 'Payment Network',
    createdAt: 'Created At',
    status: 'Status',
  },
}

const de: Messages = {
  ...en,
  common: {
    ...en.common,
    language: 'Sprache',
    back: 'Zurück',
    email: 'E-Mail',
    username: 'Telegram-Benutzername',
    officialEmail: 'Offizielle E-Mail',
    rights: '© {year} Agnopol. Alle Rechte vorbehalten.',
  },
  home: {
    ...en.home,
    premiumPlans: 'TG Premium Pläne',
    currentSelection: 'Aktuelle Auswahl',
    emailPlaceholder: 'E-Mail',
    starsAmount: 'Stars Menge',
    months3: '3 Monate',
    months6: '6 Monate',
    months12: '12 Monate',
  },
  lookup: {
    ...en.lookup,
    title: 'Bestellabfrage',
    subtitle: 'Geben Sie Ihre E-Mail ein, um aktuelle Bestellungen anzuzeigen.',
    placeholder: 'E-Mail eingeben',
    button: 'Bestellungen prüfen',
    loading: 'Wird geprüft...',
    notFound: 'Keine Bestellungen für diese E-Mail gefunden.',
    email: 'E-Mail',
    orderNo: 'Bestellnummer',
    status: 'Status',
    product: 'Produkt',
    amount: 'Betrag',
    network: 'Zahlungsnetzwerk',
    createdAt: 'Erstellt am',
    note: 'Notiz',
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    failed: 'Fehlgeschlagen',
  },
  pay: {
    ...en.pay,
    title: 'Zahlung',
    subtitle: 'Schließen Sie Ihre Bestellung sicher ab.',
    summary: 'Bestellübersicht',
    product: 'Produkt',
    amount: 'Betrag',
    paymentMethod: 'Zahlungsmethode',
    uploadTitle: 'Zahlungsnachweis',
    uploadHint: 'Laden Sie einen Screenshot Ihrer abgeschlossenen Zahlung hoch.',
    selectFile: 'Datei auswählen',
    proofReady: 'Nachweisdatei bereit.',
    noProof: 'Noch kein Nachweis hochgeladen.',
    preview: 'Vorschau',
    txHashTitle: 'Transaktions-Hash',
    txHashPlaceholder: 'Transaktions-Hash hier einfügen (optional)',
    proofOrHashHint: 'Sie können einen Screenshot hochladen und/oder einen Transaktions-Hash eingeben.',
    submit: 'Zahlung absenden',
    submitting: 'Wird gesendet...',
    orderCreated: 'Bestellung erfolgreich erstellt.',
    orderNo: 'Bestellnummer',
    successDesc:
      'Ihre Bestellung wurde in die Bearbeitungswarteschlange aufgenommen. Die Bearbeitung dauert voraussichtlich bis zu 5 Minuten. Bitte kehren Sie zur Startseite zurück und verwenden Sie die Bestellabfrage mit Ihrer E-Mail.',
    warningTitle: 'Wichtig',
    eta:
      'Zur Gewährleistung von Fondssicherheit und Compliance-Prüfung beträgt unsere Standardlieferzeit 5–15 Minuten. Bei Netzwerküberlastung kann es bis zu 2 Stunden dauern.',
    network: 'Netzwerk',
    invalidOrder:
      'Ungültige Bestellinformationen. Bitte kehren Sie zur Startseite zurück und erstellen Sie die Bestellung erneut.',
    createError: 'Bestellung konnte nicht erstellt werden.',
  },
  admin: {
    ...en.admin,
    title: 'Admin-Konsole',
    subtitle: 'Einheitliche mehrsprachige Verwaltungsoberfläche.',
    orders: 'Bestellungen',
    pricing: 'Preise',
    settings: 'Einstellungen',
    pendingOrders: 'Ausstehende Bestellungen',
    totalOrders: 'Gesamtbestellungen',
    searchPlaceholder: 'Nach E-Mail / Bestellnr. / Benutzername suchen',
    save: 'Speichern',
    saved: 'Gespeichert',
    customerEmail: 'Kunden-E-Mail',
    telegramUsername: 'Telegram-Benutzername',
    paymentNetwork: 'Zahlungsnetzwerk',
    createdAt: 'Erstellt am',
    status: 'Status',
  },
}

const es: Messages = {
  ...en,
  common: {
    ...en.common,
    language: 'Idioma',
    back: 'Volver',
    email: 'Correo electrónico',
    officialEmail: 'Correo oficial',
    rights: '© {year} Agnopol. Todos los derechos reservados.',
  },
  home: {
    ...en.home,
    premiumPlans: 'Planes TG Premium',
    currentSelection: 'Selección actual',
    emailPlaceholder: 'Correo electrónico',
    starsAmount: 'Cantidad de Stars',
    months3: '3 Meses',
    months6: '6 Meses',
    months12: '12 Meses',
  },
  lookup: {
    ...en.lookup,
    title: 'Consulta de pedidos',
    subtitle: 'Introduce tu correo para ver tus pedidos recientes.',
    placeholder: 'Introduce tu correo electrónico',
    button: 'Consultar pedidos',
    loading: 'Consultando...',
    notFound: 'No se encontraron pedidos para este correo.',
    email: 'Correo electrónico',
    orderNo: 'N.º de pedido',
    status: 'Estado',
    product: 'Producto',
    amount: 'Importe',
    network: 'Red de pago',
    createdAt: 'Fecha de creación',
    note: 'Nota',
    pending: 'Pendiente',
    processing: 'En proceso',
    completed: 'Completado',
    failed: 'Fallido',
  },
  pay: {
    ...en.pay,
    title: 'Pago',
    subtitle: 'Completa tu pedido de forma segura.',
    summary: 'Resumen del pedido',
    product: 'Producto',
    amount: 'Importe',
    paymentMethod: 'Método de pago',
    uploadTitle: 'Comprobante de pago',
    uploadHint: 'Sube una captura de pantalla de tu pago completado.',
    selectFile: 'Seleccionar archivo',
    proofReady: 'Archivo de comprobante listo.',
    noProof: 'Aún no se ha subido comprobante.',
    preview: 'Vista previa',
    txHashTitle: 'Hash de transacción',
    txHashPlaceholder: 'Pega aquí tu hash de transacción (opcional)',
    proofOrHashHint: 'Puedes subir una captura y/o enviar un hash de transacción.',
    submit: 'Enviar pago',
    submitting: 'Enviando...',
    orderCreated: 'Pedido creado correctamente.',
    orderNo: 'N.º de pedido',
    successDesc:
      'Tu pedido ha entrado en la cola de procesamiento. El tiempo estimado de finalización es de 5 minutos. Vuelve a la página principal y usa la consulta de pedidos con tu correo electrónico.',
    warningTitle: 'Importante',
    network: 'Red',
    invalidOrder:
      'Información de pedido no válida. Vuelve a la página principal y crea el pedido nuevamente.',
    createError: 'No se pudo crear el pedido.',
  },
  admin: {
    ...en.admin,
    title: 'Panel de administración',
    subtitle: 'Interfaz administrativa multilingüe unificada.',
    orders: 'Pedidos',
    pricing: 'Precios',
    settings: 'Configuración',
    pendingOrders: 'Pedidos pendientes',
    totalOrders: 'Pedidos totales',
    searchPlaceholder: 'Buscar por correo / pedido / usuario',
    save: 'Guardar',
    saved: 'Guardado',
    customerEmail: 'Correo del cliente',
    telegramUsername: 'Usuario de Telegram',
    paymentNetwork: 'Red de pago',
    createdAt: 'Fecha de creación',
    status: 'Estado',
  },
}

const fr: Messages = {
  ...en,
  common: {
    ...en.common,
    language: 'Langue',
    back: 'Retour',
    officialEmail: 'E-mail officiel',
    rights: '© {year} Agnopol. Tous droits réservés.',
  },
  home: {
    ...en.home,
    premiumPlans: 'Offres TG Premium',
    currentSelection: 'Sélection actuelle',
    emailPlaceholder: 'E-mail',
    starsAmount: 'Quantité de Stars',
    months3: '3 Mois',
    months6: '6 Mois',
    months12: '12 Mois',
  },
  lookup: {
    ...en.lookup,
    title: 'Recherche de commande',
    subtitle: 'Entrez votre e-mail pour consulter vos commandes récentes.',
    placeholder: 'Entrez votre e-mail',
    button: 'Rechercher',
    loading: 'Recherche...',
    notFound: 'Aucune commande trouvée pour cet e-mail.',
    email: 'E-mail',
    orderNo: 'N° de commande',
    status: 'Statut',
    product: 'Produit',
    amount: 'Montant',
    network: 'Réseau de paiement',
    createdAt: 'Date de création',
    note: 'Note',
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Terminée',
    failed: 'Échouée',
  },
  pay: {
    ...en.pay,
    title: 'Paiement',
    subtitle: 'Finalisez votre commande en toute sécurité.',
    summary: 'Résumé de la commande',
    product: 'Produit',
    amount: 'Montant',
    paymentMethod: 'Mode de paiement',
    uploadTitle: 'Preuve de paiement',
    uploadHint: 'Téléchargez une capture d’écran de votre paiement effectué.',
    selectFile: 'Choisir un fichier',
    proofReady: 'Fichier de preuve prêt.',
    noProof: 'Aucune preuve téléchargée.',
    preview: 'Aperçu',
    txHashTitle: 'Hash de transaction',
    txHashPlaceholder: 'Collez votre hash de transaction ici (optionnel)',
    proofOrHashHint: 'Vous pouvez télécharger une capture d’écran et/ou saisir un hash de transaction.',
    submit: 'Soumettre le paiement',
    submitting: 'Envoi...',
    orderCreated: 'Commande créée avec succès.',
    orderNo: 'N° de commande',
    successDesc:
      'Votre commande est entrée dans la file de traitement. Le délai estimé est de 5 minutes. Revenez à la page d’accueil et utilisez la recherche de commande avec votre e-mail.',
    warningTitle: 'Important',
    network: 'Réseau',
    invalidOrder:
      'Informations de commande invalides. Veuillez retourner à la page d’accueil et recréer la commande.',
    createError: 'Échec de la création de la commande.',
  },
  admin: {
    ...en.admin,
    title: 'Console d’administration',
    subtitle: 'Interface d’administration multilingue unifiée.',
    orders: 'Commandes',
    pricing: 'Tarification',
    settings: 'Paramètres',
    pendingOrders: 'Commandes en attente',
    totalOrders: 'Commandes totales',
    searchPlaceholder: 'Rechercher par e-mail / commande / utilisateur',
    save: 'Enregistrer',
    saved: 'Enregistré',
    customerEmail: 'E-mail client',
    telegramUsername: 'Nom Telegram',
    paymentNetwork: 'Réseau de paiement',
    createdAt: 'Date de création',
    status: 'Statut',
  },
}

const ja: Messages = {
  ...en,
  common: {
    ...en.common,
    language: '言語',
    back: '戻る',
    email: 'メールアドレス',
    username: 'Telegram ユーザー名',
    officialEmail: '公式メール',
  },
  home: {
    ...en.home,
    premiumPlans: 'TG Premium プラン',
    currentSelection: '現在の選択',
    emailPlaceholder: 'メールアドレス',
    starsAmount: 'Stars 数量',
    months3: '3か月',
    months6: '6か月',
    months12: '12か月',
  },
  lookup: {
    ...en.lookup,
    title: '注文照会',
    subtitle: 'メールアドレスを入力して最近の注文を確認してください。',
    placeholder: 'メールアドレスを入力',
    button: '注文を確認',
    loading: '確認中...',
    notFound: 'このメールアドレスの注文は見つかりませんでした。',
    email: 'メールアドレス',
    orderNo: '注文番号',
    status: '状態',
    product: '商品',
    amount: '金額',
    network: '支払いネットワーク',
    createdAt: '作成日時',
    note: '備考',
    pending: '保留中',
    processing: '処理中',
    completed: '完了',
    failed: '失敗',
  },
  pay: {
    ...en.pay,
    title: '支払い',
    subtitle: '安全に注文を完了してください。',
    summary: '注文概要',
    product: '商品',
    amount: '金額',
    paymentMethod: '支払い方法',
    uploadTitle: '支払い証明',
    uploadHint: '支払い完了のスクリーンショットをアップロードしてください。',
    selectFile: 'ファイルを選択',
    proofReady: '証明ファイルの準備ができました。',
    noProof: 'まだ証明がアップロードされていません。',
    preview: 'プレビュー',
    txHashTitle: '取引ハッシュ',
    txHashPlaceholder: '取引ハッシュを入力（任意）',
    proofOrHashHint: 'スクリーンショットのアップロード、または取引ハッシュの入力ができます。',
    submit: '支払いを送信',
    submitting: '送信中...',
    orderCreated: '注文が正常に作成されました。',
    orderNo: '注文番号',
    successDesc:
      'ご注文は処理キューに入りました。完了までの目安は5分以内です。ホームに戻り、メールアドレスで注文照会をご利用ください。',
    warningTitle: '重要',
    network: 'ネットワーク',
    invalidOrder:
      '注文情報が無効です。ホームに戻って再度注文を作成してください。',
    createError: '注文の作成に失敗しました。',
  },
  admin: {
    ...en.admin,
    title: '管理コンソール',
    subtitle: '統一された多言語管理画面です。',
    orders: '注文',
    pricing: '価格設定',
    settings: '設定',
    pendingOrders: '保留中の注文',
    totalOrders: '総注文数',
    searchPlaceholder: 'メール / 注文番号 / ユーザー名で検索',
    save: '保存',
    saved: '保存済み',
    customerEmail: '顧客メール',
    telegramUsername: 'Telegram ユーザー名',
    paymentNetwork: '支払いネットワーク',
    createdAt: '作成日時',
    status: '状態',
  },
}

const ko: Messages = {
  ...en,
  common: {
    ...en.common,
    language: '언어',
    back: '뒤로',
    email: '이메일',
    username: 'Telegram 사용자 이름',
    officialEmail: '공식 이메일',
  },
  home: {
    ...en.home,
    premiumPlans: 'TG Premium 플랜',
    currentSelection: '현재 선택',
    emailPlaceholder: '이메일',
    starsAmount: 'Stars 수량',
    months3: '3개월',
    months6: '6개월',
    months12: '12개월',
  },
  lookup: {
    ...en.lookup,
    title: '주문 조회',
    subtitle: '이메일을 입력해 최근 주문 내역을 확인하세요.',
    placeholder: '이메일 입력',
    button: '주문 조회',
    loading: '조회 중...',
    notFound: '해당 이메일의 주문을 찾을 수 없습니다.',
    email: '이메일',
    orderNo: '주문번호',
    status: '상태',
    product: '상품',
    amount: '금액',
    network: '결제 네트워크',
    createdAt: '생성 시간',
    note: '메모',
    pending: '대기 중',
    processing: '처리 중',
    completed: '완료',
    failed: '실패',
  },
  pay: {
    ...en.pay,
    title: '결제',
    subtitle: '안전하게 주문을 완료하세요.',
    summary: '주문 요약',
    product: '상품',
    amount: '금액',
    paymentMethod: '결제 수단',
    uploadTitle: '결제 증빙',
    uploadHint: '완료된 결제 스크린샷을 업로드하세요.',
    selectFile: '파일 선택',
    proofReady: '증빙 파일 준비 완료.',
    noProof: '업로드된 증빙이 없습니다.',
    preview: '미리보기',
    txHashTitle: '거래 해시',
    txHashPlaceholder: '거래 해시 입력(선택)',
    proofOrHashHint: '스크린샷 업로드와/또는 거래 해시 입력이 가능합니다.',
    submit: '결제 제출',
    submitting: '제출 중...',
    orderCreated: '주문이 성공적으로 생성되었습니다.',
    orderNo: '주문번호',
    successDesc:
      '주문이 처리 대기열에 들어갔습니다. 예상 완료 시간은 5분 이내입니다. 홈페이지로 돌아가 이메일로 주문 조회를 이용하세요.',
    warningTitle: '중요',
    network: '네트워크',
    invalidOrder:
      '잘못된 주문 정보입니다. 홈페이지로 돌아가 다시 주문을 생성하세요.',
    createError: '주문 생성에 실패했습니다.',
  },
  admin: {
    ...en.admin,
    title: '관리 콘솔',
    subtitle: '통합 다국어 관리자 화면입니다.',
    orders: '주문',
    pricing: '가격',
    settings: '설정',
    pendingOrders: '대기 주문',
    totalOrders: '총 주문 수',
    searchPlaceholder: '이메일 / 주문번호 / 사용자명 검색',
    save: '저장',
    saved: '저장됨',
    customerEmail: '고객 이메일',
    telegramUsername: 'Telegram 사용자 이름',
    paymentNetwork: '결제 네트워크',
    createdAt: '생성 시간',
    status: '상태',
  },
}

const zhCn: Messages = {
  ...en,
  common: {
    ...en.common,
    language: '语言',
    back: '返回',
    email: '邮箱',
    username: 'TG 用户名',
    copy: '复制',
    copied: '已复制',
    officialEmail: '官方邮箱',
    rights: '© {year} Agnopol。保留所有权利。',
    footerTerms: '服务条款',
    footerPrivacy: '隐私政策',
    footerRisk: '风险披露',
  },
  home: {
    ...en.home,
    premiumPlans: 'TG Premium 套餐',
    starsPackage: 'TG Stars',
    currentSelection: '当前选择',
    createOrder: '创建订单',
    usernamePlaceholder: 'TG 用户名（如 @username）',
    emailPlaceholder: '电子邮件',
    starsAmount: 'Stars 数量',
    starsPlaceholder: '最少 50',
    starsMinHint: '最低下单数量：50 Stars',
    autoPriceHint: '价格将自动计算',
    months3: '3个月',
    months6: '6个月',
    months12: '12个月',
  },
  lookup: {
    ...en.lookup,
    title: '订单查询',
    subtitle: '输入邮箱，查看该邮箱下最近订单记录。',
    placeholder: '输入下单邮箱',
    button: '查询订单',
    loading: '查询中...',
    notFound: '该邮箱下未找到订单。',
    email: '邮箱',
    orderNo: '订单号',
    status: '状态',
    product: '产品',
    amount: '金额',
    network: '支付网络',
    createdAt: '创建时间',
    note: '备注',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
  },
  pay: {
    ...en.pay,
    title: '支付页',
    subtitle: '安全完成您的订单。',
    summary: '订单摘要',
    product: '产品',
    amount: '金额',
    paymentMethod: '支付方式',
    copySuccess: '收款地址已成功复制。',
    uploadTitle: '支付凭证',
    uploadHint: '上传您已完成支付的截图凭证。',
    selectFile: '选择文件',
    proofReady: '凭证文件已就绪。',
    noProof: '暂未上传凭证。',
    preview: '预览',
    txHashTitle: '交易哈希',
    txHashPlaceholder: '可选填写交易哈希',
    proofOrHashHint: '您可以上传截图，和/或填写交易哈希。',
    submit: '提交付款',
    submitting: '提交中...',
    orderCreated: '订单创建成功。',
    orderNo: '订单号',
    successDesc:
      '您的订单已进入处理流程，预计五分钟内处理完成。请稍后通过首页订单查询功能并使用下单邮箱查看订单详细信息。',
    warningTitle: '重要提示',
    warningBody:
      '转账请仅使用正确的 TRC20 USDT 或 Base USDC 链与币种。不要使用任何其他网络。到账金额必须与订单金额完全一致。',
    eta:
      '为了确保资金安全与合规审查，我们的标准交付时间为 5–15 分钟。在网络拥堵时，最长可能达到 2 小时。',
    network: '网络',
    invalidOrder: '订单信息无效，请返回首页重新创建订单。',
    createError: '创建订单失败。',
  },
  admin: {
    ...en.admin,
    title: '后台管理',
    subtitle: '统一多语言后台界面。',
    orders: '订单管理',
    pricing: '价格管理',
    settings: '系统设置',
    pendingOrders: '待处理订单',
    totalOrders: '总订单数',
    searchPlaceholder: '按邮箱 / 订单号 / 用户名搜索',
    save: '保存',
    saved: '已保存',
    customerEmail: '客户邮箱',
    telegramUsername: 'TG 用户名',
    paymentNetwork: '支付网络',
    createdAt: '创建时间',
    status: '状态',
  },
}

const zhTw: Messages = {
  ...en,
  common: {
    ...en.common,
    language: '語言',
    back: '返回',
    email: '電子郵件',
    username: 'TG 用戶名',
    copy: '複製',
    copied: '已複製',
    officialEmail: '官方郵箱',
    rights: '© {year} Agnopol。保留所有權利。',
    footerTerms: '服務條款',
    footerPrivacy: '隱私政策',
    footerRisk: '風險披露',
  },
  home: {
    ...en.home,
    premiumPlans: 'TG Premium 方案',
    starsPackage: 'TG Stars',
    currentSelection: '目前選擇',
    createOrder: '建立訂單',
    usernamePlaceholder: 'TG 用戶名（如 @username）',
    emailPlaceholder: '電子郵件',
    starsAmount: 'Stars 數量',
    starsPlaceholder: '最少 50',
    starsMinHint: '最低下單數量：50 Stars',
    autoPriceHint: '價格將自動計算',
    months3: '3個月',
    months6: '6個月',
    months12: '12個月',
  },
  lookup: {
    ...en.lookup,
    title: '訂單查詢',
    subtitle: '輸入電子郵件，查看該郵箱下最近訂單記錄。',
    placeholder: '輸入下單電子郵件',
    button: '查詢訂單',
    loading: '查詢中...',
    notFound: '該郵箱下未找到訂單。',
    email: '電子郵件',
    orderNo: '訂單號',
    status: '狀態',
    product: '產品',
    amount: '金額',
    network: '支付網路',
    createdAt: '建立時間',
    note: '備註',
    pending: '待處理',
    processing: '處理中',
    completed: '已完成',
    failed: '失敗',
  },
  pay: {
    ...en.pay,
    title: '支付頁',
    subtitle: '安全完成您的訂單。',
    summary: '訂單摘要',
    product: '產品',
    amount: '金額',
    paymentMethod: '支付方式',
    copySuccess: '收款地址已成功複製。',
    uploadTitle: '支付憑證',
    uploadHint: '上傳您已完成支付的截圖憑證。',
    selectFile: '選擇檔案',
    proofReady: '憑證檔案已就緒。',
    noProof: '尚未上傳憑證。',
    preview: '預覽',
    txHashTitle: '交易哈希',
    txHashPlaceholder: '可選填寫交易哈希',
    proofOrHashHint: '您可以上傳截圖，和/或填寫交易哈希。',
    submit: '提交付款',
    submitting: '提交中...',
    orderCreated: '訂單建立成功。',
    orderNo: '訂單號',
    successDesc:
      '您的訂單已進入處理流程，預計五分鐘內處理完成。請稍後透過首頁訂單查詢功能並使用下單電子郵件查看訂單詳細資訊。',
    warningTitle: '重要提示',
    warningBody:
      '轉帳請僅使用正確的 TRC20 USDT 或 Base USDC 鏈與幣種。不要使用任何其他網路。到帳金額必須與訂單金額完全一致。',
    eta:
      '為了確保資金安全與合規審查，我們的標準交付時間為 5–15 分鐘。在網路擁堵時，最長可能達到 2 小時。',
    network: '網路',
    invalidOrder: '訂單資訊無效，請返回首頁重新建立訂單。',
    createError: '建立訂單失敗。',
  },
  admin: {
    ...en.admin,
    title: '後台管理',
    subtitle: '統一多語言後台介面。',
    orders: '訂單管理',
    pricing: '價格管理',
    settings: '系統設定',
    pendingOrders: '待處理訂單',
    totalOrders: '總訂單數',
    searchPlaceholder: '按郵箱 / 訂單號 / 用戶名搜尋',
    save: '儲存',
    saved: '已儲存',
    customerEmail: '客戶郵箱',
    telegramUsername: 'TG 用戶名',
    paymentNetwork: '支付網路',
    createdAt: '建立時間',
    status: '狀態',
  },
}

export const dictionaries: Record<LangCode, Messages> = {
  de,
  en,
  es,
  fr,
  ja,
  ko,
  'zh-cn': zhCn,
  'zh-tw': zhTw,
}
