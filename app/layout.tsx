import './globals.css'
import { LanguageProvider } from '@/components/language-provider'

export const metadata = {
  title: 'Agnopol',
  description: 'One world, one breath.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
