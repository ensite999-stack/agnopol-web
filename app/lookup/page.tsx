'use client'

import { Suspense, useState, type ChangeEvent, type FocusEvent } from 'react'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'
import ThemeToggle from '../../components/theme-toggle'
import { withLang } from '../../lib/i18n'

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

type LookupUi = {
  back: string
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

const LOOKUP_UI: Record<string, LookupUi> = {
  de: {
    back: 'Zurück zur Startseite',
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
    back: 'Back to home',
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
    resubmitSuccess:
      'Updated payment proof submitted successfully. Please check the order again later.',
    resubmitError: 'Failed to resubmit payment proof.',
  },
  es: {
    back: 'Volver al inicio',
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
    back: "Retour à l'accueil",
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
    back: 'ホームへ戻る',
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
    back: '홈으로 돌아가기',
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
      '새 결제 증빙이 성공적으로 제출되었습니다. 잠시 후 주문 상태를 다시 확인하세요.',
    resubmitError: '결제 증빙 재제출에 실패했습니다.',
  },
  'zh-cn': {
    back: '返回首页',
    title: '查询订单',
    subtitle: '输入下单邮箱，可查询订单状态、系统备注，并在管理员要求时重新提交付款凭证。',
    placeholder: '请输入下单邮箱',
    button: '查询订单',
    loading: '查询中...',
    orderNo: '订单号',
    email: '邮箱',
    status: '状态',
    product: '商品',
    amount: '金额',
    network: '支付网络',
    createdAt: '创建时间',
    note: '系统备注',
    txHash: '交易哈希',
    resubmit: '重新上传凭证',
    proofReady: '新的凭证已准备：',
    hashPlaceholder: '重新填写交易哈希（可选）',
    resubmitButton: '提交新的凭证',
    resubmitting: '提交中...',
    noOrders: '未找到相关订单。',
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    resubmitSuccess: '新的付款凭证已成功提交，请稍后再次查询订单状态。',
    resubmitError: '重新提交付款凭证失败。',
  },
  'zh-tw': {
    back: '返回首頁',
    title: '查詢訂單',
    subtitle: '輸入下單電子郵件，可查詢訂單狀態、系統備註，並在管理員要求時重新提交付款憑證。',
    placeholder: '請輸入下單電子郵件',
    button: '查詢訂單',
    loading: '查詢中...',
    orderNo: '訂單號',
    email: '電子郵件',
    status: '狀態',
    product: '商品',
    amount: '金額',
    network: '支付網路',
    createdAt: '建立時間',
    note: '系統備註',
    txHash: '交易雜湊',
    resubmit: '重新上傳憑證',
    proofReady: '新的憑證已準備：',
    hashPlaceholder: '重新填寫交易雜湊（可選）',
    resubmitButton: '提交新的憑證',
    resubmitting: '提交中...',
    noOrders: '未找到相關訂單。',
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    resubmitSuccess: '新的付款憑證已成功提交，請稍後再次查詢訂單狀態。',
    resubmitError: '重新提交付款憑證失敗。',
  },
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

function LookupPageInner() {
  const { lang, t } = useI18n()
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

  const startYear = 2026
  const currentYear = new Date().getFullYear()
  const copyrightText =
    currentYear > startYear
      ? `© ${startYear}–${currentYear} Agnopol. All rights reserved.`
      : `© ${startYear} Agnopol. All rights reserved.`

  function handleFieldFocus(event: FocusEvent<HTMLInputElement>) {
    scheduleFieldIntoView(event.currentTarget)
  }

  function getProductLabel(item: OrderResult) {
    const productType = String(item.product_type || '').toLowerCase()

    if (productType.includes('premium')) {
      const durationText =
        item.duration === '3m'
          ? t.home.months3
          : item.duration === '6m'
            ? t.home.months6
            : item.duration === '12m'
              ? t.home.months12
              : item.duration || ''

      return `${t.home.tgPremium}${durationText ? ` ${durationText}` : ''}`
    }

    if (productType.includes('stars')) {
      const amount = Number(item.stars_amount || item.amount || 0)
      return `${t.home.tgStars} ${amount || ''}`.trim()
    }

    return item.product_type || '-'
  }

  function getStatusLabel(status: string) {
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
      setResubmitProofBase64(reader.result as string)
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
    <main className="site-shell lookup-page-shell">
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

        <div className="lookup-back-wrap">
          <a href={withLang('/', lang)} className="back-link back-link-pill">
            <span className="back-link-arrow">←</span>
            <span>{ui.back}</span>
          </a>
        </div>

        <section className="lookup-main-card card-soft">
          <div className="lookup-title">{ui.title}</div>
          <div className="small-muted lookup-subtitle">{ui.subtitle}</div>

          <div className="lookup-form">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleFieldFocus}
              placeholder={ui.placeholder}
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            <button onClick={handleLookup} className="btn-primary lookup-btn" type="button">
              {loading ? ui.loading : ui.button}
            </button>
          </div>

          {errorText ? <div className="status-box-error">{errorText}</div> : null}
          {resubmitMessage ? <div className="status-box-success">{resubmitMessage}</div> : null}
          {resubmitError ? <div className="status-box-error">{resubmitError}</div> : null}

          {results.length > 0 ? (
            <div className="lookup-result-grid">
              {results.map((item) => {
                const allowResubmit =
                  Boolean(item.public_note) &&
                  String(item.status || '').toLowerCase() !== 'completed'

                return (
                  <div key={item.order_no} className="lookup-item-card">
                    <div>
                      <strong>{ui.orderNo}:</strong> {item.order_no}
                    </div>
                    <div>
                      <strong>{ui.email}:</strong> {email}
                    </div>
                    <div>
                      <strong>{ui.status}:</strong> {getStatusLabel(item.status)}
                    </div>
                    <div>
                      <strong>{ui.product}:</strong> {getProductLabel(item)}
                    </div>
                    <div>
                      <strong>{ui.amount}:</strong> ${item.price_usd ?? item.amount ?? 0}
                    </div>
                    <div>
                      <strong>{ui.network}:</strong> {item.payment_network || '-'}
                    </div>
                    <div>
                      <strong>{ui.createdAt}:</strong> {formatBostonTime(item.created_at)}
                    </div>

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
                              onFocus={handleFieldFocus}
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

        <footer className="footer">
          <p>{copyrightText}</p>

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
        .lookup-page-shell {
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

        .card-soft {
          border-radius: 28px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          backdrop-filter: blur(14px);
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

        .lookup-back-wrap {
          max-width: 700px;
          margin: 0 auto 16px;
        }

        .back-link {
          color: var(--text-main, #0a1736);
          text-decoration: none;
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
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

        .lookup-main-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
        }

        .lookup-title {
          font-size: clamp(26px, 4.8vw, 34px);
          font-weight: 900;
          color: var(--text-main, #0a1736);
        }

        .lookup-subtitle {
          margin-top: 8px;
          margin-bottom: 16px;
          color: var(--text-soft, #7b8798);
          line-height: 1.7;
        }

        .lookup-form {
          display: grid;
          gap: 10px;
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
        }

        .input::placeholder {
          color: var(--text-soft, #7b8798);
        }

        .btn-primary,
        .btn-secondary {
          appearance: none;
          width: 100%;
          border: 0;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            opacity 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .btn-primary:hover,
        .btn-secondary:hover {
          transform: translateY(-1px);
        }

        .btn-primary {
          min-height: 52px;
          border-radius: 18px;
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
          font-size: 15px;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(11, 37, 112, 0.2);
        }

        .btn-secondary {
          min-height: 46px;
          border-radius: 16px;
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          color: var(--text-main, #0a1736);
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          font-size: 14px;
          font-weight: 800;
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
        }

        .lookup-btn {
          margin-top: 2px;
        }

        .small-muted {
          font-size: 13px;
          line-height: 1.55;
        }

        .status-box-error,
        .status-box-success {
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 14px;
          line-height: 1.6;
          margin-top: 10px;
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

        .lookup-result-grid {
          display: grid;
          gap: 12px;
          margin-top: 14px;
        }

        .lookup-item-card {
          border-radius: 20px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          padding: 16px;
          display: grid;
          gap: 8px;
          color: var(--text-main, #0a1736);
        }

        .lookup-note-box {
          border-radius: 14px;
          padding: 12px;
          background: rgba(82, 110, 255, 0.08);
          border: 1px solid rgba(82, 110, 255, 0.14);
          color: var(--text-main, #0a1736);
          line-height: 1.6;
        }

        .lookup-resubmit-box {
          display: grid;
          gap: 10px;
          padding-top: 4px;
        }

        .lookup-break-all {
          word-break: break-all;
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

        @media (max-width: 640px) {
          .lookup-page-shell {
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

          .lookup-main-card {
            padding: 16px;
          }

          .footer-links {
            gap: 10px 14px;
          }
        }

        @media (max-width: 420px) {
          .lookup-page-shell {
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

export default function LookupPage() {
  return (
    <Suspense fallback={null}>
      <LookupPageInner />
    </Suspense>
  )
}
