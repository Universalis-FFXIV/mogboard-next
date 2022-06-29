import '../styles/app.scss';
import '../styles/font/styles.css';
import '../styles/font/xivicons.css';
import 'simplebar/dist/simplebar.min.css';
import type { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import UniversalisLayout from '../components/UniversalisLayout/UniversalisLayout';
import { Cookies, CookiesProvider } from 'react-cookie';
import { SessionProvider } from 'next-auth/react';
import Highcharts from 'highcharts';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsStock from 'highcharts/modules/stock';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { en, ja, de, fr, zh } from 'make-plural/plurals';
import { messages as messagesEn } from '../i18n/en/messages';
import { messages as messagesJa } from '../i18n/ja/messages';
import { messages as messagesDe } from '../i18n/de/messages';
import { messages as messagesFr } from '../i18n/fr/messages';
import { messages as messagesZhHans } from '../i18n/zh-HANS/messages';
import App from 'next/app';
import { useState } from 'react';
import { PopupData, PopupProvider } from '../components/UniversalisLayout/components/Popup/Popup';
import {
  ModalCoverData,
  ModalCoverProvider,
} from '../components/UniversalisLayout/components/ModalCover/ModalCover';
import MogboardHighchartsTheme from '../theme/highcharts';

i18n.load({
  en: messagesEn,
  ja: messagesJa,
  de: messagesDe,
  fr: messagesFr,
  'zh-HANS': messagesZhHans,
});

i18n.loadLocaleData({
  en: { plurals: en },
  ja: { plurals: ja },
  de: { plurals: de },
  fr: { plurals: fr },
  'zh-HANS': { plurals: zh },
});

if (typeof Highcharts === 'object') {
  HighchartsAccessibility(Highcharts);
  HighchartsStock(Highcharts);
  Highcharts.setOptions(MogboardHighchartsTheme);
  Highcharts.setOptions({
    lang: {
      decimalPoint: '.',
      thousandsSep: ',',
    },
    tooltip: {
      yDecimals: 0, // If you want to add 2 decimals
    },
  } as any);
}

export default function MyApp({
  Component,
  cookies,
  pageProps: { session, ...pageProps },
}: AppProps & { cookies: Record<string, string> }) {
  i18n.activate(parseLang(new Cookies(cookies).get('mogboard_language')));
  const [popup, setPopup] = useState<PopupData>({ isOpen: false });
  const [modalCover, setModalCover] = useState<ModalCoverData>({ isOpen: false });
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={session}>
        <CookiesProvider cookies={new Cookies(cookies)}>
          <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
            <PopupProvider popup={popup} setPopup={setPopup}>
              <ModalCoverProvider modalCover={modalCover} setModalCover={setModalCover}>
                <UniversalisLayout>
                  <Component {...pageProps} />
                </UniversalisLayout>
              </ModalCoverProvider>
            </PopupProvider>
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

function parseLang(lang: any): string {
  if (typeof lang !== 'string') {
    return 'en';
  }

  if (lang === 'chs') {
    return 'zh-HANS';
  }

  return lang;
}
