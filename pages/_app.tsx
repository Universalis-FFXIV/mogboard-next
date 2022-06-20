import '../styles/app.scss';
import '../styles/font/styles.css';
import '../styles/font/xivicons.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import UniversalisLayout from '../components/UniversalisLayout/UniversalisLayout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <UniversalisLayout>
        <Component {...pageProps} />
      </UniversalisLayout>
    </>
  );
}

export default MyApp;
