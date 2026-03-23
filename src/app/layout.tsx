export const metadata = {
  title: 'SICO Newsletters',
  description: 'Archive of SICO newsletters',
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
