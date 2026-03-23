'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

type AdminOrderStatus = 'pending_payment' | 'paid' | 'completed' | 'cancelled'

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
  proof_image_base64: string | null
  status: AdminOrderStatus
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
  'zh-cn': {
    title: '后台管理',
    subtitle: '订单管理、价格配置与收款地址管理',
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
    statusCompleted: '已完成',
    statusCancelled: '已取消',
    autoRefresh: '自动刷新',
    refreshNow: '立即刷新',
    refreshing: '刷新中...',
    noOrders: '暂无订单。',
    editTitle: '编辑订单',
    orderNo: '订单号',
    product: '产品',
    amount: '金额',
    status: '状态',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    username: 'TG 用户名',
    email: '邮箱',
    paymentNetwork: '支付网络',
    txHash: '交易哈希',
    proofImage: '付款截图',
    openImage: '查看大图',
    publicNote: '用户可见提示',
    adminNote: '后台备注',
    saveChanges: '保存修改',
    saveHint: '保存订单信息、用户可见提示与后台备注',
    completeOrder: '已完成',
    restorePayment: '恢复支付',
    cancelOrder: '取消订单',
    deleteOrder: '删除订单',
    saving: '保存中...',
    deleting: '删除中...',
    settingsTitle: '站点配置',
    premium3: 'Premium 3个月',
    premium6: 'Premium 6个月',
    premium12: 'Premium 12个月',
    starsRate: 'Stars 汇率',
    trc20: 'TRC20 地址',
    base: 'Base 地址',
    saveSettings: '保存配置',
    settingsSaved: '价格与收款地址已保存，前台刷新后会同步。',
    orderSaved: '订单信息与用户可见提示已保存。',
    orderCompleted: '订单已改为已完成，前台查询会显示已完成。',
    orderRestored: '订单已恢复为待支付。',
    orderCancelled: '订单已取消。',
    orderDeleted: '订单已删除。',
    noSettings: '暂无配置数据。',
    confirmDelete: '确认删除这个订单吗？删除后无法恢复。',
    proofMissing: '该订单暂无上传图片。',
    timezoneHint: '所有时间均按美国波士顿时区显示。',
  },
  'zh-tw': {
    title: '後台管理',
    subtitle: '訂單管理、價格配置與收款地址管理',
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
    statusCompleted: '已完成',
    statusCancelled: '已取消',
    autoRefresh: '自動刷新',
    refreshNow: '立即刷新',
    refreshing: '刷新中...',
    noOrders: '暫無訂單。',
    editTitle: '編輯訂單',
    orderNo: '訂單號',
    product: '產品',
    amount: '金額',
    status: '狀態',
    createdAt: '建立時間',
    updatedAt: '更新時間',
    username: 'TG 用戶名',
    email: '電子郵件',
    paymentNetwork: '支付網路',
    txHash: '交易哈希',
    proofImage: '付款截圖',
    openImage: '查看大圖',
    publicNote: '用戶可見提示',
    adminNote: '後台備註',
    saveChanges: '保存修改',
    saveHint: '保存訂單資訊、用戶可見提示與後台備註',
    completeOrder: '已完成',
    restorePayment: '恢復支付',
    cancelOrder: '取消訂單',
    deleteOrder: '刪除訂單',
    saving: '保存中...',
    deleting: '刪除中...',
    settingsTitle: '站點配置',
    premium3: 'Premium 3個月',
    premium6: 'Premium 6個月',
    premium12: 'Premium 12個月',
    starsRate: 'Stars 匯率',
    trc20: 'TRC20 地址',
    base: 'Base 地址',
    saveSettings: '保存配置',
    settingsSaved: '價格與收款地址已保存，前台刷新後會同步。',
    orderSaved: '訂單資訊與用戶可見提示已保存。',
    orderCompleted: '訂單已改為已完成，前台查詢會顯示已完成。',
    orderRestored: '訂單已恢復為待支付。',
    orderCancelled: '訂單已取消。',
    orderDeleted: '訂單已刪除。',
    noSettings: '暫無配置資料。',
    confirmDelete: '確認刪除這個訂單嗎？刪除後無法恢復。',
    proofMissing: '此訂單暫無上傳圖片。',
    timezoneHint: '所有時間均按美國波士頓時區顯示。',
  },
  en: {
    title: 'Admin Console',
    subtitle: 'Order management, pricing settings and payment address management',
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
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    autoRefresh: 'Auto Refresh',
    refreshNow: 'Refresh Now',
    refreshing: 'Refreshing...',
    noOrders: 'No orders found.',
    editTitle: 'Edit Order',
    orderNo: 'Order No',
    product: 'Product',
    amount: 'Amount',
    status: 'Status',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    username: 'Telegram Username',
    email: 'Email',
    paymentNetwork: 'Payment Network',
    txHash: 'Transaction Hash',
    proofImage: 'Payment Screenshot',
    openImage: 'Open Full Image',
    publicNote: 'User Visible Note',
    adminNote: 'Internal Admin Note',
    saveChanges: 'Save Changes',
    saveHint: 'Save order info, public note and admin note',
    completeOrder: 'Mark Completed',
    restorePayment: 'Restore Payment',
    cancelOrder: 'Cancel Order',
    deleteOrder: 'Delete Order',
    saving: 'Saving...',
    deleting: 'Deleting...',
    settingsTitle: 'Site Settings',
    premium3: 'Premium 3 Months',
    premium6: 'Premium 6 Months',
    premium12: 'Premium 12 Months',
    starsRate: 'Stars Rate',
    trc20: 'TRC20 Address',
    base: 'Base Address',
    saveSettings: 'Save Settings',
    settingsSaved: 'Pricing and payment addresses saved. Frontend will sync after refresh.',
    orderSaved: 'Order information and user-visible note saved.',
    orderCompleted: 'Order marked as completed. Frontend lookup will show completed.',
    orderRestored: 'Order restored to pending payment.',
    orderCancelled: 'Order cancelled.',
    orderDeleted: 'Order deleted.',
    noSettings: 'No settings data.',
    confirmDelete: 'Delete this order? This action cannot be undone.',
    proofMissing: 'No uploaded proof image for this order.',
    timezoneHint: 'All times are displayed in Boston time.',
  },
} as const

function getStatusLabel(status: AdminOrderStatus, text: (typeof adminTexts)[keyof typeof adminTexts]) {
  if (status === 'pending_payment') return text.statusPending
  if (status === 'paid') return text.statusPaid
  if (status === 'completed') return text.statusCompleted
  return text.statusCancelled
}

function getStatusColor(status: AdminOrderStatus) {
  if (status === 'completed') return '#166534'
  if (status === 'paid') return '#1d4ed8'
  if (status === 'cancelled') return '#991b1b'
  return '#475569'
}

function getStatusBg(status: AdminOrderStatus) {
  if (status === 'completed') return 'rgba(22, 101, 52, 0.08)'
  if (status === 'paid') return 'rgba(29, 78, 216, 0.08)'
  if (status === 'cancelled') return 'rgba(153, 27, 27, 0.08)'
  return 'rgba(71, 85, 105, 0.08)'
}

function getProductLabel(item: AdminOrder) {
  if (item.product_type === 'tg_stars') {
    return `TG Stars ${item.stars_amount ?? 0}`
  }
  if (item.duration === '3m') return 'TG Premium 3M'
  if (item.duration === '6m') return 'TG Premium 6M'
  if (item.duration === '12m') return 'TG Premium 12M'
  return item.product_type || '-'
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

export default function AdminPage() {
  const { lang } = useI18n()
  const langKey = lang === 'zh-cn' || lang === 'zh-tw' || lang === 'en' ? lang : 'en'
  const text = useMemo(() => adminTexts[langKey], [langKey])

  const [authStatus, setAuthStatus] = useState<'checking' | 'ok' | 'unauthorized'>('checking')
  const [loggingOut, setLoggingOut] = useState(false)

  const [tab, setTab] = useState<'orders' | 'settings'>('orders')

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersMessage, setOrdersMessage] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminOrderStatus>('all')
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
            window.location.href = `/admin/login?lang=${langKey}`
          }, 500)
          return
        }

        setAuthStatus('ok')
      } catch {
        setAuthStatus('unauthorized')
        setTimeout(() => {
          window.location.href = `/admin/login?lang=${langKey}`
        }, 500)
      }
    }

    run()
  }, [langKey])

  async function fetchOrders() {
    setOrdersLoading(true)
    setOrdersError('')

    try {
      const params = new URLSearchParams()
      params.set('status', statusFilter)
      params.set('q', query.trim())
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

      const nextOrders: AdminOrder[] = data.items || []
      setOrders(nextOrders)

      setSelectedOrder((prev) => {
        if (!prev) return nextOrders[0] || null
        const matched = nextOrders.find((item) => item.id === prev.id)
        return matched || nextOrders[0] || null
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
      window.location.href = `/admin/login?lang=${langKey}`
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
        credentials: 'include',
        body: JSON.stringify({
          username: selectedOrder.username || '',
          email: selectedOrder.email || '',
          payment_network: selectedOrder.payment_network || '',
          tx_hash: selectedOrder.tx_hash || '',
          public_note: selectedOrder.public_note || '',
          admin_note: selectedOrder.admin_note || '',
          status: selectedOrder.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save order')
      }

      setOrdersMessage(text.orderSaved)
      setSelectedOrder(data.item)
      await fetchOrders()
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to save order')
    }
  }

  async function handleDeleteOrder() {
    if (!selectedOrder) return
    if (!window.confirm(text.confirmDelete)) return

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

  async function updateStatus(status: AdminOrderStatus) {
    if (!selectedOrder) return

    setOrdersMessage('')
    setOrdersError('')

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update status')
      }

      if (status === 'completed') {
        setOrdersMessage(text.orderCompleted)
      } else if (status === 'pending_payment') {
        setOrdersMessage(text.orderRestored)
      } else if (status === 'cancelled') {
        setOrdersMessage(text.orderCancelled)
      } else {
        setOrdersMessage(text.orderSaved)
      }

      setSelectedOrder(data.item)
      await fetchOrders()
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  async function handleSaveSettings() {
    if (!settings) return

    setSavingSettings(true)
    setSettingsMessage('')
    setSettingsError('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          premium_3m_price: settings.premium_3m_price,
          premium_6m_price: settings.premium_6m_price,
          premium_12m_price: settings.premium_12m_price,
          stars_rate: settings.stars_rate,
          trc20_address: settings.trc20_address,
          base_address: settings.base_address,
        }),
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
      <div className="site-container" style={{ minWidth: 0 }}>
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
              {text.title}
            </h1>
            <p className="small-muted" style={{ marginTop: 8 }}>
              {text.subtitle}
            </p>
            <p className="small-muted" style={{ marginTop: 6 }}>
              {text.timezoneHint}
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
            <aside className="admin-side" style={{ minWidth: 0 }}>
              <div className="card-soft">
                <input
                  className="input"
                  placeholder={text.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 10 }}
                  onClick={fetchOrders}
                >
                  {ordersLoading ? text.refreshing : text.refreshNow}
                </button>

                <div style={{ marginTop: 12 }}>
                  <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'all' | AdminOrderStatus)
                    }
                  >
                    <option value="all">{text.statusAll}</option>
                    <option value="pending_payment">{text.statusPending}</option>
                    <option value="paid">{text.statusPaid}</option>
                    <option value="completed">{text.statusCompleted}</option>
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
                        minWidth: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>
                        {item.order_no}
                      </div>

                      <div className="small-muted" style={{ marginTop: 6, wordBreak: 'break-all' }}>
                        {item.email || '-'}
                      </div>

                      <div className="small-muted" style={{ marginTop: 4 }}>
                        {getProductLabel(item)}
                      </div>

                      {item.proof_image_base64 ? (
                        <img
                          src={item.proof_image_base64}
                          alt="thumb"
                          style={{
                            marginTop: 8,
                            width: 76,
                            height: 76,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid rgba(15, 23, 42, 0.08)',
                            display: 'block',
                          }}
                        />
                      ) : null}

                      {item.tx_hash ? (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: '#475569',
                            wordBreak: 'break-all',
                            overflowWrap: 'anywhere',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {item.tx_hash}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: getStatusBg(item.status),
                          color: getStatusColor(item.status),
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {getStatusLabel(item.status, text)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="admin-main" style={{ minWidth: 0 }}>
              <div className="card-soft" style={{ minWidth: 0, overflow: 'hidden' }}>
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
                  <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
                    <div style={{ wordBreak: 'break-all' }}>
                      <strong>{text.orderNo}:</strong> {selectedOrder.order_no}
                    </div>

                    <div>
                      <strong>{text.product}:</strong> {getProductLabel(selectedOrder)}
                    </div>

                    <div>
                      <strong>{text.amount}:</strong> ${selectedOrder.price_usd ?? selectedOrder.amount ?? 0}
                    </div>

                    <div>
                      <strong>{text.createdAt}:</strong> {formatBostonTime(selectedOrder.created_at)}
                    </div>

                    <div>
                      <strong>{text.updatedAt}:</strong> {formatBostonTime(selectedOrder.updated_at)}
                    </div>

                    <div>
                      <div style={{ marginBottom: 6, fontSize: 13, color: '#64748b' }}>
                        {text.status}
                      </div>
                      <div
                        style={{
                          width: '100%',
                          minHeight: 52,
                          borderRadius: 16,
                          border: '1px solid rgba(15, 23, 42, 0.1)',
                          background: getStatusBg(selectedOrder.status),
                          color: getStatusColor(selectedOrder.status),
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 16px',
                          fontWeight: 800,
                          boxSizing: 'border-box',
                        }}
                      >
                        {getStatusLabel(selectedOrder.status, text)}
                      </div>
                    </div>

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

                    <div>
                      <div style={{ marginBottom: 6, fontSize: 13, color: '#64748b' }}>
                        {text.txHash}
                      </div>
                      <textarea
                        className="textarea"
                        placeholder={text.txHash}
                        value={selectedOrder.tx_hash || ''}
                        onChange={(e) =>
                          setSelectedOrder({ ...selectedOrder, tx_hash: e.target.value })
                        }
                        style={{
                          minHeight: 96,
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere',
                          whiteSpace: 'pre-wrap',
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ marginBottom: 6, fontSize: 13, color: '#64748b' }}>
                        {text.proofImage}
                      </div>

                      {selectedOrder.proof_image_base64 ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                          <a
                            href={selectedOrder.proof_image_base64}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-block', maxWidth: '100%' }}
                          >
                            <img
                              src={selectedOrder.proof_image_base64}
                              alt="payment proof"
                              style={{
                                width: '100%',
                                maxWidth: 280,
                                borderRadius: 14,
                                border: '1px solid rgba(15, 23, 42, 0.08)',
                                display: 'block',
                              }}
                            />
                          </a>

                          <a
                            href={selectedOrder.proof_image_base64}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#0f234f',
                              fontWeight: 700,
                              textDecoration: 'none',
                              fontSize: 14,
                            }}
                          >
                            {text.openImage}
                          </a>
                        </div>
                      ) : (
                        <div className="small-muted">{text.proofMissing}</div>
                      )}
                    </div>

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

                    <div className="small-muted">{text.saveHint}</div>

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

                      <button
                        className="btn-secondary"
                        onClick={() => updateStatus('completed')}
                        disabled={selectedOrder.status === 'completed'}
                      >
                        {text.completeOrder}
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => updateStatus('pending_payment')}
                        disabled={selectedOrder.status === 'pending_payment'}
                      >
                        {text.restorePayment}
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => updateStatus('cancelled')}
                        disabled={selectedOrder.status === 'cancelled'}
                      >
                        {text.cancelOrder}
                      </button>

                      <button className="btn-secondary" onClick={handleDeleteOrder}>
                        {text.deleteOrder}
                      </button>
                    </div>
                  </div>
                )}

                {ordersMessage ? (
                  <div className="status-box-success" style={{ marginTop: 16 }}>
                    <strong>{ordersMessage}</strong>
                  </div>
                ) : null}

                {ordersError ? (
                  <div className="status-box-error" style={{ marginTop: 16 }}>
                    <strong>{ordersError}</strong>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : (
          <section className="card-soft" style={{ minWidth: 0 }}>
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

                <div className="small-muted">
                  {text.updatedAt}: {formatBostonTime(settings.updated_at)}
                </div>

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

            {settingsMessage ? (
              <div className="status-box-success" style={{ marginTop: 16 }}>
                <strong>{settingsMessage}</strong>
              </div>
            ) : null}

            {settingsError ? (
              <div className="status-box-error" style={{ marginTop: 16 }}>
                <strong>{settingsError}</strong>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  )
}
