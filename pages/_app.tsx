import '../styles/app.scss';
import '../styles/font/styles.css';
import '../styles/font/xivicons.css';
import 'simplebar/dist/simplebar.min.css';
import type { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import UniversalisLayout from '../components/UniversalisLayout/UniversalisLayout';
import { Cookies, CookiesProvider } from 'react-cookie';
import { SessionProvider } from 'next-auth/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { messages as messagesEn } from '../i18n/en/messages';
import { messages as messagesJa } from '../i18n/ja/messages';
import { messages as messagesDe } from '../i18n/de/messages';
import { messages as messagesFr } from '../i18n/fr/messages';
import { messages as messagesZhHans } from '../i18n/zh-HANS/messages';
import App from 'next/app';

i18n.load({
  en: messagesEn,
  ja: messagesJa,
  de: messagesDe,
  fr: messagesFr,
  'zh-HANS': messagesZhHans,
});
i18n.activate('en');

export default function MyApp({
  Component,
  cookies,
  pageProps: { session, ...pageProps },
}: AppProps & { cookies: Record<string, string> }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={session}>
        <CookiesProvider cookies={typeof window !== 'undefined' ? undefined : new Cookies(cookies)}>
          <I18nProvider i18n={i18n}>
            <UniversalisLayout>
              <Component {...pageProps} />
            </UniversalisLayout>
          </I18nProvider>
        </CookiesProvider>
      </SessionProvider>
    </>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const appProps = await App.getInitialProps(appCtx);
  return { ...appProps, cookies: appCtx.ctx.req?.headers?.cookie };
};
