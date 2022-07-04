import { t, Trans } from '@lingui/macro';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { sprintf } from 'sprintf-js';
import MoreQuestions from '../components/MoreQuestions/MoreQuestions';

interface ContributorProps {
  name: string;
  kind: string;
  description: string;
  intlUrl: string;
  cnUrl?: string;
}

function Contributor({ name, kind, description, intlUrl, cnUrl }: ContributorProps) {
  return (
    <>
      <div className="page-short">
        <h5>
          <strong>{name}</strong> {kind}
        </h5>
        <p>{description}</p>
        <br />
        <br />
        <br />
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div
            style={{
              textAlign: 'center',
              ...(cnUrl ? { float: 'left', marginLeft: '19%' } : {}),
            }}
          >
            <a href={intlUrl} target="_blank" rel="noreferrer">
              <button type="button" className="btn btn-green btn-download">
                <span className="icon-heart" /> <Trans>Download</Trans>
              </button>
            </a>
          </div>
          {cnUrl && (
            <div style={{ textAlign: 'center', float: 'right', marginRight: '19%' }}>
              <a href={cnUrl} target="_blank" rel="noreferrer">
                <button type="button" className="btn btn-green btn-download">
                  <span className="icon-heart" /> 下载
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
      <br />
      <br />
    </>
  );
}

const Contribute: NextPage = () => {
  const title = 'Contribute - Universalis';
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
            <h3
              dangerouslySetInnerHTML={{
                __html: t`How to contribute to <strong>Universalis</strong>`,
              }}
            ></h3>
            <p
              dangerouslySetInnerHTML={{
                __html: t`There are multiple ways to contribute to <strong>Universalis</strong>. All of your contributions are anonymous - no one will be able to refer back to your character or account to know that you have uploaded any data. The applications below are tested by us to make sure that they don't endanger your account or your characters.`,
              }}
            ></p>
            <p
              dangerouslySetInnerHTML={{
                __html: t`Every contribution helps to make the data on <strong>Universalis</strong> better, more accurate and more helpful. Thank you very much for helping out!`,
              }}
            ></p>
          </div>
          <br />
          <br />
          <Contributor
            name="FFXIVQuickLauncher"
            kind={t`In-Game addon`}
            description={t`FFXIVQuickLauncher is a faster launcher for FFXIV aims to fix the slowness and tediousness of the regular launcher and adds a lot of QoL features to the game. A Universalis uploader that can be disabled is built into the launcher.`}
            intlUrl="https://github.com/goaaats/FFXIVQuickLauncher/"
            cnUrl="https://gitee.com/bluefissure/Dalamud/releases/v4.9.8.2-beta.5"
          />
          <br />
          <Contributor
            name="Universalis"
            kind={t`ACT plugin`}
            description={t`This is a regular ACT plugin that runs next to the always-used FFXIV_ACT_PLUGIN - just drop it into your ACT plugins folder, add it to ACT and you're good to go! No configuration needed.`}
            intlUrl="https://github.com/goaaats/universalis_act_plugin/releases/latest"
            cnUrl="https://gitee.com/bluefissure/universalis_act_plugin/releases/v1.1"
          />
          <br />
          <Contributor
            name="FFXIV Teamcraft"
            kind={t`Collaborative crafting tool`}
            description={t`FFXIV Teamcraft is a tool for Final Fantasy XIV players that helps with crafting lists organization and crafting/gathering in general. It has a lot of features to make it a one stop shop, with things like integrated alarms, custom items, permissions system, realtime sharing, etc.`}
            intlUrl="https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/releases/latest"
          />
          <br />
          <Contributor
            name="Matcha"
            kind={t`ACT plugin`}
            description={t`If you are playing on chinese server(other servers are not supported), you can use Matcha plugin provided by FFCAFE which have built-in Universalis integration. Matcha also provides a overlay to show price information from Universalis.`}
            intlUrl="https://ffcafe.org/matcha/universalis/"
          />
          <div className="page-short">
            <h3>
              <Trans>Are you making your own application?</Trans>
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html: sprintf(
                  t`If you wish to contribute to <strong>Universalis</strong> with your own application, please contact us on our <a href="%s">Discord</a>. Let's work together!`,
                  'https://discord.gg/JcMvMxD'
                ),
              }}
            ></p>
          </div>
        </div>
        <MoreQuestions />
      </div>
    </>
  );
};

export default Contribute;
