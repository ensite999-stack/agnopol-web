'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

const pageTexts = {
  de: {
    checking: 'Checking session...',
    unauthorized: 'Not logged in. Redirecting...',
    logout: 'Logout',
    loggingOut: 'Logging out...',
  },
  en: {
    checking: 'Checking session...',
    unauthorized: 'Not logged in. Redirecting...',
    logout: 'Logout',
    loggingOut: 'Logging out...',
  },
  es: {
    checking: 'Comprobando sesión...',
    unauthorized: 'No has iniciado sesión. Redirigiendo...',
    logout: 'Cerrar sesión',
    loggingOut: 'Cerrando sesión...',
  },
  fr: {
    checking: 'Vérification de la session...',
    unauthorized: 'Non connecté. Redirection...',
    logout: 'Se déconnecter',
    loggingOut: 'Déconnexion...',
  },
  ja: {
    checking: 'セッションを確認中...',
    unauthorized: '未ログインです。リダイレクト中...',
    logout: 'ログアウト',
    loggingOut: 'ログアウト中...',
  },
  ko: {
    checking: '세션 확인 중...',
    unauthorized: '로그인되지 않았습니다. 이동 중...',
    logout: '로그아웃',
    loggingOut: '로그아웃 중...',
  },
  'zh-cn': {
    checking: '正在检查登录状态...',
    unauthorized: '尚未登录，正在跳转...',
    logout: '退出登录',
    loggingOut: '退出中...',
  },
  'zh-tw': {
    checking: '正在檢查登入狀態...',
    unauthorized: '尚未登入，正在跳轉...',
    logout: '登出',
    loggingOut: '登出中...',
  },
} as const

export default function AdminPage() {
  const { lang, t } = useI18n()
  const text = useMemo(() => pageTexts[lang] || pageTexts.en, [lang])

  const [status, setStatus] = useState<'checking' | 'ok' | 'unauthorized'>('checking')
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
        })
        const data = await response.json()

        if (!data?.authenticated) {
          setStatus('unauthorized')
          setTimeout(() => {
            window.location.href = `/admin/login?lang=${lang}`
          }, 500)
          return
        }

        setStatus('ok')
      } catch {
        setStatus('unauthorized')
        setTimeout(() => {
          window.location.href = `/admin/login?lang=${lang}`
        }, 500)
      }
    }

    run()
  }, [lang])

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      })
    } finally {
      window.location.href = `/admin/login?lang=${lang}`
    }
  }

  if (status === 'checking') {
    return (
      <main className="site-shell">
        <div className="site-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="card">{text.checking}</div>
        </div>
      </main>
    )
  }

  if (status === 'unauthorized') {
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

        <div className="admin-grid">
          <aside className="admin-side">
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{t.admin.orders}</div>
            </div>
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{t.admin.pricing}</div>
            </div>
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{t.admin.settings}</div>
            </div>
          </aside>

          <section className="admin-main">
            <div className="card-soft">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                <div className="card">
                  <div className="small-muted">{t.admin.pendingOrders}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>12</div>
                </div>

                <div className="card">
                  <div className="small-muted">{t.admin.totalOrders}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>248</div>
                </div>
              </div>
            </div>

            <div className="card-soft">
              <input className="input" placeholder={t.admin.searchPlaceholder} />

              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div className="card">
                  <div><strong>{t.admin.customerEmail}:</strong> demo@example.com</div>
                  <div><strong>{t.admin.telegramUsername}:</strong> @demo_user</div>
                  <div><strong>{t.admin.paymentNetwork}:</strong> TRC20 USDT</div>
                  <div><strong>{t.admin.createdAt}:</strong> 2026-03-23 15:00</div>
                  <div><strong>{t.admin.status}:</strong> pending_payment</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
