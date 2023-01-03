import { t, Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import Head from 'next/head';
import Image from 'next/image';
import { useReducer, useRef, useState } from 'react';
import { sprintf } from 'sprintf-js';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import { Database } from '../../db';
import useSettings from '../../hooks/useSettings';
import { getServers } from '../../service/servers';
import { DataCenter } from '../../types/game/DataCenter';
import { UserCharacter } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';

type CharacterSimple = Omit<UserCharacter, 'id' | 'userId'>;

interface AccountProps {
  hasSession: boolean;
  characters: CharacterSimple[];
  verification: string;
  dcs: DataCenter[];
}

type LodestoneParams = { lodestoneId: number } | { world: string; name: string };

type CharactersAction =
  | { type: 'addCharacter'; character: CharacterSimple }
  | { type: 'deleteCharacter'; characterId: number; main?: number }
  | { type: 'setMain'; characterId: number };

const Account: NextPage<AccountProps> = ({ hasSession, characters, verification, dcs }) => {
  const [settings] = useSettings();

  const { setPopup } = usePopup();

  const submitRef = useRef<HTMLButtonElement>(null);

  const [stateCharacters, dispatch] = useReducer(
    (state: CharacterSimple[], action: CharactersAction) => {
      switch (action.type) {
        case 'addCharacter':
          if (!state.find((character) => character.lodestoneId === action.character.lodestoneId)) {
            state.push(action.character);
          }
          return state.slice(0);
        case 'deleteCharacter':
          const idx = state.findIndex((character) => character.lodestoneId === action.characterId);
          if (idx !== -1) {
            state.splice(idx, 1);
            if (action.main != null) {
              for (const character of state) {
                character.main = character.lodestoneId === action.main;
              }
            }
          }
          return state.slice(0);
        case 'setMain':
          for (const character of state) {
            character.main = character.lodestoneId === action.characterId;
          }
          return state.slice(0);
      }
    },
    characters
  );

  const [searching, setSearching] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [world, setWorld] = useState(settings['mogboard_server'] || 'Phoenix');
  const [charSearch, setCharSearch] = useState('');
  const parseCharSearch = ():
    | { isLodestoneId: true; lodestoneId: number }
    | { isLodestoneId: false; name: string } => {
    let n = parseInt(charSearch);
    if (!isNaN(n)) {
      return { isLodestoneId: true, lodestoneId: n };
    }

    const matches =
      /https?:\/\/\w{2}\.finalfantasyxiv\.com\/lodestone\/character\/(?<id>\d+)\/?/g.exec(
        charSearch
      );
    const groups = matches?.groups ?? {};
    n = parseInt(groups['id']);
    if (!isNaN(n)) {
      return { isLodestoneId: true, lodestoneId: n };
    }

    return { isLodestoneId: false, name: charSearch };
  };

  const handleErr = async (res: Response) => {
    if (!res.ok) {
      const body = res.headers.get('Content-Type')?.includes('application/json')
        ? (await res.json()).message
        : await res.text();
      throw new Error(body);
    }
  };

  const popupErr = (err: any) => {
    setPopup({
      type: 'error',
      title: 'Error',
      message: err instanceof Error ? err.message : `${err}`,
      isOpen: true,
    });
  };

  const addCharacter = async (data: LodestoneParams) => {
    setSearching(true);
    setProgressText('Searching Lodestone for your character...');
    fetch('/api/web/lodestone', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        await handleErr(res);
        const character = await res.json();
        setPopup({
          type: 'success',
          title: 'Character Added!',
          message: 'Your character has been added.',
          isOpen: true,
        });
        dispatch({ type: 'addCharacter', character });
      })
      .catch(popupErr)
      .finally(() => {
        setProgressText('');
        setSearching(false);
      });
  };

  const updateCharacter = async (data: Pick<UserCharacter, 'lodestoneId' | 'main'>) => {
    fetch('/api/web/lodestone', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        await handleErr(res);
        dispatch({ type: 'setMain', characterId: data.lodestoneId });
      })
      .catch(popupErr);
  };

  const unlinkCharacter = async (data: Pick<UserCharacter, 'lodestoneId'>) => {
    fetch('/api/web/lodestone', {
      method: 'DELETE',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        await handleErr(res);
        dispatch({
          type: 'deleteCharacter',
          characterId: data.lodestoneId,
          main: (await res.json()).main,
        });
      })
      .catch(popupErr);
  };

  const title = 'Characters - Universalis';
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
            {stateCharacters.map((character) => (
              <div key={character.lodestoneId} className="flex">
                <div className="flex_10">
                  <div className="character_avatar">
                    <Image
                      src={character.avatar ?? ''}
                      alt={character.name ?? ''}
                      className="character_avatar"
                      height={72}
                      width={72}
                    />
                  </div>
                </div>
                <div className="flex_90 character_info">
                  <a
                    className="character_remove"
                    onClick={() => unlinkCharacter({ lodestoneId: character.lodestoneId })}
                  >
                    <Trans>REMOVE</Trans>
                  </a>
                  <h4 className="char_name">
                    <strong>{character.main ? '[MAIN]' : []}</strong> {character.name}
                  </h4>
                  <p>
                    {character.server} - <Trans>Updated:</Trans>{' '}
                    {new Date(character.updated * 1000).toLocaleString()}
                  </p>
                  <a
                    onClick={() =>
                      updateCharacter({ lodestoneId: character.lodestoneId, main: true })
                    }
                  >
                    <Trans>Set character as MAIN.</Trans>
                  </a>
                </div>
              </div>
            ))}
            {stateCharacters.length === 0 && (
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
                    value={charSearch}
                    onChange={(e) => setCharSearch(e.target.value)}
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
                    defaultValue={settings['mogboard_server'] || 'Phoenix'}
                    onChange={(e) => setWorld(e.target.value)}
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
                    ref={submitRef}
                    type="button"
                    className={`btn-blue character_add ${searching ? 'loading_interaction' : ''}`}
                    style={
                      searching
                        ? {
                            minWidth: submitRef.current?.offsetWidth,
                            minHeight: submitRef.current?.offsetHeight,
                            display: 'inline-block',
                          }
                        : undefined
                    }
                    disabled={searching}
                    onClick={(e) => {
                      e.preventDefault();
                      const params = parseCharSearch();
                      if (params.isLodestoneId) {
                        addCharacter({ lodestoneId: params.lodestoneId });
                      } else {
                        addCharacter({ name: params.name, world });
                      }
                    }}
                  >
                    {searching ? <></> : <Trans>Search</Trans>}
                  </button>
                </div>
              </div>
              <div className="character_add_response">{progressText}</div>
            </div>
          </div>
        </div>
      </AccountLayout>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  const hasSession = !!session;

  let characters: Partial<UserCharacter>[] = [];
  let verification = '';
  if (session && session.user.id) {
    try {
      characters = (await Database.getUserCharacters(session.user.id)).map((character) => {
        const x: Partial<UserCharacter> = character;
        delete x.id;
        delete x.userId;
        return x;
      });
    } catch (err) {
      console.error(err);
    }

    verification = Database.getUserAuthCode(session.user.id);
  }

  let dcs: DataCenter[] = [];
  try {
    const servers = await getServers();
    dcs = servers.dcs
      .map((dc) => ({
        name: dc.name,
        region: dc.region,
        worlds: dc.worlds.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.region.localeCompare(b.region));
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
