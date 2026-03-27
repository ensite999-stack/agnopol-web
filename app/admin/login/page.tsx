'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../../components/language-provider'
import LanguageSwitcher from '../../../components/language-switcher'
import ThemeToggle from '../../../components/theme-toggle'

const loginTexts = {
  de: {
    title: 'Admin Login',
    subtitle: 'Geben Sie das konfigurierte Passwort ein, um das Admin-Panel zu öffnen.',
    password: 'Passwort',
    button: 'Anmelden',
    loading: 'Anmeldung läuft...',
    invalid: 'Falsches Passwort.',
    server: 'Anmeldung fehlgeschlagen.',
    back: 'Zurück zur Startseite',
  },
  en: {
    title: 'Admin Login',
    subtitle: 'Enter the configured password to access the admin panel.',
    password: 'Password',
    button: 'Login',
    loading: 'Signing in...',
    invalid: 'Invalid password.',
    server: 'Login failed.',
    back: 'Back to Home',
  },
  es: {
    title: 'Inicio de sesión de administrador',
    subtitle: 'Introduce la contraseña configurada para acceder al panel de administración.',
    password: 'Contraseña',
    button: 'Iniciar sesión',
    loading: 'Iniciando sesión...',
    invalid: 'Contraseña incorrecta.',
    server: 'Error al iniciar sesión.',
    back: 'Volver al inicio',
  },
  fr: {
    title: 'Connexion administrateur',
    subtitle: 'Entrez le mot de passe configuré pour accéder au panneau d’administration.',
    password: 'Mot de passe',
    button: 'Se connecter',
    loading: 'Connexion...',
    invalid: 'Mot de passe incorrect.',
    server: 'Échec de la connexion.',
    back: 'Retour à l’accueil',
  },
  ja: {
    title: '管理ログイン',
    subtitle: '管理パネルに入るには設定済みのパスワードを入力してください。',
    password: 'パスワード',
    button: 'ログイン',
    loading: 'ログイン中...',
    invalid: 'パスワードが正しくありません。',
    server: 'ログインに失敗しました。',
    back: 'ホームへ戻る',
  },
  ko: {
    title: '관리자 로그인',
    subtitle: '관리자 패널에 들어가려면 설정된 비밀번호를 입력하세요.',
    password: '비밀번호',
    button: '로그인',
    loading: '로그인 중...',
    invalid: '비밀번호가 올바르지 않습니다.',
    server: '로그인에 실패했습니다.',
    back: '홈으로 돌아가기',
  },
  'zh-cn': {
    title: '后台登录',
    subtitle: '请输入已设置的后台密码以进入管理面板。',
    password: '密码',
    button: '登录',
    loading: '登录中...',
    invalid: '密码错误。',
    server: '登录失败。',
    back: '返回首页',
  },
  'zh-tw': {
    title: '後台登入',
    subtitle: '請輸入已設定的後台密碼以進入管理面板。',
    password: '密碼',
    button: '登入',
    loading: '登入中...',
    invalid: '密碼錯誤。',
    server: '登入失敗。',
    back: '返回首頁',
  },
} as const

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  )
}

function AdminLoginInner() {
  const { lang, t } = useI18n()
  const text = useMemo(() => loginTexts[lang as keyof typeof loginTexts] || loginTexts.en, [lang])

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const data = await response.json()

        if (!active) return

        if (response.ok && data?.authenticated) {
          window.location.href = `/admin?lang=${lang}`
        }
      } catch {
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [lang])

  async function handleLogin() {
    if (submitting) return

    setSubmitting(true)
    setErrorText('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok || !data?.authenticated) {
        if (response.status === 401) {
          throw new Error(text.invalid)
        }
        throw new Error(data?.error || text.server)
      }

      window.location.href = `/admin?lang=${lang}`
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : text.server)
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <main className="site-shell">
      <div className="site-container login-container">
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

        <a href={`/?lang=${lang}`} className="back-link">
          ← {text.back}
        </a>

        <section className="card-soft login-card">
          <div className="login-copy">
            <h2 className="login-title">{text.title}</h2>
            <p className="login-subtitle">{text.subtitle}</p>
          </div>

          <div className="login-form">
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorText) setErrorText('')
              }}
              onKeyDown={handleKeyDown}
              placeholder={text.password}
              autoComplete="current-password"
            />

            {errorText ? <div className="status-box-error">{errorText}</div> : null}

            <button
              type="button"
              className="btn-primary"
              onClick={handleLogin}
              disabled={submitting}
              style={{ opacity: submitting ? 0.8 : 1 }}
            >
              {submitting ? text.loading : text.button}
            </button>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .site-shell {
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

        .login-container {
          display: grid;
          gap: 16px;
        }

        .card-soft {
          border-radius: 28px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          backdrop-filter: blur(14px);
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
          transition: border-color 0.16s ease, box-shadow 0.16s ease;
        }

        .input:focus {
          border-color: rgba(245, 158, 11, 0.9);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
        }

        .input::placeholder {
          color: var(--text-soft, #7b8798);
        }

        .btn-primary {
          appearance: none;
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          border: 0;
          cursor: pointer;
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
          font-size: 15px;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(11, 37, 112, 0.2);
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            opacity 0.16s ease,
            background 0.16s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
        }

        .status-box-error {
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 14px;
          line-height: 1.6;
          background: rgba(220, 53, 69, 0.08);
          border: 1px solid rgba(220, 53, 69, 0.18);
          color: #b42318;
        }

        .hero-center {
          text-align: center;
          margin-bottom: 0;
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

        .back-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          color: var(--text-main, #0a1736);
          font-size: 14px;
          font-weight: 700;
          width: fit-content;
        }

        .login-card {
          padding: 22px;
          display: grid;
          gap: 18px;
        }

        .login-copy {
          display: grid;
          gap: 8px;
        }

        .login-title {
          margin: 0;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 900;
          color: var(--text-strong, #08142f);
        }

        .login-subtitle {
          margin: 0;
          color: var(--text-soft, #7b8798);
          font-size: 14px;
          line-height: 1.7;
        }

        .login-form {
          display: grid;
          gap: 12px;
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
          .site-shell {
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

          .login-card {
            padding: 18px;
          }
        }

        @media (max-width: 420px) {
          .site-shell {
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
