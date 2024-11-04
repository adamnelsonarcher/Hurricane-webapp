import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'rc-slider/assets/index.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
} 