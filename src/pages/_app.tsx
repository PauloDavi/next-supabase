import { AppProps } from 'next/app'

import { AuthContextProvider } from '../contexts/AuthContext'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <Component className="h-full" {...pageProps} />
    </AuthContextProvider>
  )
}

export default MyApp
