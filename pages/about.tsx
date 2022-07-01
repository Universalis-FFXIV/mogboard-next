import { t, Trans } from '@lingui/macro';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { sprintf } from 'sprintf-js';
import MoreQuestions from '../components/MoreQuestions/MoreQuestions';

const About: NextPage = () => {
  const title = 'About - Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';
  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>
      <div className="page">
        <div className="mogboard-header">
          <Image
            src="/i/brand/universalis/universalis_bodge.png"
            alt=""
            height={64}
            width={362.65}
          />
        </div>
        <div className="page-block">
          <br />
          <br />
          <div className="page-short">
            <h3 dangerouslySetInnerHTML={{ __html: t`What is <strong>Universalis</strong>?` }}></h3>
            <p>
              <Trans>
                The site allows you to view in-game market for multiple servers at anytime,
                anywhere. It uses crowd-sourced data from multiple sources to provide the most
                up-to-date prices possible.
              </Trans>
            </p>
          </div>
          <br />
          <br />
          <div className="page-short">
            <h3>
              <Trans>What information can I get?</Trans>
            </h3>
            <p>
              <Trans>
                All market information is available: Prices, Materia, Retainer, Crafters and even
                Buyers. Everything that you see in-game is available. Additional data-views have
                been added such as graphs, extended history and cross-world summary is also
                included.
              </Trans>
            </p>
          </div>
          <br />
          <br />
          <div className="page-short">
            <h3>
              <Trans>Can I have access to the data?</Trans>
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html: sprintf(
                  t`<strong>Definitely!</strong><br /><br />Everything you see on Universalis is open for anyone to use, to learn more about how to access the data using a REST API Service, check out the %s documentation.`,
                  '<a href="https://docs.universalis.app">Universalis</a>'
                ),
              }}
            ></p>
          </div>
          <br />
          <br />
          <div className="page-short">
            <h3>
              <Trans>Special thanks</Trans>
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html: sprintf(
                  t`We would like to thank Vekien and Miu from %s for their initial work on mogboard, which made this site, in its current state, possible.`,
                  '<a href="https://xivapi.com">XIVAPI</a>'
                ),
              }}
            ></p>
          </div>
          <br />
          <br />
        </div>
        <div className="page-banner">
          <Image src="/i/bg/about.png" alt="" width={849.6} height={395.833} />
        </div>
        <div className="page-block">
          <div className="page-short">
            <h3 id="technical">
              <Trans>So, how does it actually work? Get Technical.</Trans>
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html: t`<strong>Universalis</strong> runs a REST API that applications can post market board data to, after they collect the data from a running game instance by multiple users, anonymously.`,
              }}
            ></p>
            <p>
              <Trans>
                It stores this data, and reports it back to anyone that requests its endpoints -
                including this frontend, which visualizes the stored data and notifies you about
                changes.
              </Trans>
            </p>
            <br />
            <br />
          </div>
        </div>
        <div className="page-block">
          <br />
          <br />
          <div className="page-short">
            <h3>
              <Trans>Credits</Trans>
            </h3>
            <p>
              <div className="flex">
                <div className="flex_10">
                  <div style={{ width: 100, height: 100 }}>
                    <Image
                      src="/i/brand/universalis/kara.jpg"
                      alt=""
                      className="mog-avatar"
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
                <div className="flex_90 mog-credits">
                  <h2>karashiiro</h2>
                  <Trans>Database API, server maintenance</Trans>
                </div>
              </div>
            </p>
            <br />
            <p>
              <div className="flex">
                <div className="flex_10">
                  <div style={{ width: 100, height: 100 }}>
                    <Image
                      src="/i/brand/universalis/goat.jpg"
                      alt=""
                      className="mog-avatar"
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
                <div className="flex_90 mog-credits">
                  <h2>goat</h2>
                  <Trans>Game stuff, stealing mogboard</Trans>
                </div>
              </div>
            </p>
            <p className="mog-honorable">
              <Trans>Also thanks to: Vekien, Miu, Mino and all of our uploaders!</Trans>
            </p>
            <p
              className="mog-honorable"
              dangerouslySetInnerHTML={{
                __html: sprintf(
                  t`Game data sourced from <a href="%s">XIVAPI</a> and <a href="%s">FFCafe</a>`,
                  'https://xivapi.com/',
                  'https://ffcafe.org/'
                ),
              }}
            ></p>
          </div>
          <br />
          <br />
        </div>
        <MoreQuestions />
      </div>
    </>
  );
};

export default About;
