'use client'

import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

export default function AdminPage() {
  const { t } = useI18n()

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

          <LanguageSwitcher />
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
                  <div><strong>{t.admin.status}:</strong> pending</div>
                </div>
              </div>

              <button className="btn-primary" style={{ marginTop: 14 }}>
                {t.admin.save}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
