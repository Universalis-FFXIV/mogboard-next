import { t, Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import { sprintf } from 'sprintf-js';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import { acquireConn, releaseConn } from '../../db/connect';
import { getUserAuthCode, getUserCharacters } from '../../db/user-character';
import useSettings from '../../hooks/useSettings';
import { DataCenter } from '../../types/game/DataCenter';
import { UserCharacter } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';

interface AccountProps {
  hasSession: boolean;
  characters: UserCharacter[];
  verification: string;
  dcs: DataCenter[];
}

type LodestoneParams = { id: number } | { world: string; name: string };

const Account: NextPage<AccountProps> = ({ hasSession, characters, verification, dcs }) => {
  const [settings] = useSettings();

  const addCharacter = async (data: LodestoneParams) => {
    fetch('/api/web/lodestone', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        const character = await res.json();
        console.log(character);
      })
      .catch(console.error);
  };

  const title = 'Characters - Account - Universalis';
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
      <AccountLayout section="characters" hasSession={hasSession}>
        <div className="characters">
          <h1>
            <Trans>Characters</Trans>
          </h1>
          <div className="account-panel">
            {characters.map((character) => (
              <div key={character.id} className="flex">
                <div className="flex_10">
                  <img
                    src={character.avatar ?? ''}
                    alt={character.name ?? ''}
                    className="character_avatar"
                    height={72}
                    width={72}
                  />
                </div>
                <div className="flex_90 character_info">
                  <a className="character_remove">
                    <Trans>REMOVE</Trans>
                  </a>
                  <h4 className="char_name">
                    <strong>{character.main ? '[MAIN]' : []}</strong> {character.name}
                  </h4>
                  <p>
                    {character.server} - <Trans>Updated:</Trans>{' '}
                    {new Date(character.updated * 1000).toLocaleString()}
                  </p>
                  <a>
                    <Trans>Set character as MAIN.</Trans>
                  </a>
                </div>
              </div>
            ))}
            {characters.length === 0 && (
              <div className="account-none">
                <Trans>You have no characters, why not add one below!</Trans>
              </div>
            )}
          </div>
          <br />
          <br />
          <div className="account-panel">
            <div>
              <h5 className="text-green">
                <Trans>Add a new character</Trans>
                <span className="character_auth_code">
                  {sprintf(t`AUTH CODE: %s`, verification)}
                </span>
              </h5>
              <br />
              <br />
              <p
                dangerouslySetInnerHTML={{
                  __html: t`To add a new character, you must first add your verification code. <strong>Please add your MAIN character first</strong>.`,
                }}
              ></p>
              <ul className="character_add_instructions">
                <li
                  dangerouslySetInnerHTML={{
                    __html: sprintf(
                      t`Go to Lodestone and Login with your character. Then <a href="%s">click here to edit your profile</a>.`,
                      'https://na.finalfantasyxiv.com/lodestone/my/setting/profile/'
                    ),
                  }}
                ></li>
                <li
                  dangerouslySetInnerHTML={{
                    __html: t`In the text box, enter in your <strong>AUTH CODE</strong>, then click on Confirm (twice).`,
                  }}
                ></li>
                <li>
                  <Trans>
                    Hop back to Universalis and fill in the form below. The site will search for
                    your character and confirm your auth code.
                  </Trans>
                </li>
              </ul>
            </div>
            <div className="form character_form">
              <div className="form_row form_columns flex">
                <div className="flex_50">
                  <label htmlFor="character_string">
                    <Trans>Name, ID, or Lodestone URL</Trans>
                  </label>
                  <input
                    type="text"
                    className="full"
                    name="character_string"
                    id="character_string"
                    placeholder=""
                  ></input>
                </div>
                <div className="flex_40">
                  <label htmlFor="character_server">
                    <Trans>Server</Trans>
                  </label>
                  <select
                    className="full"
                    name="character_server"
                    id="character_server"
                    defaultValue={settings['mogboard_server']}
                  >
                    {dcs.map((dc) => (
                      <optgroup key={dc.name} label={dc.name}>
                        {dc.worlds.map((world) => (
                          <option key={world.id} value={world.name}>
                            {world.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="flex_10">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="btn-blue character_add"
                    onClick={(e) => {
                      e.preventDefault();
                      addCharacter({ id: 0 });
                    }}
                  >
                    <Trans>Search</Trans>
                  </button>
                </div>
              </div>
              <div className="character_add_response"></div>
            </div>
          </div>
        </div>
      </AccountLayout>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx, authOptions);
  const hasSession = !!session;

  let characters: UserCharacter[] = [];
  let verification = '';
  if (session && session.user.id) {
    const conn = await acquireConn();
    try {
      characters = await getUserCharacters(session.user.id, conn);
    } catch (err) {
      console.error(err);
    } finally {
      await releaseConn(conn);
    }

    verification = getUserAuthCode(session.user.id);
  }

  let dcs: DataCenter[] = [];
  try {
    const dataCenters: { name: string; worlds: number[] }[] = await fetch(
      'https://universalis.app/api/v3/game/data-centers'
    ).then((res) => res.json());
    const worlds = await fetch('https://universalis.app/api/v3/game/worlds')
      .then((res) => res.json())
      .then((json) =>
        (json as { id: number; name: string }[]).reduce<
          Record<number, { id: number; name: string }>
        >((agg, next) => {
          agg[next.id] = {
            id: next.id,
            name: next.name,
          };
          return agg;
        }, {})
      );
    dcs = (dataCenters ?? []).map((dc) => ({
      name: dc.name,
      worlds: dc.worlds.map((worldId) => worlds[worldId]),
    }));
  } catch (err) {
    console.error(err);
  }

  return {
    props: {
      hasSession,
      characters,
      verification,
      dcs,
    },
  };
}

export default Account;
