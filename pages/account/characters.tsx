import { t, Trans } from '@lingui/macro';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { sprintf } from 'sprintf-js';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import useSettings from '../../hooks/useSettings';
import { getServers } from '../../service/servers';
import { UserCharacter } from '../../types/universalis/user';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useDataCenters from '../../hooks/useDataCenters';

type LodestoneParams = { lodestoneId: number } | { world: string; name: string };

const Account: NextPage = () => {
  const { status: sessionStatus } = useSession();
  const [settings] = useSettings();

  const { setPopup } = usePopup();

  const submitRef = useRef<HTMLButtonElement>(null);

  const { mutate } = useSWRConfig();
  const { data: verification } = useSWR<string>('/api/web/verify-code', (url) =>
    fetch(url)
      .then((res) => res.json())
      .then((res) => res.code)
  );
  const { data: characters } = useSWR<UserCharacter[]>('/api/web/characters', (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: dcs } = useDataCenters();

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
        setPopup({
          type: 'success',
          title: 'Character Added!',
          message: 'Your character has been added.',
          isOpen: true,
        });
        await mutate('/api/web/characters');
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
        await mutate('/api/web/characters');
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
        await mutate('/api/web/characters');
      })
      .catch(popupErr);
  };

  const title = 'Characters - Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';

  const AccountHead = () => (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <title>{title}</title>
    </Head>
  );

  if (sessionStatus === 'loading') {
    return <AccountHead />;
  }

  const hasSession = sessionStatus === 'authenticated';
  return (
    <>
      <AccountHead />
      <AccountLayout section="characters" hasSession={hasSession}>
        <div className="characters">
          <h1>
            <Trans>Characters</Trans>
          </h1>
          <div className="account-panel">
            {(characters ?? []).map((character) => (
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
            {characters != null && characters.length === 0 && (
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
                    {(dcs ?? []).map((dc) => (
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

export default Account;
