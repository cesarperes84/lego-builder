import "./globals.css"

export const metadata = {
  title: "LEGO Builder",
  description: "Interactive LEGO builder MVP",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
