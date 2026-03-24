'use client'

import { Suspense, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useI18n } from '../components/language-provider'
import LanguageSwitcher from '../components/language-switcher'
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

const defaultConfig: PublicConfig = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  trc20_address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  base_address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
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

function buildLookupUi(lang: string) {
  if (lang === 'de') {
    return {
      title: 'Bestellabfrage',
      subtitle:
        'Geben Sie Ihre Bestell-E-Mail ein, um den Status, Systemhinweise und gegebenenfalls neue Zahlungsnachweise gemäß Admin-Hinweis einzureichen.',
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
    }
  }

  if (lang === 'es') {
    return {
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
    }
  }

  if (lang === 'fr') {
    return {
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
    }
  }

  if (lang === 'ja') {
    return {
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
    }
  }

  if (lang === 'ko') {
    return {
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
    }
  }

  if (lang === 'zh-cn') {
    return {
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
    }
  }

  if (lang === 'zh-tw') {
    return {
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
    }
  }

  return {
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
  }
}

function OrderLookupSection() {
  const { t, lang } = useI18n()
  const ui = useMemo(() => buildLookupUi(lang), [lang])

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
        body: JSON.stringify({
          email: email.trim(),
        }),
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

  function handleOpenResubmit(orderNo: string) {
    setActiveOrderNo(orderNo)
    setResubmitHash('')
    setResubmitProofName('')
    setResubmitProofBase64('')
    setResubmitMessage('')
    setResubmitError('')
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
    <section
      className="card-soft"
      style={{
        maxWidth: 760,
        margin: '0 auto',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(18px, 2.2vw, 22px)',
          fontWeight: 800,
          color: '#111827',
          marginBottom: 6,
        }}
      >
        {ui.title}
      </div>

      <div className="small-muted" style={{ marginBottom: 12 }}>
        {ui.subtitle}
      </div>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={ui.placeholder}
        className="input"
        style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
      />

      <button onClick={handleLookup} className="btn-primary" style={{ marginTop: 12, width: '100%' }}>
        {loading ? ui.loading : ui.button}
      </button>

      {errorText ? <div className="status-box-error">{errorText}</div> : null}
      {resubmitMessage ? <div className="status-box-success">{resubmitMessage}</div> : null}
      {resubmitError ? <div className="status-box-error">{resubmitError}</div> : null}

      {results.length > 0 ? (
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          {results.map((item) => {
            const allowResubmit =
              Boolean(item.public_note) && String(item.status || '').toLowerCase() !== 'completed'

            return (
              <div
                key={item.order_no}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: 'rgba(15, 23, 42, 0.035)',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  display: 'grid',
                  gap: 8,
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <div style={{ wordBreak: 'break-word' }}>
                  <strong>{ui.orderNo}:</strong> {item.order_no}
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  <strong>{ui.email}:</strong> {email}
                </div>
                <div>
                  <strong>{ui.status}:</strong> {getStatusLabel(item.status)}
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  <strong>{ui.product}:</strong> {getProductLabel(item)}
                </div>
                <div>
                  <strong>{ui.amount}:</strong> ${item.price_usd ?? item.amount ?? 0}
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  <strong>{ui.network}:</strong> {item.payment_network || '-'}
                </div>
                <div style={{ wordBreak: 'break-word' }}>
                  <strong>{ui.createdAt}:</strong> {formatBostonTime(item.created_at)}
                </div>

                {item.tx_hash ? (
                  <div
                    style={{
                      wordBreak: 'break-all',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'pre-wrap',
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    <strong>{ui.txHash}:</strong> {item.tx_hash}
                  </div>
                ) : null}

                {item.public_note ? (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(255, 236, 179, 0.45)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#7c2d12',
                      lineHeight: 1.7,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>{ui.note}:</strong> {item.public_note}
                  </div>
                ) : null}

                {allowResubmit ? (
                  <>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleOpenResubmit(item.order_no)}
                      style={{ width: '100%' }}
                    >
                      {ui.resubmit}
                    </button>

                    {activeOrderNo === item.order_no ? (
                      <div
                        style={{
                          marginTop: 6,
                          padding: 12,
                          borderRadius: 14,
                          border: '1px dashed rgba(15, 23, 42, 0.18)',
                          background: 'rgba(255,255,255,0.75)',
                          display: 'grid',
                          gap: 10,
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleResubmitFileChange}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                            maxWidth: '100%',
                          }}
                        />

                        {resubmitProofName ? (
                          <div
                            className="small-muted"
                            style={{
                              width: '100%',
                              minWidth: 0,
                              wordBreak: 'break-all',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {ui.proofReady} {resubmitProofName}
                          </div>
                        ) : null}

                        <input
                          value={resubmitHash}
                          onChange={(e) => setResubmitHash(e.target.value)}
                          placeholder={ui.hashPlaceholder}
                          className="input"
                          style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                        />

                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleResubmit(item.order_no)}
                          style={{ width: '100%' }}
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
  const [tab, setTab] = useState<ProductType>('premium')
  const [duration, setDuration] = useState<DurationType>('12m')
  const [stars, setStars] = useState(50)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
  const [configLoading, setConfigLoading] = useState(true)

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
    const params = new URLSearchParams()
    params.set('lang', lang)
    params.set('username', username.trim())
    params.set('email', email.trim())
    params.set('price_usd', String(selectedPrice))

    if (tab === 'premium') {
      params.set('product_type', 'tg_premium')
      params.set('duration', duration)
    } else {
      params.set('product_type', 'tg_stars')
      params.set('stars_amount', String(safeStars))
    }

    window.location.href = `/pay?${params.toString()}`
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <section className="hero-center">
          <h1 className="brand-title">{t.common.brand}</h1>
          <p className="brand-slogan">{t.common.slogan}</p>
          <LanguageSwitcher />
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

        {configError ? (
          <div className="status-box-error" style={{ maxWidth: 760, margin: '0 auto 14px' }}>
            {configError}
          </div>
        ) : null}

        {tab === 'premium' ? (
          <>
            <p className="section-caption">{t.home.premiumPlans}</p>

            <div className="plan-grid">
              <div
                className={`card plan-card ${duration === '3m' ? 'active' : ''}`}
                onClick={() => setDuration('3m')}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.home.months3}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${Number(config.premium_3m_price)}
                </div>
              </div>

              <div
                className={`card plan-card ${duration === '6m' ? 'active' : ''}`}
                onClick={() => setDuration('6m')}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.home.months6}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${Number(config.premium_6m_price)}
                </div>
              </div>

              <div
                className={`card plan-card ${duration === '12m' ? 'active' : ''}`}
                onClick={() => setDuration('12m')}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.home.months12}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${Number(config.premium_12m_price)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="section-caption">{t.home.starsPackage}</p>

            <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: '#111827' }}>
                {t.home.starsAmount}
              </div>

              <input
                type="number"
                min={50}
                step={1}
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                placeholder={t.home.starsPlaceholder}
                className="input"
              />

              <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
                {t.home.starsMinHint}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>
                {t.home.autoPriceHint}
              </div>
            </div>
          </>
        )}

        <div className="summary-box card-soft">
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            {t.home.currentSelection}
          </div>

          <div
            style={{
              fontSize: 'clamp(19px, 3vw, 26px)',
              fontWeight: 800,
              color: '#111827',
            }}
          >
            {selectedTitle}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1,
            }}
          >
            ${selectedPrice}
          </div>

          {configLoading ? (
            <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
              {t.common.loading}
            </div>
          ) : null}
        </div>

        <div className="form-stack">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.home.usernamePlaceholder}
            className="input"
            style={{ marginTop: 18 }}
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.home.emailPlaceholder}
            className="input"
            style={{ marginTop: 14 }}
          />

          <button onClick={goPay} className="btn-primary" style={{ marginTop: 16 }}>
            {t.home.createOrder}
          </button>
        </div>

        <div style={{ marginTop: 28 }}>
          <OrderLookupSection />
        </div>

        <footer className="footer">
          <p>{copyrightText}</p>

          <p style={{ marginTop: 4 }}>
            <span style={{ marginRight: 6 }}>{t.common.officialEmail}:</span>
            <a href="mailto:hello@agnopol.com">hello@agnopol.com</a>
          </p>

          <div className="footer-links">
            <a href={withLang('/legal#terms', lang)}>{t.common.footerTerms}</a>
            <a href={withLang('/legal#privacy', lang)}>{t.common.footerPrivacy}</a>
            <a href={withLang('/legal#risk', lang)}>{t.common.footerRisk}</a>
          </div>
        </footer>
      </div>
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
