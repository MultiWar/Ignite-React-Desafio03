import { AppProps } from 'next/app';
import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div className='container'>
      <Header />
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp;
