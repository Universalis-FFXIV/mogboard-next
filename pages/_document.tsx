import { Html, Head, Main, NextScript } from 'next/document';

const isDev = process.env['APP_ENV'] !== 'prod';

const MogboardDocument = () => {
  return (
    <Html>
      <Head>
        <meta charSet="UTF-8" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://universalis.app" />
        <meta property="og:image" content="https://universalis.app/i/universalis/universalis.png" />
        <meta name="keywords" content="Universalis,FFXIV,Market,Board,Database,API" />
        <meta
          name="google-site-verification"
          content="sAL0Wyt9UZG63TXf1FK2aqMVOiGhcCqjZBuIp2onG0s"
        />
        <meta name="theme-color" content="#BD983A" />

        <link rel="alternate" type="application/json+oembed" href="/json/oembed.json" />
        <link rel="shortcut icon" type="image/png" href={`/favicon${isDev ? '_dev' : ''}.png`} />
        <link rel="apple-touch-icon" type="image/png" href="/i/universalis/universalis_ios.png" />
        <link
          href="https://fonts.googleapis.com/css?family=Cinzel|Fjalla+One&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default MogboardDocument;
