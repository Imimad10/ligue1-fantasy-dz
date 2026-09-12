import './globals.css'
import Header from './components/Header'
import FotmobTicker from './components/FotmobTicker'

export const metadata = {
  title: 'Ligue 1 Fantasy DZ',
  description: 'Fantasy football pour la Ligue Professionnelle 1 algérienne',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <FotmobTicker />
        {children}
      </body>
    </html>
  )
}
