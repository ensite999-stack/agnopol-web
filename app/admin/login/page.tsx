'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../../components/language-provider'
import LanguageSwitcher from '../../../components/language-switcher'

const loginTexts = {
  de: {
    title: 'Admin Login',
    subtitle: 'Enter the configured password to access the admin panel.',
    password: 'Password',
    button: 'Login',
    loading: 'Signing in...',
    invalid: 'Invalid password.',
    server: 'Login failed.',
    back: 'Back to Home',
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
    subtitle: 'Introduce la contraseña configurada para acceder al panel.',
    password: 'Contraseña',
    button: 'Iniciar sesión',
    loading: 'Iniciando...',
    invalid: 'Contraseña no válida.',
    server: 'Error de inicio de sesión.',
    back: 'Volver al inicio',
  },
  fr: {
    title: 'Connexion administrateur',
    subtitle: 'Entrez le mot de passe configuré pour accéder au panneau.',
    password: 'Mot de passe',
    button: 'Se connecter',
    loading: 'Connexion...',
    invalid: 'Mot de passe invalide.',
    server: 'Échec de la connexion.',
    back: 'Retour à l’accueil',
  },
  ja: {
    title: '管理ログイン',
    subtitle: '管理画面に入るには設定済みのパスワードを入力してください。',
    password: 'パスワード',
    button: 'ログイン',
    loading: 'ログイン中...',
    invalid: 'パスワードが正しくありません。',
    server: 'ログインに失敗しました。',
    back: 'ホームへ戻る',
  },
  ko: {
    title: '관리자 로그인',
    subtitle: '관리자 패널에 접근하려면 설정된 비밀번호를 입력하세요.',
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

function AdminLoginPageInner() {
  const { lang } = useI18n()
  const text = useMemo(() => loginTexts[lang as keyof typeof loginTexts] || loginTexts.en, [lang])

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
          credentials: 'include',
        })
        const data = await response.json()

        if (data?.authenticated) {
          window.location.href = `/admin?lang=${lang}`
        }
      } catch {
        // ignore
      }
    }

    run()
  }, [lang])

  async function handleLogin() {
    setSubmitting(true)
    setErrorText('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
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

  return (
    <main className="site-shell">
      <div className="site-container" style={{ maxWidth: 520 }}>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <a
            href={`/?lang=${lang}`}
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontSize: 14,
            }}
          >
            ← {text.back}
          </a>

          <LanguageSwitcher />
        </div>

        <section className="card-soft">
          <div className="hero-center" style={{ marginBottom: 18 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(28px, 5vw, 42px)',
                fontWeight: 900,
                color: '#0f172a',
              }}
            >
              {text.title}
            </h1>

            <p className="small-muted" style={{ marginTop: 10 }}>
              {text.subtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <input
              type="password"
              className="input"
              placeholder={text.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitting) {
                  handleLogin()
                }
              }}
            />

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

          {errorText ? <div className="status-box-error">{errorText}</div> : null}
        </section>
      </div>
    </main>
  )
}

function PageFallback() {
  return (
    <main className="site-shell">
      <div className="site-container" style={{ maxWidth: 520 }}>
        <section className="card-soft">
          <div className="hero-center">
            <p className="small-muted" style={{ margin: 0 }}>
              Loading...
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminLoginPageInner />
    </Suspense>
  )
}
