export const metadata = {
  title: 'Agnopol',
  description: 'Agnopol web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
