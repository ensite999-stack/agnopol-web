'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

type AdminOrder = {
  id: number
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
  status: 'pending_payment' | 'paid' | 'cancelled'
  public_note: string | null
  admin_note: string | null
  created_at: string | null
  updated_at: string | null
}

type SiteSettings = {
  id: number
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  trc20_address: string
  base_address: string
  updated_at: string
}

const adminTexts = {
  de: {
    checking: 'Checking session...',
    unauthorized: 'Not logged in. Redirecting...',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    tabOrders: 'Orders',
    tabSettings: 'Pricing & Addresses',
    search: 'Search by email / order no / username',
    statusAll: 'All',
    statusPending: 'Pending Payment',
    statusPaid: 'Paid',
    statusCancelled: 'Cancelled',
    autoRefresh: 'Auto Refresh',
    refreshNow: 'Refresh Now',
    saveChanges: 'Save Changes',
    deleteOrder: 'Delete Order',
    confirmPaid: 'Mark Paid',
    restorePayment: 'Restore Payment',
    cancelOrder: 'Cancel Order',
    saving: 'Saving...',
    deleting: 'Deleting...',
    noOrders: 'No orders found.',
    editTitle: 'Edit Order',
    publicNote: 'User Visible Note',
    adminNote: 'Internal Admin Note',
    txHash: 'Transaction Hash',
    username: 'Telegram Username',
    email: 'Email',
    paymentNetwork: 'Payment Network',
    createdAt: 'Created At',
    orderNo: 'Order No',
    product: 'Product',
    amount: 'Amount',
    status: 'Status',
    settingsTitle: 'Site Settings',
    premium3: 'Premium 3 Months',
    premium6: 'Premium 6 Months',
    premium12: 'Premium 12 Months',
    starsRate: 'Stars Rate',
    trc20: 'TRC20 Address',
    base: 'Base Address',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully.',
    ordersUpdated: 'Order updated successfully.',
    orderDeleted: 'Order deleted successfully.',
    noSettings: 'No settings data.',
  },
  en: {
    checking: 'Checking session...',
    unauthorized: 'Not logged in. Redirecting...',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    tabOrders: 'Orders',
    tabSettings: 'Pricing & Addresses',
    search: 'Search by email / order no / username',
    statusAll: 'All',
    statusPending: 'Pending Payment',
    statusPaid: 'Paid',
    statusCancelled: 'Cancelled',
    autoRefresh: 'Auto Refresh',
    refreshNow: 'Refresh Now',
    saveChanges: 'Save Changes',
    deleteOrder: 'Delete Order',
    confirmPaid: 'Mark Paid',
    restorePayment: 'Restore Payment',
    cancelOrder: 'Cancel Order',
    saving: 'Saving...',
    deleting: 'Deleting...',
    noOrders: 'No orders found.',
    editTitle: 'Edit Order',
    publicNote: 'User Visible Note',
    adminNote: 'Internal Admin Note',
    txHash: 'Transaction Hash',
    username: 'Telegram Username',
    email: 'Email',
    paymentNetwork: 'Payment Network',
    createdAt: 'Created At',
    orderNo: 'Order No',
    product: 'Product',
    amount: 'Amount',
    status: 'Status',
    settingsTitle: 'Site Settings',
    premium3: 'Premium 3 Months',
    premium6: 'Premium 6 Months',
    premium12: 'Premium 12 Months',
    starsRate: 'Stars Rate',
    trc20: 'TRC20 Address',
    base: 'Base Address',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully.',
    ordersUpdated: 'Order updated successfully.',
    orderDeleted: 'Order deleted successfully.',
    noSettings: 'No settings data.',
  },
  es: {
    checking: 'Comprobando sesión...',
    unauthorized: 'No has iniciado sesión. Redirigiendo...',
    logout: 'Cerrar sesión',
    loggingOut: 'Cerrando sesión...',
    tabOrders: 'Pedidos',
    tabSettings: 'Precios y direcciones',
    search: 'Buscar por correo / pedido / usuario',
    statusAll: 'Todos',
    statusPending: 'Pendiente de pago',
    statusPaid: 'Pagado',
    statusCancelled: 'Cancelado',
    autoRefresh: 'Auto actualización',
    refreshNow: 'Actualizar ahora',
    saveChanges: 'Guardar cambios',
    deleteOrder: 'Eliminar pedido',
    confirmPaid: 'Marcar pagado',
    restorePayment: 'Restaurar pago',
    cancelOrder: 'Cancelar pedido',
    saving: 'Guardando...',
    deleting: 'Eliminando...',
    noOrders: 'No se encontraron pedidos.',
    editTitle: 'Editar pedido',
    publicNote: 'Nota visible al usuario',
    adminNote: 'Nota interna',
    txHash: 'Hash de transacción',
    username: 'Usuario de Telegram',
    email: 'Correo electrónico',
    paymentNetwork: 'Red de pago',
    createdAt: 'Fecha de creación',
    orderNo: 'N.º de pedido',
    product: 'Producto',
    amount: 'Importe',
    status: 'Estado',
    settingsTitle: 'Configuración del sitio',
    premium3: 'Premium 3 Meses',
    premium6: 'Premium 6 Meses',
    premium12: 'Premium 12 Meses',
    starsRate: 'Tarifa Stars',
    trc20: 'Dirección TRC20',
    base: 'Dirección Base',
    saveSettings: 'Guardar configuración',
    settingsSaved: 'Configuración guardada.',
    ordersUpdated: 'Pedido actualizado.',
    orderDeleted: 'Pedido eliminado.',
    noSettings: 'No hay datos de configuración.',
  },
  fr: {
    checking: 'Vérification de la session...',
    unauthorized: 'Non connecté. Redirection...',
    logout: 'Se déconnecter',
    loggingOut: 'Déconnexion...',
    tabOrders: 'Commandes',
    tabSettings: 'Tarifs et adresses',
    search: 'Rechercher par e-mail / commande / utilisateur',
    statusAll: 'Toutes',
    statusPending: 'En attente de paiement',
    statusPaid: 'Payée',
    statusCancelled: 'Annulée',
    autoRefresh: 'Rafraîchissement auto',
    refreshNow: 'Rafraîchir',
    saveChanges: 'Enregistrer',
    deleteOrder: 'Supprimer',
    confirmPaid: 'Marquer payée',
    restorePayment: 'Restaurer paiement',
    cancelOrder: 'Annuler commande',
    saving: 'Enregistrement...',
    deleting: 'Suppression...',
    noOrders: 'Aucune commande trouvée.',
    editTitle: 'Modifier la commande',
    publicNote: 'Note visible utilisateur',
    adminNote: 'Note interne',
    txHash: 'Hash de transaction',
    username: 'Nom Telegram',
    email: 'E-mail',
    paymentNetwork: 'Réseau de paiement',
    createdAt: 'Date de création',
    orderNo: 'N° de commande',
    product: 'Produit',
    amount: 'Montant',
    status: 'Statut',
    settingsTitle: 'Paramètres du site',
    premium3: 'Premium 3 Mois',
    premium6: 'Premium 6 Mois',
    premium12: 'Premium 12 Mois',
    starsRate: 'Taux Stars',
    trc20: 'Adresse TRC20',
    base: 'Adresse Base',
    saveSettings: 'Enregistrer',
    settingsSaved: 'Paramètres enregistrés.',
    ordersUpdated: 'Commande mise à jour.',
    orderDeleted: 'Commande supprimée.',
    noSettings: 'Aucune donnée de configuration.',
  },
  ja: {
    checking: 'セッションを確認中...',
    unauthorized: '未ログインです。リダイレクト中...',
    logout: 'ログアウト',
    loggingOut: 'ログアウト中...',
    tabOrders: '注文管理',
    tabSettings: '価格とアドレス',
    search: 'メール / 注文番号 / ユーザー名で検索',
    statusAll: 'すべて',
    statusPending: '未払い',
    statusPaid: '支払い済み',
    statusCancelled: 'キャンセル済み',
    autoRefresh: '自動更新',
    refreshNow: '今すぐ更新',
    saveChanges: '変更を保存',
    deleteOrder: '注文削除',
    confirmPaid: '支払い済みにする',
    restorePayment: '支払い待ちに戻す',
    cancelOrder: '注文を取消',
    saving: '保存中...',
    deleting: '削除中...',
    noOrders: '注文が見つかりません。',
    editTitle: '注文編集',
    publicNote: 'ユーザー表示メモ',
    adminNote: '管理メモ',
    txHash: '取引ハッシュ',
    username: 'Telegram ユーザー名',
    email: 'メールアドレス',
    paymentNetwork: '支払いネットワーク',
    createdAt: '作成日時',
    orderNo: '注文番号',
    product: '商品',
    amount: '金額',
    status: '状態',
    settingsTitle: 'サイト設定',
    premium3: 'Premium 3か月',
    premium6: 'Premium 6か月',
    premium12: 'Premium 12か月',
    starsRate: 'Stars レート',
    trc20: 'TRC20 アドレス',
    base: 'Base アドレス',
    saveSettings: '設定を保存',
    settingsSaved: '設定を保存しました。',
    ordersUpdated: '注文を更新しました。',
    orderDeleted: '注文を削除しました。',
    noSettings: '設定データがありません。',
  },
  ko: {
    checking: '세션 확인 중...',
    unauthorized: '로그인되지 않았습니다. 이동 중...',
    logout: '로그아웃',
    loggingOut: '로그아웃 중...',
    tabOrders: '주문 관리',
    tabSettings: '가격 및 주소',
    search: '이메일 / 주문번호 / 사용자명 검색',
    statusAll: '전체',
    statusPending: '결제 대기',
    statusPaid: '결제 완료',
    statusCancelled: '취소됨',
    autoRefresh: '자동 새로고침',
    refreshNow: '지금 새로고침',
    saveChanges: '변경 저장',
    deleteOrder: '주문 삭제',
    confirmPaid: '결제 완료로 변경',
    restorePayment: '결제 대기로 복원',
    cancelOrder: '주문 취소',
    saving: '저장 중...',
    deleting: '삭제 중...',
    noOrders: '주문이 없습니다.',
    editTitle: '주문 수정',
    publicNote: '사용자 표시 메모',
    adminNote: '관리자 메모',
    txHash: '거래 해시',
    username: 'Telegram 사용자 이름',
    email: '이메일',
    paymentNetwork: '결제 네트워크',
    createdAt: '생성 시간',
    orderNo: '주문번호',
    product: '상품',
    amount: '금액',
    status: '상태',
    settingsTitle: '사이트 설정',
    premium3: 'Premium 3개월',
    premium6: 'Premium 6개월',
    premium12: 'Premium 12개월',
    starsRate: 'Stars 요율',
    trc20: 'TRC20 주소',
    base: 'Base 주소',
    saveSettings: '설정 저장',
    settingsSaved: '설정이 저장되었습니다.',
    ordersUpdated: '주문이 수정되었습니다.',
    orderDeleted: '주문이 삭제되었습니다.',
    noSettings: '설정 데이터가 없습니다.',
  },
  'zh-cn': {
    checking: '正在检查登录状态...',
    unauthorized: '尚未登录，正在跳转...',
    logout: '退出登录',
    loggingOut: '退出中...',
    tabOrders: '订单管理',
    tabSettings: '价格与地址',
    search: '按邮箱 / 订单号 / 用户名搜索',
    statusAll: '全部',
    statusPending: '待支付',
    statusPaid: '已支付',
    statusCancelled: '已取消',
    autoRefresh: '自动刷新',
    refreshNow: '立即刷新',
    saveChanges: '保存修改',
    deleteOrder: '删除订单',
    confirmPaid: '标记已支付',
    restorePayment: '恢复支付',
    cancelOrder: '取消订单',
    saving: '保存中...',
    deleting: '删除中...',
    noOrders: '暂无订单。',
    editTitle: '编辑订单',
    publicNote: '用户可见提示',
    adminNote: '后台备注',
    txHash: '交易哈希',
    username: 'TG 用户名',
    email: '邮箱',
    paymentNetwork: '支付网络',
    createdAt: '创建时间',
    orderNo: '订单号',
    product: '产品',
    amount: '金额',
    status: '状态',
    settingsTitle: '站点配置',
    premium3: 'Premium 3个月',
    premium6: 'Premium 6个月',
    premium12: 'Premium 12个月',
    starsRate: 'Stars 汇率',
    trc20: 'TRC20 地址',
    base: 'Base 地址',
    saveSettings: '保存配置',
    settingsSaved: '配置保存成功。',
    ordersUpdated: '订单更新成功。',
    orderDeleted: '订单删除成功。',
    noSettings: '暂无配置数据。',
  },
  'zh-tw': {
    checking: '正在檢查登入狀態...',
    unauthorized: '尚未登入，正在跳轉...',
    logout: '登出',
    loggingOut: '登出中...',
    tabOrders: '訂單管理',
    tabSettings: '價格與地址',
    search: '按電子郵件 / 訂單號 / 用戶名搜尋',
    statusAll: '全部',
    statusPending: '待支付',
    statusPaid: '已支付',
    statusCancelled: '已取消',
    autoRefresh: '自動刷新',
    refreshNow: '立即刷新',
    saveChanges: '保存修改',
    deleteOrder: '刪除訂單',
    confirmPaid: '標記已支付',
    restorePayment: '恢復支付',
    cancelOrder: '取消訂單',
    saving: '保存中...',
    deleting: '刪除中...',
    noOrders: '暫無訂單。',
    editTitle: '編輯訂單',
    publicNote: '用戶可見提示',
    adminNote: '後台備註',
    txHash: '交易哈希',
    username: 'TG 用戶名',
    email: '電子郵件',
    paymentNetwork: '支付網路',
    createdAt: '建立時間',
    orderNo: '訂單號',
    product: '產品',
    amount: '金額',
    status: '狀態',
    settingsTitle: '站點配置',
    premium3: 'Premium 3個月',
    premium6: 'Premium 6個月',
    premium12: 'Premium 12個月',
    starsRate: 'Stars 匯率',
    trc20: 'TRC20 地址',
    base: 'Base 地址',
    saveSettings: '保存配置',
    settingsSaved: '配置保存成功。',
    ordersUpdated: '訂單更新成功。',
    orderDeleted: '訂單刪除成功。',
    noSettings: '暫無配置資料。',
  },
} as const

function getProductLabel(item: AdminOrder) {
  if (item.product_type === 'tg_stars') {
    return `TG Stars ${item.stars_amount ?? 0}`
  }
  if (item.duration === '3m') return 'TG Premium 3M'
  if (item.duration === '6m') return 'TG Premium 6M'
  if (item.duration === '12m') return 'TG Premium 12M'
  return item.product_type || '-'
}

export default function AdminPage() {
  const { lang, t } = useI18n()
  const text = useMemo(() => adminTexts[lang] || adminTexts.en, [lang])

  const [authStatus, setAuthStatus] = useState<'checking' | 'ok' | 'unauthorized'>('checking')
  const [loggingOut, setLoggingOut] = useState(false)

  const [tab, setTab] = useState<'orders' | 'settings'>('orders')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersMessage, setOrdersMessage] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_payment' | 'paid' | 'cancelled'>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [settingsError, setSettingsError] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
          credentials: 'include',
        })
        const data = await response.json()

        if (!data?.authenticated) {
          setAuthStatus('unauthorized')
          setTimeout(() => {
            window.location.href = `/admin/login?lang=${lang}`
          }, 500)
          return
        }

        setAuthStatus('ok')
      } catch {
        setAuthStatus('unauthorized')
        setTimeout(() => {
          window.location.href = `/admin/login?lang=${lang}`
        }, 500)
      }
    }

    run()
  }, [lang])

  async function fetchOrders() {
    setOrdersLoading(true)
    setOrdersError('')

    try {
      const params = new URLSearchParams()
      params.set('status', statusFilter)
      params.set('q', query)
      params.set('page', '1')
      params.set('page_size', '50')

      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load orders')
      }

      setOrders(data.items || [])

      setSelectedOrder((prev) => {
        if (!prev) return data.items?.[0] || null
        const matched = (data.items || []).find((item: AdminOrder) => item.id === prev.id)
        return matched || data.items?.[0] || null
      })
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  async function fetchSettings() {
    setSettingsLoading(true)
    setSettingsError('')

    try {
      const response = await fetch('/api/admin/settings', {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load settings')
      }

      setSettings(data.item || null)
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Failed to load settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  useEffect(() => {
    if (authStatus !== 'ok') return
    fetchOrders()
    fetchSettings()
  }, [authStatus])

  useEffect(() => {
    if (authStatus !== 'ok') return
    fetchOrders()
  }, [statusFilter])

  useEffect(() => {
    if (authStatus !== 'ok' || !autoRefresh) return

    const timer = setInterval(() => {
      fetchOrders()
    }, 10000)

    return () => clearInterval(timer)
  }, [authStatus, autoRefresh, statusFilter, query])

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      window.location.href = `/admin/login?lang=${lang}`
    }
  }

  async function handleSaveOrder() {
    if (!selectedOrder) return

    setOrdersMessage('')
    setOrdersError('')

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedOrder.username || '',
          email: selectedOrder.email || '',
          status: selectedOrder.status,
          public_note: selectedOrder.public_note || '',
          admin_note: selectedOrder.admin_note || '',
          tx_hash: selectedOrder.tx_hash || '',
          payment_network: selectedOrder.payment_network || '',
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save order')
      }

      setOrdersMessage(text.ordersUpdated)
      await fetchOrders()
      setSelectedOrder(data.item)
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to save order')
    }
  }

  async function handleDeleteOrder() {
    if (!selectedOrder) return
    const confirmed = window.confirm(`${text.deleteOrder} #${selectedOrder.order_no}?`)
    if (!confirmed) return

    setOrdersMessage('')
    setOrdersError('')

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete order')
      }

      setOrdersMessage(text.orderDeleted)
      setSelectedOrder(null)
      await fetchOrders()
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to delete order')
    }
  }

  async function updateStatus(status: 'pending_payment' | 'paid' | 'cancelled') {
    if (!selectedOrder) return

    const next = { ...selectedOrder, status }
    setSelectedOrder(next)

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update status')
      }

      setOrdersMessage(text.ordersUpdated)
      await fetchOrders()
      setSelectedOrder(data.item)
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  async function handleSaveSettings() {
    if (!settings) return

    setSavingSettings(true)
    setSettingsError('')
    setSettingsMessage('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premium_3m_price: settings.premium_3m_price,
          premium_6m_price: settings.premium_6m_price,
          premium_12m_price: settings.premium_12m_price,
          stars_rate: settings.stars_rate,
          trc20_address: settings.trc20_address,
          base_address: settings.base_address,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save settings')
      }

      setSettings(data.item)
      setSettingsMessage(text.settingsSaved)
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  if (authStatus === 'checking') {
    return (
      <main className="site-shell">
        <div className="site-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="card">{text.checking}</div>
        </div>
      </main>
    )
  }

  if (authStatus === 'unauthorized') {
    return (
      <main className="site-shell">
        <div className="site-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="card">{text.unauthorized}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900 }}>
              {t.admin.title}
            </h1>
            <p className="small-muted" style={{ marginTop: 8 }}>
              {t.admin.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <LanguageSwitcher />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ width: 'auto', minWidth: 120 }}
            >
              {loggingOut ? text.loggingOut : text.logout}
            </button>
          </div>
        </div>

        <div className="segment-tabs" style={{ maxWidth: 520, marginBottom: 18 }}>
          <button
            type="button"
            className={`segment-btn ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            {text.tabOrders}
          </button>
          <button
            type="button"
            className={`segment-btn ${tab === 'settings' ? 'active' : ''}`}
            onClick={() => setTab('settings')}
          >
            {text.tabSettings}
          </button>
        </div>

        {tab === 'orders' ? (
          <div className="admin-grid">
            <aside className="admin-side">
              <div className="card-soft">
                <input
                  className="input"
                  placeholder={text.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                <button
                  className="btn-secondary"
                  style={{ marginTop: 10 }}
                  onClick={fetchOrders}
                >
                  {ordersLoading ? text.saving : text.refreshNow}
                </button>

                <div style={{ marginTop: 12 }}>
                  <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'all' | 'pending_payment' | 'paid' | 'cancelled')
                    }
                  >
                    <option value="all">{text.statusAll}</option>
                    <option value="pending_payment">{text.statusPending}</option>
                    <option value="paid">{text.statusPaid}</option>
                    <option value="cancelled">{text.statusCancelled}</option>
                  </select>
                </div>

                <label
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#475569',
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  {text.autoRefresh}
                </label>
              </div>

              <div
                className="card-soft"
                style={{
                  maxHeight: 620,
                  overflowY: 'auto',
                  display: 'grid',
                  gap: 10,
                }}
              >
                {orders.length === 0 ? (
                  <div className="small-muted">{text.noOrders}</div>
                ) : (
                  orders.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrder(item)
                        setOrdersMessage('')
                        setOrdersError('')
                      }}
                      style={{
                        textAlign: 'left',
                        padding: 14,
                        borderRadius: 14,
                        border:
                          selectedOrder?.id === item.id
                            ? '1px solid #0f234f'
                            : '1px solid rgba(15, 23, 42, 0.08)',
                        background:
                          selectedOrder?.id === item.id
                            ? 'rgba(11, 23, 51, 0.06)'
                            : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.order_no}</div>
                      <div className="small-muted" style={{ marginTop: 6 }}>
                        {item.email || '-'}
                      </div>
                      <div className="small-muted" style={{ marginTop: 4 }}>
                        {getProductLabel(item)}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                        {item.status}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="admin-main">
              <div className="card-soft">
                <div
                  style={{
                    fontSize: 'clamp(18px, 2.2vw, 22px)',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: 12,
                  }}
                >
                  {text.editTitle}
                </div>

                {!selectedOrder ? (
                  <div className="small-muted">{text.noOrders}</div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div><strong>{text.orderNo}:</strong> {selectedOrder.order_no}</div>
                    <div><strong>{text.product}:</strong> {getProductLabel(selectedOrder)}</div>
                    <div><strong>{text.amount}:</strong> ${selectedOrder.price_usd ?? selectedOrder.amount ?? 0}</div>
                    <div><strong>{text.createdAt}:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}</div>

                    <input
                      className="input"
                      placeholder={text.username}
                      value={selectedOrder.username || ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, username: e.target.value })
                      }
                    />

                    <input
                      className="input"
                      placeholder={text.email}
                      value={selectedOrder.email || ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, email: e.target.value })
                      }
                    />

                    <input
                      className="input"
                      placeholder={text.paymentNetwork}
                      value={selectedOrder.payment_network || ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, payment_network: e.target.value })
                      }
                    />

                    <input
                      className="input"
                      placeholder={text.txHash}
                      value={selectedOrder.tx_hash || ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, tx_hash: e.target.value })
                      }
                    />

                    <select
                      className="input"
                      value={selectedOrder.status}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          status: e.target.value as 'pending_payment' | 'paid' | 'cancelled',
                        })
                      }
                    >
                      <option value="pending_payment">{text.statusPending}</option>
                      <option value="paid">{text.statusPaid}</option>
                      <option value="cancelled">{text.statusCancelled}</option>
                    </select>

                    <textarea
                      className="textarea"
                      placeholder={text.publicNote}
                      value={selectedOrder.public_note || ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, public_note: e.target.value })
                      }
                    />

                    <textarea
                      className="textarea"
                      placeholder={text.adminNote}
                      value={selectedOrder.admin_note || ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, admin_note: e.target.value })
                      }
                    />

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 10,
                      }}
                    >
                      <button className="btn-primary" onClick={handleSaveOrder}>
                        {text.saveChanges}
                      </button>

                      <button className="btn-secondary" onClick={() => updateStatus('paid')}>
                        {text.confirmPaid}
                      </button>

                      <button className="btn-secondary" onClick={() => updateStatus('pending_payment')}>
                        {text.restorePayment}
                      </button>

                      <button className="btn-secondary" onClick={() => updateStatus('cancelled')}>
                        {text.cancelOrder}
                      </button>

                      <button className="btn-secondary" onClick={handleDeleteOrder}>
                        {text.deleteOrder}
                      </button>
                    </div>
                  </div>
                )}

                {ordersMessage ? <div className="status-box-success">{ordersMessage}</div> : null}
                {ordersError ? <div className="status-box-error">{ordersError}</div> : null}
              </div>
            </section>
          </div>
        ) : (
          <section className="card-soft">
            <div
              style={{
                fontSize: 'clamp(18px, 2.2vw, 22px)',
                fontWeight: 800,
                color: '#111827',
                marginBottom: 12,
              }}
            >
              {text.settingsTitle}
            </div>

            {settingsLoading ? (
              <div className="small-muted">{text.saving}</div>
            ) : !settings ? (
              <div className="small-muted">{text.noSettings}</div>
            ) : (
              <div style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder={text.premium3}
                  value={settings.premium_3m_price}
                  onChange={(e) =>
                    setSettings({ ...settings, premium_3m_price: Number(e.target.value) })
                  }
                />

                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder={text.premium6}
                  value={settings.premium_6m_price}
                  onChange={(e) =>
                    setSettings({ ...settings, premium_6m_price: Number(e.target.value) })
                  }
                />

                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder={text.premium12}
                  value={settings.premium_12m_price}
                  onChange={(e) =>
                    setSettings({ ...settings, premium_12m_price: Number(e.target.value) })
                  }
                />

                <input
                  className="input"
                  type="number"
                  step="0.0001"
                  placeholder={text.starsRate}
                  value={settings.stars_rate}
                  onChange={(e) =>
                    setSettings({ ...settings, stars_rate: Number(e.target.value) })
                  }
                />

                <textarea
                  className="textarea"
                  placeholder={text.trc20}
                  value={settings.trc20_address}
                  onChange={(e) =>
                    setSettings({ ...settings, trc20_address: e.target.value })
                  }
                />

                <textarea
                  className="textarea"
                  placeholder={text.base}
                  value={settings.base_address}
                  onChange={(e) =>
                    setSettings({ ...settings, base_address: e.target.value })
                  }
                />

                <button
                  className="btn-primary"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  style={{ opacity: savingSettings ? 0.8 : 1 }}
                >
                  {savingSettings ? text.saving : text.saveSettings}
                </button>
              </div>
            )}

            {settingsMessage ? <div className="status-box-success">{settingsMessage}</div> : null}
            {settingsError ? <div className="status-box-error">{settingsError}</div> : null}
          </section>
        )}
      </div>
    </main>
  )
}
