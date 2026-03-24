'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/language-provider'
import LanguageSwitcher from '@/components/language-switcher'

const API = {
  session: '/api/admin/session',
  orders: '/api/admin/orders',
  saveOrder: '/api/admin/save-order',
  orderAction: '/api/admin/order-action',
  deleteOrder: '/api/admin/delete-order',
  siteConfig: '/api/admin/site-config',
  logout: '/api/admin/logout',
}

type AdminTab = 'orders' | 'pricing' | 'payment'

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

function buildText(lang: string) {
  if (lang === 'zh-tw') {
    return {
      title: '後台管理',
      subtitle: '訂單管理、價格配置與收款地址管理',
      checking: '檢查登入狀態中...',
      redirecting: '尚未登入，正在跳轉...',
      tabs: {
        orders: '訂單管理',
        pricing: '價格與地址',
        payment: '收款地址',
      },
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
      paymentTitle: '收款地址',
      trc20: 'TRC20 USDT 地址',
      base: 'Base USDC 地址',
      saveConfig: '保存設定',
      configSaving: '保存中...',
      actionSuccess: '操作成功',
      saveSuccess: '保存成功',
      configSaveSuccess: '站點設定已保存',
      loadFailed: '讀取失敗',
      actionFailed: '操作失敗',
      statusLabel: '狀態',
      allTimeBoston: '所有時間均按美國波士頓時區顯示。',
    }
  }

  if (lang === 'zh-cn') {
    return {
      title: '后台管理',
      subtitle: '订单管理、价格配置与收款地址管理',
      checking: '检查登录状态中...',
      redirecting: '尚未登录，正在跳转...',
      tabs: {
        orders: '订单管理',
        pricing: '价格与地址',
        payment: '收款地址',
      },
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
      paymentTitle: '收款地址',
      trc20: 'TRC20 USDT 地址',
      base: 'Base USDC 地址',
      saveConfig: '保存设置',
      configSaving: '保存中...',
      actionSuccess: '操作成功',
      saveSuccess: '保存成功',
      configSaveSuccess: '站点设置已保存',
      loadFailed: '读取失败',
      actionFailed: '操作失败',
      statusLabel: '状态',
      allTimeBoston: '所有时间均按美国波士顿时区显示。',
    }
  }

  return {
    title: 'Admin Console',
    subtitle: 'Order management, pricing settings and payment address management',
    checking: 'Checking session...',
    redirecting: 'Not logged in. Redirecting...',
    tabs: {
      orders: 'Orders',
      pricing: 'Pricing & Address',
      payment: 'Payment Address',
    },
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
    paymentTitle: 'Payment Address',
    trc20: 'TRC20 USDT Address',
    base: 'Base USDC Address',
    saveConfig: 'Save Settings',
    configSaving: 'Saving...',
    actionSuccess: 'Action completed',
    saveSuccess: 'Saved successfully',
    configSaveSuccess: 'Site settings saved',
    loadFailed: 'Failed to load data',
    actionFailed: 'Action failed',
    statusLabel: 'Status',
    allTimeBoston: 'All times are displayed in the Boston, US time zone.',
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
      const res = await fetch(API.siteConfig, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await res.json()
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
        if (search.trim()) params.set('search', search.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)

        const res = await fetch(`${API.orders}?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        const data = await res.json()
        if (res.status === 401) {
          router.replace(`/admin/login?lang=${lang}`)
          return
        }
        if (!res.ok) throw new Error(data?.error || text.loadFailed)

        const nextOrders: OrderItem[] = Array.isArray(data?.orders) ? data.orders : []
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
        if (res.status === 401) {
          router.replace(`/admin/login?lang=${lang}`)
          return
        }
        if (!res.ok) throw new Error(text.redirecting)
        if (!active) return
        setAuthChecking(false)
      } catch {
        router.replace(`/admin/login?lang=${lang}`)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [lang, router, text.redirecting])

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

      const res = await fetch(API.saveOrder, {
        method: 'POST',
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
      const data = await res.json()
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

    const endpoint = kind === 'delete' ? API.deleteOrder : API.orderAction

    try {
      setActionLoading(kind)
      setMessage('')
      setError('')

      const payload =
        kind === 'delete'
          ? { order_no: selectedOrder.order_no }
          : {
              order_no: selectedOrder.order_no,
              action:
                kind === 'complete'
                  ? 'completed'
                  : kind === 'restore'
                    ? 'restore_paid'
                    : 'cancelled',
            }

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
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

      const res = await fetch(API.siteConfig, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig),
      })
      const data = await res.json()
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
            <LanguageSwitcher />
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
            className={`tab-btn ${tab === 'pricing' || tab === 'payment' ? 'active' : ''}`}
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
              <h2 className="section-title">编辑订单</h2>

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

        {tab === 'pricing' || tab === 'payment' ? (
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
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
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
    min-width: 168px;
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
