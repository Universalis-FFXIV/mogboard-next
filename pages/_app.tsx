import '../styles/app.scss';
import '../styles/font/styles.css';
import '../styles/font/xivicons.css';
import 'simplebar/dist/simplebar.min.css';
import ProgressBar from '@badrap/bar-of-progress';
import type { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import UniversalisLayout from '../components/UniversalisLayout/UniversalisLayout';
import { Cookies, CookiesProvider } from 'react-cookie';
import { SessionProvider } from 'next-auth/react';
import Highcharts from 'highcharts';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsStock from 'highcharts/modules/stock';
import HighchartsHistogram from 'highcharts/modules/histogram-bellcurve';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { en, ja, de, fr, zh, ko } from 'make-plural/plurals';
import { messages as messagesEn } from '../i18n/en/messages';
import { messages as messagesJa } from '../i18n/ja/messages';
import { messages as messagesDe } from '../i18n/de/messages';
import { messages as messagesFr } from '../i18n/fr/messages';
import { messages as messagesZhHans } from '../i18n/zh-HANS/messages';
import { messages as messagesKo } from '../i18n/ko/messages';
import App from 'next/app';
import { useEffect, useState } from 'react';
import { PopupData, PopupProvider } from '../components/UniversalisLayout/components/Popup/Popup';
import {
  ModalCoverData,
  ModalCoverProvider,
} from '../components/UniversalisLayout/components/ModalCover/ModalCover';
import MogboardHighchartsTheme from '../theme/highcharts';

function parseLang(lang: any): 'ja' | 'en' | 'de' | 'fr' | 'zh-HANS' | 'ko' {
  if (lang === 'chs') {
    return 'zh-HANS';
  }

  if (lang === 'ja') {
    return 'ja';
  } else if (lang === 'fr') {
    return 'fr';
  } else if (lang === 'de') {
    return 'de';
  } else if (lang === 'ko') {
    return 'ko';
  } else {
    return 'en';
  }
}

i18n.load({
  en: messagesEn,
  ja: messagesJa,
  de: messagesDe,
  fr: messagesFr,
  'zh-HANS': messagesZhHans,
  ko: messagesKo,
});

i18n.loadLocaleData({
  en: { plurals: en },
  ja: { plurals: ja },
  de: { plurals: de },
  fr: { plurals: fr },
  'zh-HANS': { plurals: zh },
  ko: { plurals: ko },
});

// This needs to be here so that it runs on the server
i18n.activate('en');

if (typeof Highcharts === 'object') {
  HighchartsAccessibility(Highcharts);
  HighchartsStock(Highcharts);
  HighchartsHistogram(Highcharts);
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

const progress = new ProgressBar({
  size: 2,
  color: '#fff8ac',
  className: 'mog-progress',
  delay: 100,
});

export default function MyApp({
  Component,
  cookies,
  pageProps,
}: AppProps & { cookies: Record<string, string> }) {
  const cookiesObj = new Cookies(cookies);

  const lang = parseLang(cookiesObj.get('mogboard_language'));
  useEffect(() => {
    // This only runs on the client
    i18n.activate(lang);
  }, [lang]);

  const router = useRouter();
  useEffect(() => {
    router.events.on('routeChangeStart', progress.start);
    router.events.on('routeChangeComplete', progress.finish);
    router.events.on('routeChangeError', progress.finish);

    return () => {
      router.events.off('routeChangeStart', progress.start);
      router.events.off('routeChangeComplete', progress.finish);
      router.events.off('routeChangeError', progress.finish);
    };
  }, [router]);

  const [popup, setPopup] = useState<PopupData>({ isOpen: false });
  const [modalCover, setModalCover] = useState<ModalCoverData>({ isOpen: false });
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider>
        <CookiesProvider cookies={cookiesObj}>
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
