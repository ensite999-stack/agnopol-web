'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

const API = {
  session: '/api/admin/session',
  orders: '/api/admin/orders',
  settings: '/api/admin/settings',
  logout: '/api/admin/logout',
}

type AdminTab = 'orders' | 'pricing'
type OrderStatus = 'pending_payment' | 'paid' | 'completed' | 'cancelled'

type OrderItem = {
  id?: number
  order_no: string
  username: string | null
  email: string | null
  product_type: string | null
  duration: string | null
  stars_amount: number | null
  amount: number | null
  price_usd: number | null
  payment_network: string | null
  tx_hash: string | null
  proof_image_base64: string | null
  status: OrderStatus | string | null
  public_note: string | null
  admin_note: string | null
  created_at: string | null
  updated_at?: string | null
}

type SiteConfig = {
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  trc20_address: string
  base_address: string
}

type FormState = {
  username: string
  email: string
  payment_network: string
  tx_hash: string
  public_note: string
  admin_note: string
}

async function readJsonSafe(res: Response) {
  const raw = await res.text()
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`接口没有返回 JSON（状态 ${res.status}）`)
  }
}

function buildText(lang: string) {
  if (lang === 'de') {
    return {
      title: 'Admin-Konsole',
      subtitle: 'Bestellverwaltung, Preiseinstellungen und Zahlungsadressverwaltung',
      checking: 'Anmeldestatus wird geprüft...',
      redirecting: 'Nicht eingeloggt. Weiterleitung...',
      tabs: { orders: 'Bestellungen', pricing: 'Preise & Adressen' },
      logout: 'Abmelden',
      refreshing: 'Wird aktualisiert...',
      refreshNow: 'Jetzt aktualisieren',
      autoRefresh: 'Automatisch aktualisieren',
      searchPlaceholder: 'Nach E-Mail / Bestellnr. / Benutzername suchen',
      all: 'Alle',
      pending: 'Ausstehende Zahlung',
      paid: 'Bezahlt',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
      noOrders: 'Keine Bestellungen.',
      selectHint: 'Keine Bestellungen.',
      orderNo: 'Bestellnummer',
      product: 'Produkt',
      amount: 'Betrag',
      createdAt: 'Erstellt am',
      username: 'Telegram-Benutzername',
      email: 'E-Mail',
      network: 'Zahlungsnetzwerk',
      txHash: 'Transaktions-Hash',
      currentStatus: 'Aktueller Status',
      userNote: 'Sichtbarer Hinweis für Nutzer',
      adminNote: 'Admin-Notiz',
      saveHint: 'Bestellinformationen, Nutzerhinweis und Admin-Notiz speichern',
      saveChanges: 'Änderungen speichern',
      saving: 'Wird gespeichert...',
      completedBtn: 'Abgeschlossen',
      restoreBtn: 'Zahlung wiederherstellen',
      cancelBtn: 'Bestellung stornieren',
      deleteBtn: 'Bestellung löschen',
      restoring: 'Wird wiederhergestellt...',
      completing: 'Wird verarbeitet...',
      cancelling: 'Wird storniert...',
      deleting: 'Wird gelöscht...',
      viewLarge: 'Groß anzeigen',
      noImage: 'Kein Zahlungsbild',
      noHash: 'Bitte Transaktions-Hash hochladen',
      pricesTitle: 'Preise & Adressen',
      price3m: 'TG Premium 3 Monate',
      price6m: 'TG Premium 6 Monate',
      price12m: 'TG Premium 12 Monate',
      starsRate: 'Stars Stückpreis (USD)',
      trc20: 'TRC20 USDT Adresse',
      base: 'Base USDC Adresse',
      saveConfig: 'Einstellungen speichern',
      configSaving: 'Wird gespeichert...',
      actionSuccess: 'Aktion erfolgreich',
      saveSuccess: 'Erfolgreich gespeichert',
      configSaveSuccess: 'Seiteneinstellungen gespeichert',
      loadFailed: 'Laden fehlgeschlagen',
      actionFailed: 'Aktion fehlgeschlagen',
      allTimeBoston: 'Alle Zeiten werden in der Zeitzone Boston, USA angezeigt.',
      editOrder: 'Bestellung bearbeiten',
    }
  }

  if (lang === 'es') {
    return {
      title: 'Consola de administración',
      subtitle: 'Gestión de pedidos, precios y direcciones de cobro',
      checking: 'Comprobando sesión...',
      redirecting: 'Sin iniciar sesión. Redirigiendo...',
      tabs: { orders: 'Pedidos', pricing: 'Precios y direcciones' },
      logout: 'Cerrar sesión',
      refreshing: 'Actualizando...',
      refreshNow: 'Actualizar ahora',
      autoRefresh: 'Actualización automática',
      searchPlaceholder: 'Buscar por correo / pedido / usuario',
      all: 'Todos',
      pending: 'Pago pendiente',
      paid: 'Pagado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      noOrders: 'No hay pedidos.',
      selectHint: 'No hay pedidos.',
      orderNo: 'Número de pedido',
      product: 'Producto',
      amount: 'Importe',
      createdAt: 'Fecha de creación',
      username: 'Usuario de Telegram',
      email: 'Correo electrónico',
      network: 'Red de pago',
      txHash: 'Hash de transacción',
      currentStatus: 'Estado actual',
      userNote: 'Aviso visible para el usuario',
      adminNote: 'Nota interna',
      saveHint: 'Guardar información del pedido, aviso visible y nota interna',
      saveChanges: 'Guardar cambios',
      saving: 'Guardando...',
      completedBtn: 'Completado',
      restoreBtn: 'Restaurar pago',
      cancelBtn: 'Cancelar pedido',
      deleteBtn: 'Eliminar pedido',
      restoring: 'Restaurando...',
      completing: 'Procesando...',
      cancelling: 'Cancelando...',
      deleting: 'Eliminando...',
      viewLarge: 'Ver imagen grande',
      noImage: 'Sin imagen de comprobante',
      noHash: 'Sube el hash de transacción',
      pricesTitle: 'Precios y direcciones',
      price3m: 'TG Premium 3 meses',
      price6m: 'TG Premium 6 meses',
      price12m: 'TG Premium 12 meses',
      starsRate: 'Precio unitario de Stars (USD)',
      trc20: 'Dirección TRC20 USDT',
      base: 'Dirección Base USDC',
      saveConfig: 'Guardar configuración',
      configSaving: 'Guardando...',
      actionSuccess: 'Acción completada',
      saveSuccess: 'Guardado correctamente',
      configSaveSuccess: 'Configuración del sitio guardada',
      loadFailed: 'Error al cargar',
      actionFailed: 'Error en la acción',
      allTimeBoston: 'Todas las horas se muestran en la zona horaria de Boston, EE. UU.',
      editOrder: 'Editar pedido',
    }
  }

  if (lang === 'fr') {
    return {
      title: 'Console d’administration',
      subtitle: 'Gestion des commandes, des prix et des adresses de paiement',
      checking: 'Vérification de la session...',
      redirecting: 'Non connecté. Redirection...',
      tabs: { orders: 'Commandes', pricing: 'Tarifs et adresses' },
      logout: 'Se déconnecter',
      refreshing: 'Actualisation...',
      refreshNow: 'Actualiser',
      autoRefresh: 'Actualisation automatique',
      searchPlaceholder: 'Rechercher par e-mail / commande / utilisateur',
      all: 'Tous',
      pending: 'Paiement en attente',
      paid: 'Payé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      noOrders: 'Aucune commande.',
      selectHint: 'Aucune commande.',
      orderNo: 'N° de commande',
      product: 'Produit',
      amount: 'Montant',
      createdAt: 'Créé le',
      username: 'Nom Telegram',
      email: 'E-mail',
      network: 'Réseau de paiement',
      txHash: 'Hash de transaction',
      currentStatus: 'Statut actuel',
      userNote: 'Message visible par l’utilisateur',
      adminNote: 'Note admin',
      saveHint: 'Enregistrer les infos de commande, le message utilisateur et la note admin',
      saveChanges: 'Enregistrer les modifications',
      saving: 'Enregistrement...',
      completedBtn: 'Terminé',
      restoreBtn: 'Restaurer le paiement',
      cancelBtn: 'Annuler la commande',
      deleteBtn: 'Supprimer la commande',
      restoring: 'Restauration...',
      completing: 'Traitement...',
      cancelling: 'Annulation...',
      deleting: 'Suppression...',
      viewLarge: 'Voir en grand',
      noImage: 'Aucune image de preuve',
      noHash: 'Veuillez téléverser le hash de transaction',
      pricesTitle: 'Tarifs et adresses',
      price3m: 'TG Premium 3 mois',
      price6m: 'TG Premium 6 mois',
      price12m: 'TG Premium 12 mois',
      starsRate: 'Prix unitaire Stars (USD)',
      trc20: 'Adresse TRC20 USDT',
      base: 'Adresse Base USDC',
      saveConfig: 'Enregistrer les réglages',
      configSaving: 'Enregistrement...',
      actionSuccess: 'Action réussie',
      saveSuccess: 'Enregistré avec succès',
      configSaveSuccess: 'Réglages du site enregistrés',
      loadFailed: 'Échec du chargement',
      actionFailed: 'Échec de l’action',
      allTimeBoston: 'Toutes les heures sont affichées selon le fuseau horaire de Boston, États-Unis.',
      editOrder: 'Modifier la commande',
    }
  }

  if (lang === 'ja') {
    return {
      title: '管理コンソール',
      subtitle: '注文管理、価格設定、入金先アドレス管理',
      checking: 'ログイン状態を確認中...',
      redirecting: '未ログインのため移動中...',
      tabs: { orders: '注文管理', pricing: '価格とアドレス' },
      logout: 'ログアウト',
      refreshing: '更新中...',
      refreshNow: '今すぐ更新',
      autoRefresh: '自動更新',
      searchPlaceholder: 'メール / 注文番号 / ユーザー名で検索',
      all: 'すべて',
      pending: '未払い',
      paid: '支払い済み',
      completed: '完了',
      cancelled: 'キャンセル済み',
      noOrders: '注文はありません。',
      selectHint: '注文はありません。',
      orderNo: '注文番号',
      product: '商品',
      amount: '金額',
      createdAt: '作成時間',
      username: 'Telegram ユーザー名',
      email: 'メール',
      network: '支払いネットワーク',
      txHash: 'トランザクションハッシュ',
      currentStatus: '現在の状態',
      userNote: 'ユーザー向け案内',
      adminNote: '管理メモ',
      saveHint: '注文情報、ユーザー案内、管理メモを保存',
      saveChanges: '変更を保存',
      saving: '保存中...',
      completedBtn: '完了にする',
      restoreBtn: '支払いを復元',
      cancelBtn: '注文をキャンセル',
      deleteBtn: '注文を削除',
      restoring: '復元中...',
      completing: '処理中...',
      cancelling: 'キャンセル中...',
      deleting: '削除中...',
      viewLarge: '画像を拡大',
      noImage: '画像なし',
      noHash: '取引ハッシュを入力してください',
      pricesTitle: '価格とアドレス',
      price3m: 'TG Premium 3か月',
      price6m: 'TG Premium 6か月',
      price12m: 'TG Premium 12か月',
      starsRate: 'Stars 単価(USD)',
      trc20: 'TRC20 USDT アドレス',
      base: 'Base USDC アドレス',
      saveConfig: '設定を保存',
      configSaving: '保存中...',
      actionSuccess: '操作成功',
      saveSuccess: '保存成功',
      configSaveSuccess: 'サイト設定を保存しました',
      loadFailed: '読み込み失敗',
      actionFailed: '操作失敗',
      allTimeBoston: 'すべての時間は米国ボストン時間で表示されます。',
      editOrder: '注文を編集',
    }
  }

  if (lang === 'ko') {
    return {
      title: '관리자 콘솔',
      subtitle: '주문 관리, 가격 설정 및 수금 주소 관리',
      checking: '로그인 상태 확인 중...',
      redirecting: '로그인되지 않았습니다. 이동 중...',
      tabs: { orders: '주문 관리', pricing: '가격 및 주소' },
      logout: '로그아웃',
      refreshing: '새로고침 중...',
      refreshNow: '즉시 새로고침',
      autoRefresh: '자동 새로고침',
      searchPlaceholder: '이메일 / 주문번호 / 사용자명으로 검색',
      all: '전체',
      pending: '미결제',
      paid: '결제됨',
      completed: '완료됨',
      cancelled: '취소됨',
      noOrders: '주문이 없습니다.',
      selectHint: '주문이 없습니다.',
      orderNo: '주문번호',
      product: '상품',
      amount: '금액',
      createdAt: '생성 시간',
      username: '텔레그램 사용자명',
      email: '이메일',
      network: '결제 네트워크',
      txHash: '거래 해시',
      currentStatus: '현재 상태',
      userNote: '사용자 표시 안내',
      adminNote: '관리자 메모',
      saveHint: '주문 정보, 사용자 안내 및 관리자 메모 저장',
      saveChanges: '변경 저장',
      saving: '저장 중...',
      completedBtn: '완료 처리',
      restoreBtn: '결제 복구',
      cancelBtn: '주문 취소',
      deleteBtn: '주문 삭제',
      restoring: '복구 중...',
      completing: '처리 중...',
      cancelling: '취소 중...',
      deleting: '삭제 중...',
      viewLarge: '큰 이미지 보기',
      noImage: '업로드된 이미지 없음',
      noHash: '거래 해시를 입력하세요',
      pricesTitle: '가격 및 주소',
      price3m: 'TG Premium 3개월',
      price6m: 'TG Premium 6개월',
      price12m: 'TG Premium 12개월',
      starsRate: 'Stars 단가(USD)',
      trc20: 'TRC20 USDT 주소',
      base: 'Base USDC 주소',
      saveConfig: '설정 저장',
      configSaving: '저장 중...',
      actionSuccess: '작업 성공',
      saveSuccess: '저장 성공',
      configSaveSuccess: '사이트 설정 저장 완료',
      loadFailed: '불러오기 실패',
      actionFailed: '작업 실패',
      allTimeBoston: '모든 시간은 미국 보스턴 시간대로 표시됩니다.',
      editOrder: '주문 편집',
    }
  }

  if (lang === 'zh-cn') {
    return {
      title: '后台管理',
      subtitle: '订单管理、价格配置与收款地址管理',
      checking: '检查登录状态中...',
      redirecting: '尚未登录，正在跳转...',
      tabs: { orders: '订单管理', pricing: '价格与地址' },
      logout: '退出登录',
      refreshing: '刷新中...',
      refreshNow: '立即刷新',
      autoRefresh: '自动刷新',
      searchPlaceholder: '按邮箱 / 订单号 / 用户名搜索',
      all: '全部',
      pending: '待支付',
      paid: '已支付',
      completed: '已完成',
      cancelled: '已取消',
      noOrders: '暂无订单。',
      selectHint: '暂无订单。',
      orderNo: '订单号',
      product: '产品',
      amount: '金额',
      createdAt: '创建时间',
      username: 'Telegram 用户名',
      email: '电子邮箱',
      network: '支付网络',
      txHash: '交易哈希',
      currentStatus: '当前状态',
      userNote: '用户可见提示',
      adminNote: '后台备注',
      saveHint: '保存订单信息、用户可见提示与后台备注',
      saveChanges: '保存修改',
      saving: '保存中...',
      completedBtn: '已完成',
      restoreBtn: '恢复支付',
      cancelBtn: '取消订单',
      deleteBtn: '删除订单',
      restoring: '恢复支付中...',
      completing: '处理中...',
      cancelling: '取消中...',
      deleting: '删除中...',
      viewLarge: '查看大图',
      noImage: '暂无图片凭证',
      noHash: '请上传交易哈希',
      pricesTitle: '价格与地址',
      price3m: 'TG Premium 3个月',
      price6m: 'TG Premium 6个月',
      price12m: 'TG Premium 12个月',
      starsRate: 'Stars 单价（每颗美元）',
      trc20: 'TRC20 USDT 地址',
      base: 'Base USDC 地址',
      saveConfig: '保存设置',
      configSaving: '保存中...',
      actionSuccess: '操作成功',
      saveSuccess: '保存成功',
      configSaveSuccess: '站点设置已保存',
      loadFailed: '读取失败',
      actionFailed: '操作失败',
      allTimeBoston: '所有时间均按美国波士顿时区显示。',
      editOrder: '编辑订单',
    }
  }

  if (lang === 'zh-tw') {
    return {
      title: '後台管理',
      subtitle: '訂單管理、價格配置與收款地址管理',
      checking: '檢查登入狀態中...',
      redirecting: '尚未登入，正在跳轉...',
      tabs: { orders: '訂單管理', pricing: '價格與地址' },
      logout: '退出登入',
      refreshing: '刷新中...',
      refreshNow: '立即刷新',
      autoRefresh: '自動刷新',
      searchPlaceholder: '按郵箱 / 訂單號 / 用戶名搜索',
      all: '全部',
      pending: '待支付',
      paid: '已支付',
      completed: '已完成',
      cancelled: '已取消',
      noOrders: '暫無訂單。',
      selectHint: '暫無訂單。',
      orderNo: '訂單號',
      product: '產品',
      amount: '金額',
      createdAt: '建立時間',
      username: 'Telegram 用戶名',
      email: '電子郵箱',
      network: '支付網路',
      txHash: '交易哈希',
      currentStatus: '當前狀態',
      userNote: '用戶可見提示',
      adminNote: '後台備註',
      saveHint: '保存訂單資訊、用戶可見提示與後台備註',
      saveChanges: '保存修改',
      saving: '保存中...',
      completedBtn: '已完成',
      restoreBtn: '恢復支付',
      cancelBtn: '取消訂單',
      deleteBtn: '刪除訂單',
      restoring: '恢復支付中...',
      completing: '處理中...',
      cancelling: '取消中...',
      deleting: '刪除中...',
      viewLarge: '查看大圖',
      noImage: '暫無圖片憑證',
      noHash: '請上傳交易哈希',
      pricesTitle: '價格與地址',
      price3m: 'TG Premium 3個月',
      price6m: 'TG Premium 6個月',
      price12m: 'TG Premium 12個月',
      starsRate: 'Stars 單價（每顆美元）',
      trc20: 'TRC20 USDT 地址',
      base: 'Base USDC 地址',
      saveConfig: '保存設定',
      configSaving: '保存中...',
      actionSuccess: '操作成功',
      saveSuccess: '保存成功',
      configSaveSuccess: '站點設定已保存',
      loadFailed: '讀取失敗',
      actionFailed: '操作失敗',
      allTimeBoston: '所有時間均按美國波士頓時區顯示。',
      editOrder: '編輯訂單',
    }
  }

  return {
    title: 'Admin Console',
    subtitle: 'Order management, pricing settings and payment address management',
    checking: 'Checking session...',
    redirecting: 'Not logged in. Redirecting...',
    tabs: { orders: 'Orders', pricing: 'Pricing & Address' },
    logout: 'Log Out',
    refreshing: 'Refreshing...',
    refreshNow: 'Refresh Now',
    autoRefresh: 'Auto Refresh',
    searchPlaceholder: 'Search by email / order no / username',
    all: 'All',
    pending: 'Pending Payment',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noOrders: 'No orders.',
    selectHint: 'No orders.',
    orderNo: 'Order No',
    product: 'Product',
    amount: 'Amount',
    createdAt: 'Created At',
    username: 'Telegram Username',
    email: 'Email',
    network: 'Payment Network',
    txHash: 'Transaction Hash',
    currentStatus: 'Current Status',
    userNote: 'User Visible Notice',
    adminNote: 'Admin Note',
    saveHint: 'Save order info, user notice and admin note',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    completedBtn: 'Completed',
    restoreBtn: 'Restore Payment',
    cancelBtn: 'Cancel Order',
    deleteBtn: 'Delete Order',
    restoring: 'Restoring...',
    completing: 'Processing...',
    cancelling: 'Cancelling...',
    deleting: 'Deleting...',
    viewLarge: 'View Large',
    noImage: 'No payment proof image',
    noHash: 'Please upload a transaction hash',
    pricesTitle: 'Pricing & Address',
    price3m: 'TG Premium 3 Months',
    price6m: 'TG Premium 6 Months',
    price12m: 'TG Premium 12 Months',
    starsRate: 'Stars unit price (USD each)',
    trc20: 'TRC20 USDT Address',
    base: 'Base USDC Address',
    saveConfig: 'Save Settings',
    configSaving: 'Saving...',
    actionSuccess: 'Action completed',
    saveSuccess: 'Saved successfully',
    configSaveSuccess: 'Site settings saved',
    loadFailed: 'Failed to load data',
    actionFailed: 'Action failed',
    allTimeBoston: 'All times are displayed in the Boston, US time zone.',
    editOrder: 'Edit Order',
  }
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

function getProductLabel(order: OrderItem, text: ReturnType<typeof buildText>) {
  if (order.product_type === 'tg_stars') {
    return `TG Stars ${order.stars_amount ?? 0}`
  }
  if (order.duration === '3m') return text.price3m
  if (order.duration === '6m') return text.price6m
  return text.price12m
}

function getStatusLabel(status: string | null | undefined, text: ReturnType<typeof buildText>) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending' || s === 'pending_payment') return text.pending
  if (s === 'paid') return text.paid
  if (s === 'completed') return text.completed
  if (s === 'cancelled' || s === 'failed') return text.cancelled
  return status || '-'
}

function getStatusClass(status: string | null | undefined) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending' || s === 'pending_payment') return 'status pending'
  if (s === 'paid') return 'status paid'
  if (s === 'completed') return 'status completed'
  if (s === 'cancelled' || s === 'failed') return 'status cancelled'
  return 'status'
}

export default function AdminPage() {
  const router = useRouter()
  const { lang } = useI18n()
  const text = useMemo(() => buildText(lang), [lang])

  const [authChecking, setAuthChecking] = useState(true)
  const [tab, setTab] = useState<AdminTab>('orders')
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedOrderNo, setSelectedOrderNo] = useState('')
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    payment_network: '',
    tx_hash: '',
    public_note: '',
    admin_note: '',
  })

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    premium_3m_price: 13.1,
    premium_6m_price: 17.1,
    premium_12m_price: 31.1,
    stars_rate: 0.02,
    trc20_address: '',
    base_address: '',
  })

  const [saveLoading, setSaveLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<'complete' | 'restore' | 'cancel' | 'delete' | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedOrder = useMemo(
    () => orders.find((item) => item.order_no === selectedOrderNo) || null,
    [orders, selectedOrderNo]
  )

  const syncFormFromOrder = useCallback((order: OrderItem | null) => {
    setForm({
      username: order?.username || '',
      email: order?.email || '',
      payment_network: order?.payment_network || '',
      tx_hash: order?.tx_hash || '',
      public_note: order?.public_note || '',
      admin_note: order?.admin_note || '',
    })
  }, [])

  const loadSiteConfig = useCallback(async () => {
    try {
      const res = await fetch(API.settings, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.loadFailed)

      if (data?.item) {
        setSiteConfig({
          premium_3m_price: Number(data.item.premium_3m_price ?? 13.1),
          premium_6m_price: Number(data.item.premium_6m_price ?? 17.1),
          premium_12m_price: Number(data.item.premium_12m_price ?? 31.1),
          stars_rate: Number(data.item.stars_rate ?? 0.02),
          trc20_address: String(data.item.trc20_address ?? ''),
          base_address: String(data.item.base_address ?? ''),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : text.loadFailed)
    }
  }, [text.loadFailed])

  const loadOrders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoadingOrders(true)

        const params = new URLSearchParams()
        if (search.trim()) params.set('q', search.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)
        params.set('page', '1')
        params.set('page_size', '50')

        const res = await fetch(`${API.orders}?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const data = await readJsonSafe(res)

        if (res.status === 401) {
          router.replace(`/admin/login?lang=${lang}`)
          return
        }

        if (!res.ok) throw new Error(data?.error || text.loadFailed)

        const nextOrders: OrderItem[] = Array.isArray(data?.items) ? data.items : []
        setOrders(nextOrders)

        if (!selectedOrderNo && nextOrders[0]) {
          setSelectedOrderNo(nextOrders[0].order_no)
          syncFormFromOrder(nextOrders[0])
          return
        }

        if (selectedOrderNo) {
          const nextSelected = nextOrders.find((item) => item.order_no === selectedOrderNo) || null
          if (nextSelected) {
            syncFormFromOrder(nextSelected)
          } else {
            setSelectedOrderNo(nextOrders[0]?.order_no || '')
            syncFormFromOrder(nextOrders[0] || null)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : text.loadFailed)
      } finally {
        if (!silent) setLoadingOrders(false)
      }
    },
    [lang, router, search, selectedOrderNo, statusFilter, syncFormFromOrder, text.loadFailed]
  )

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const res = await fetch(API.session, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const data = await readJsonSafe(res)
        if (!active) return

        if (!data?.authenticated) {
          router.replace(`/admin/login?lang=${lang}`)
          return
        }

        setAuthChecking(false)
      } catch {
        router.replace(`/admin/login?lang=${lang}`)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [lang, router])

  useEffect(() => {
    if (authChecking) return
    loadOrders()
    loadSiteConfig()
  }, [authChecking, loadOrders, loadSiteConfig])

  useEffect(() => {
    if (authChecking || !autoRefresh) return
    const timer = window.setInterval(() => {
      loadOrders(true)
    }, 15000)
    return () => window.clearInterval(timer)
  }, [authChecking, autoRefresh, loadOrders])

  function pickOrder(order: OrderItem) {
    setSelectedOrderNo(order.order_no)
    syncFormFromOrder(order)
    setMessage('')
    setError('')
  }

  async function saveOrder() {
    if (!selectedOrder) return

    try {
      setSaveLoading(true)
      setMessage('')
      setError('')

      const res = await fetch(API.orders, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: selectedOrder.order_no,
          username: form.username.trim(),
          email: form.email.trim(),
          payment_network: form.payment_network.trim(),
          tx_hash: form.tx_hash.trim(),
          public_note: form.public_note.trim(),
          admin_note: form.admin_note.trim(),
        }),
      })

      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setMessage(text.saveSuccess)
      await loadOrders(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : text.actionFailed)
    } finally {
      setSaveLoading(false)
    }
  }

  async function runOrderAction(kind: 'complete' | 'restore' | 'cancel' | 'delete') {
    if (!selectedOrder) return

    try {
      setActionLoading(kind)
      setMessage('')
      setError('')

      let res: Response

      if (kind === 'delete') {
        res = await fetch(API.orders, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_no: selectedOrder.order_no }),
        })
      } else {
        res = await fetch(API.orders, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_no: selectedOrder.order_no,
            action:
              kind === 'complete'
                ? 'completed'
                : kind === 'restore'
                  ? 'restore_paid'
                  : 'cancelled',
          }),
        })
      }

      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setMessage(text.actionSuccess)

      if (kind === 'delete') {
        const next = orders.filter((item) => item.order_no !== selectedOrder.order_no)
        setOrders(next)
        setSelectedOrderNo(next[0]?.order_no || '')
        syncFormFromOrder(next[0] || null)
      } else {
        await loadOrders(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : text.actionFailed)
    } finally {
      setActionLoading(null)
    }
  }

  async function saveSiteConfig() {
    try {
      setConfigLoading(true)
      setMessage('')
      setError('')

      const res = await fetch(API.settings, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig),
      })

      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setMessage(text.configSaveSuccess)
    } catch (err) {
      setError(err instanceof Error ? err.message : text.actionFailed)
    } finally {
      setConfigLoading(false)
    }
  }

  async function logout() {
    try {
      await fetch(API.logout, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      router.replace(`/admin/login?lang=${lang}`)
    }
  }

  if (authChecking) {
    return (
      <main className="admin-shell">
        <div className="admin-panel small-panel">
          <div className="loading-card">{text.checking}</div>
          <style jsx>{styles}</style>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <div className="admin-panel">
        <section className="hero-card">
          <div>
            <h1 className="hero-title">{text.title}</h1>
            <p className="hero-subtitle">{text.subtitle}</p>
            <p className="hero-subtitle" style={{ marginTop: 18 }}>
              {text.allTimeBoston}
            </p>
          </div>

          <div className="hero-actions">
            <div className="lang-slot">
              <LanguageSwitcher />
            </div>

            <button type="button" className="logout-btn" onClick={logout}>
              {text.logout}
            </button>
          </div>
        </section>

        <section className="tabs-row two-tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            {text.tabs.orders}
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'pricing' ? 'active' : ''}`}
            onClick={() => setTab('pricing')}
          >
            {text.tabs.pricing}
          </button>
        </section>

        {message ? <div className="status-box success">{message}</div> : null}
        {error ? <div className="status-box error">{error}</div> : null}

        {tab === 'orders' ? (
          <div className="grid-layout">
            <section className="card search-card">
              <div className="search-row">
                <input
                  className="input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={text.searchPlaceholder}
                />
                <button type="button" className="small-btn" onClick={() => loadOrders()}>
                  {loadingOrders ? text.refreshing : text.refreshNow}
                </button>
              </div>

              <div className="filter-row">
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{text.all}</option>
                  <option value="pending_payment">{text.pending}</option>
                  <option value="paid">{text.paid}</option>
                  <option value="completed">{text.completed}</option>
                  <option value="cancelled">{text.cancelled}</option>
                </select>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <span>{text.autoRefresh}</span>
                </label>
              </div>
            </section>

            <section className="card order-list-card">
              {orders.length === 0 ? (
                <div className="empty-text">{text.noOrders}</div>
              ) : (
                orders.map((order) => (
                  <button
                    key={order.order_no}
                    type="button"
                    onClick={() => pickOrder(order)}
                    className={`order-item ${selectedOrderNo === order.order_no ? 'active' : ''}`}
                  >
                    <div className="order-item-title">{order.order_no}</div>
                    <div className="order-item-sub">{order.email || '-'}</div>
                    <div className="order-item-sub">{getProductLabel(order, text)}</div>
                    <div className={getStatusClass(order.status)}>
                      {getStatusLabel(order.status, text)}
                    </div>
                  </button>
                ))
              )}
            </section>

            <section className="card editor-card">
              <h2 className="section-title">{text.editOrder}</h2>

              {selectedOrder ? (
                <>
                  <div className="meta-grid">
                    <div>
                      <span className="meta-label">{text.orderNo}:</span> {selectedOrder.order_no}
                    </div>
                    <div>
                      <span className="meta-label">{text.product}:</span>{' '}
                      {getProductLabel(selectedOrder, text)}
                    </div>
                    <div>
                      <span className="meta-label">{text.amount}:</span> $
                      {selectedOrder.price_usd ?? selectedOrder.amount ?? 0}
                    </div>
                    <div>
                      <span className="meta-label">{text.createdAt}:</span>{' '}
                      {formatBostonTime(selectedOrder.created_at)}
                    </div>
                  </div>

                  <div className="form-grid">
                    <input
                      className="input"
                      value={form.username}
                      onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder={text.username}
                    />
                    <input
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder={text.email}
                    />
                    <input
                      className="input"
                      value={form.payment_network}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, payment_network: e.target.value }))
                      }
                      placeholder={text.network}
                    />
                  </div>

                  <div className="readonly-status-row">
                    <span className="meta-label">{text.currentStatus}:</span>
                    <span className={getStatusClass(selectedOrder.status)}>
                      {getStatusLabel(selectedOrder.status, text)}
                    </span>
                  </div>

                  <div className="preview-box">
                    {selectedOrder.proof_image_base64 ? (
                      <>
                        <img
                          src={selectedOrder.proof_image_base64}
                          alt="payment proof"
                          className="proof-image"
                        />
                        <button
                          type="button"
                          className="secondary-wide-btn"
                          onClick={() => window.open(selectedOrder.proof_image_base64 || '', '_blank')}
                        >
                          {text.viewLarge}
                        </button>
                      </>
                    ) : (
                      <div className="empty-text">{text.noImage}</div>
                    )}
                  </div>

                  <div className="hash-box">
                    <div className="field-label">{text.txHash}</div>
                    <textarea
                      className="textarea mono"
                      value={form.tx_hash}
                      onChange={(e) => setForm((prev) => ({ ...prev, tx_hash: e.target.value }))}
                      placeholder={text.noHash}
                      rows={4}
                    />
                  </div>

                  <div className="preview-note-box">
                    <div className="field-label">{text.userNote}</div>
                    <textarea
                      className="textarea"
                      value={form.public_note}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, public_note: e.target.value }))
                      }
                      placeholder={text.userNote}
                      rows={4}
                    />
                  </div>

                  <div className="preview-note-box">
                    <div className="field-label">{text.adminNote}</div>
                    <textarea
                      className="textarea"
                      value={form.admin_note}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, admin_note: e.target.value }))
                      }
                      placeholder={text.adminNote}
                      rows={4}
                    />
                  </div>

                  <div className="save-hint">{text.saveHint}</div>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={saveOrder}
                    disabled={saveLoading || actionLoading !== null}
                  >
                    {saveLoading ? text.saving : text.saveChanges}
                  </button>

                  <div className="action-grid">
                    <button
                      type="button"
                      className={`admin-action-btn admin-action-complete ${
                        actionLoading === 'complete' ? 'loading' : ''
                      }`}
                      disabled={saveLoading || actionLoading !== null}
                      onClick={() => runOrderAction('complete')}
                    >
                      {actionLoading === 'complete' ? text.completing : text.completedBtn}
                    </button>

                    <button
                      type="button"
                      className={`admin-action-btn admin-action-restore ${
                        actionLoading === 'restore' ? 'loading' : ''
                      }`}
                      disabled={saveLoading || actionLoading !== null}
                      onClick={() => runOrderAction('restore')}
                    >
                      {actionLoading === 'restore' ? text.restoring : text.restoreBtn}
                    </button>

                    <button
                      type="button"
                      className={`admin-action-btn admin-action-cancel ${
                        actionLoading === 'cancel' ? 'loading' : ''
                      }`}
                      disabled={saveLoading || actionLoading !== null}
                      onClick={() => runOrderAction('cancel')}
                    >
                      {actionLoading === 'cancel' ? text.cancelling : text.cancelBtn}
                    </button>

                    <button
                      type="button"
                      className={`admin-action-btn admin-action-delete ${
                        actionLoading === 'delete' ? 'loading' : ''
                      }`}
                      disabled={saveLoading || actionLoading !== null}
                      onClick={() => runOrderAction('delete')}
                    >
                      {actionLoading === 'delete' ? text.deleting : text.deleteBtn}
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-text">{text.selectHint}</div>
              )}
            </section>
          </div>
        ) : null}

        {tab === 'pricing' ? (
          <section className="card single-card">
            <h2 className="section-title">{text.pricesTitle}</h2>

            <div className="settings-grid">
              <label className="setting-field">
                <span>{text.price3m}</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={siteConfig.premium_3m_price}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      premium_3m_price: Number(e.target.value || 0),
                    }))
                  }
                />
              </label>

              <label className="setting-field">
                <span>{text.price6m}</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={siteConfig.premium_6m_price}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      premium_6m_price: Number(e.target.value || 0),
                    }))
                  }
                />
              </label>

              <label className="setting-field">
                <span>{text.price12m}</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={siteConfig.premium_12m_price}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      premium_12m_price: Number(e.target.value || 0),
                    }))
                  }
                />
              </label>

              <label className="setting-field">
                <span>{text.starsRate}</span>
                <input
                  className="input"
                  type="number"
                  step="0.0001"
                  value={siteConfig.stars_rate}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      stars_rate: Number(e.target.value || 0),
                    }))
                  }
                />
              </label>

              <label className="setting-field">
                <span>{text.trc20}</span>
                <textarea
                  className="textarea mono"
                  value={siteConfig.trc20_address}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({ ...prev, trc20_address: e.target.value }))
                  }
                  rows={3}
                />
              </label>

              <label className="setting-field">
                <span>{text.base}</span>
                <textarea
                  className="textarea mono"
                  value={siteConfig.base_address}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({ ...prev, base_address: e.target.value }))
                  }
                  rows={3}
                />
              </label>
            </div>

            <button type="button" className="primary-btn" onClick={saveSiteConfig} disabled={configLoading}>
              {configLoading ? text.configSaving : text.saveConfig}
            </button>
          </section>
        ) : null}
      </div>

      <style jsx>{styles}</style>
    </main>
  )
}

const styles = `
  .admin-shell {
    min-height: 100vh;
    background: linear-gradient(180deg, #f7f8fb 0%, #eef2f8 100%);
    padding: 20px 12px 40px;
  }

  .admin-panel {
    max-width: 1220px;
    margin: 0 auto;
    display: grid;
    gap: 16px;
  }

  .small-panel {
    max-width: 720px;
  }

  .loading-card,
  .card,
  .hero-card,
  .tabs-row,
  .status-box {
    border-radius: 24px;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(15,23,42,0.06);
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
  }

  .loading-card {
    padding: 22px;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
  }

  .hero-card {
    padding: 18px;
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(24px, 4vw, 34px);
    line-height: 1.1;
    color: #0f172a;
    font-weight: 900;
  }

  .hero-subtitle {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 14px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
    max-width: 560px;
    align-items: stretch;
  }

  .lang-slot {
    min-width: 0;
    width: 100%;
  }

  .small-btn,
  .secondary-wide-btn,
  .logout-btn {
    border: 1px solid rgba(15,23,42,0.08);
    background: #ffffff;
    color: #0f172a;
    border-radius: 20px;
    min-height: 56px;
    padding: 0 20px;
    font-size: 16px;
    font-weight: 900;
    transition: all .16s ease;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  }

  .small-btn:hover,
  .secondary-wide-btn:hover {
    background: #f8fafc;
  }

  .logout-btn {
    width: 100%;
    min-width: 0;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    color: #071b57;
    border-color: rgba(7, 27, 87, 0.12);
    box-shadow: 0 12px 28px rgba(7, 27, 87, 0.08);
  }

  .logout-btn:hover {
    background: #eef4ff;
    color: #071b57;
    border-color: rgba(7, 27, 87, 0.22);
    box-shadow: 0 16px 34px rgba(7, 27, 87, 0.12);
  }

  .logout-btn:active,
  .small-btn:active,
  .secondary-wide-btn:active,
  .primary-btn:active,
  .tab-btn:active,
  .order-item:active,
  .admin-action-btn:active {
    transform: translateY(1px) scale(.985);
  }

  .logout-btn:disabled {
    opacity: .72;
    cursor: not-allowed;
  }

  .tabs-row {
    display: grid;
    gap: 10px;
    padding: 10px;
  }

  .two-tabs {
    grid-template-columns: repeat(2, minmax(0,1fr));
  }

  .tab-btn {
    border: none;
    border-radius: 18px;
    min-height: 52px;
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
    background: #f8fafc;
    transition: all .16s ease;
  }

  .tab-btn.active {
    background: #071b57;
    color: #ffffff;
    box-shadow: 0 14px 30px rgba(7, 27, 87, 0.22);
  }

  .status-box {
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 700;
  }

  .status-box.success {
    border-color: rgba(22,163,74,0.16);
    color: #166534;
    background: #ecfdf3;
  }

  .status-box.error {
    border-color: rgba(220,38,38,0.16);
    color: #991b1b;
    background: #fef2f2;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 16px;
    align-items: start;
  }

  .card {
    padding: 16px;
    min-width: 0;
    overflow: hidden;
  }

  .single-card {
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
  }

  .search-card {
    display: grid;
    gap: 12px;
  }

  .search-row {
    display: grid;
    grid-template-columns: minmax(0,1fr) 120px;
    gap: 10px;
  }

  .filter-row {
    display: grid;
    gap: 10px;
  }

  .checkbox-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    font-size: 14px;
    font-weight: 700;
  }

  .input,
  .textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border-radius: 18px;
    border: 1px solid rgba(15,23,42,0.12);
    background: #ffffff;
    color: #111827;
    font-size: 16px;
    padding: 14px 16px;
    outline: none;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .input:focus,
  .textarea:focus {
    border-color: rgba(245, 158, 11, 0.9);
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
  }

  .textarea {
    resize: vertical;
    line-height: 1.65;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    word-break: break-all;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .order-list-card {
    display: grid;
    gap: 12px;
    max-height: 80vh;
    overflow: auto;
  }

  .order-item {
    width: 100%;
    text-align: left;
    border-radius: 20px;
    border: 1px solid rgba(15,23,42,0.08);
    background: #ffffff;
    padding: 14px;
    display: grid;
    gap: 6px;
    transition: all .16s ease;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  }

  .order-item.active {
    border-color: rgba(7, 27, 87, 0.4);
    box-shadow: 0 16px 30px rgba(7, 27, 87, 0.12);
  }

  .order-item-title {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    word-break: break-all;
  }

  .order-item-sub {
    color: #64748b;
    font-size: 14px;
    word-break: break-word;
  }

  .status {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 900;
    border: 1px solid rgba(15,23,42,0.08);
    background: #f8fafc;
    color: #0f172a;
  }

  .status.pending {
    background: #fff7ed;
    color: #c2410c;
    border-color: rgba(194,65,12,0.16);
  }

  .status.paid {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: rgba(29,78,216,0.16);
  }

  .status.completed {
    background: #ecfdf3;
    color: #166534;
    border-color: rgba(22,101,52,0.16);
  }

  .status.cancelled {
    background: #fef2f2;
    color: #b91c1c;
    border-color: rgba(185,28,28,0.16);
  }

  .editor-card {
    display: grid;
    gap: 14px;
  }

  .section-title {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
  }

  .meta-grid {
    display: grid;
    gap: 8px;
    color: #111827;
    line-height: 1.7;
    font-size: 16px;
  }

  .meta-label,
  .field-label {
    font-weight: 900;
    color: #0f172a;
  }

  .preview-box {
    display: grid;
    gap: 10px;
  }

  .proof-image {
    width: 100%;
    display: block;
    max-height: 320px;
    object-fit: cover;
    border-radius: 22px;
    border: 1px solid rgba(15,23,42,0.08);
    background: #f8fafc;
  }

  .form-grid {
    display: grid;
    gap: 10px;
  }

  .readonly-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hash-box,
  .preview-note-box {
    display: grid;
    gap: 8px;
  }

  .save-hint {
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
  }

  .primary-btn {
    width: 100%;
    min-height: 58px;
    border: none;
    border-radius: 20px;
    background: #071b57;
    color: #ffffff;
    font-size: 18px;
    font-weight: 900;
    box-shadow: 0 16px 32px rgba(7, 27, 87, 0.2);
    transition: all .16s ease;
  }

  .primary-btn:disabled,
  .admin-action-btn:disabled {
    cursor: not-allowed;
    opacity: .72;
  }

  .action-grid {
    display: grid;
    gap: 12px;
  }

  .admin-action-btn {
    width: 100%;
    min-height: 56px;
    border-radius: 18px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    font-size: 18px;
    font-weight: 900;
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      background-color 0.16s ease,
      border-color 0.16s ease,
      color 0.16s ease,
      opacity 0.16s ease;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    background: #ffffff;
  }

  .admin-action-complete {
    background: #ecfdf3;
    color: #166534;
    border-color: rgba(22, 101, 52, 0.16);
  }

  .admin-action-complete.loading,
  .admin-action-complete:hover {
    background: #16a34a;
    color: #ffffff;
    border-color: #16a34a;
    box-shadow: 0 12px 28px rgba(22, 163, 74, 0.22);
  }

  .admin-action-restore {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: rgba(29, 78, 216, 0.16);
  }

  .admin-action-restore.loading,
  .admin-action-restore:hover {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.22);
  }

  .admin-action-cancel {
    background: #fff7ed;
    color: #c2410c;
    border-color: rgba(194, 65, 12, 0.16);
  }

  .admin-action-cancel.loading,
  .admin-action-cancel:hover {
    background: #ea580c;
    color: #ffffff;
    border-color: #ea580c;
    box-shadow: 0 12px 28px rgba(234, 88, 12, 0.22);
  }

  .admin-action-delete {
    background: #fef2f2;
    color: #b91c1c;
    border-color: rgba(185, 28, 28, 0.16);
  }

  .admin-action-delete.loading,
  .admin-action-delete:hover {
    background: #dc2626;
    color: #ffffff;
    border-color: #dc2626;
    box-shadow: 0 12px 28px rgba(220, 38, 38, 0.22);
  }

  .settings-grid {
    display: grid;
    gap: 14px;
  }

  .setting-field {
    display: grid;
    gap: 8px;
    color: #0f172a;
    font-weight: 800;
  }

  .empty-text {
    color: #64748b;
    font-size: 15px;
    line-height: 1.7;
  }

  @media (max-width: 1080px) {
    .grid-layout {
      grid-template-columns: 1fr;
    }

    .order-list-card {
      max-height: none;
    }
  }

  @media (max-width: 640px) {
    .admin-shell {
      padding: 14px 10px 28px;
    }

    .hero-card {
      padding: 14px;
    }

    .hero-actions {
      max-width: none;
      grid-template-columns: 1fr 1fr;
    }

    .two-tabs {
      grid-template-columns: 1fr 1fr;
    }

    .search-row {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 22px;
    }

    .primary-btn,
    .admin-action-btn,
    .logout-btn,
    .small-btn,
    .secondary-wide-btn {
      min-height: 56px;
      font-size: 16px;
    }
  }
`
