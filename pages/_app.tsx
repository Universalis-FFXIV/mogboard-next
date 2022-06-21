import '../styles/app.scss';
import '../styles/font/styles.css';
import '../styles/font/xivicons.css';
import 'simplebar/dist/simplebar.min.css';
import type { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import UniversalisLayout from '../components/UniversalisLayout/UniversalisLayout';
import { Cookies, CookiesProvider } from 'react-cookie';
import App from 'next/app';

function MyApp({ Component, pageProps, cookies }: AppProps & { cookies: Record<string, string> }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CookiesProvider cookies={typeof window !== 'undefined' ? undefined : new Cookies(cookies)}>
        <UniversalisLayout>
          <Component {...pageProps} />
        </UniversalisLayout>
      </CookiesProvider>
    </>
  );
}

export async function getInitialProps(appCtx: AppContext) {
  const appProps = await App.getInitialProps(appCtx);
  return { ...appProps, cookies: appCtx.ctx.req?.headers?.cookie };
}

export default MyApp;
