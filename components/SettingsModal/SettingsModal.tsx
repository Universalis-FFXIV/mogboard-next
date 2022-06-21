import { useState } from 'react';
import useSWRImmutable from 'swr';
import useClickOutside from '../../hooks/useClickOutside';
import useSettings from '../../hooks/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, closeModal, onSave }: SettingsModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(null, closeModal);

  const [settings, setSetting] = useSettings();
  const [server, setServer] = useState(settings['mogboard_server'] ?? 'Phoenix');
  const [lang, setLang] = useState(settings['mogboard_language'] ?? 'en');
  const [timezone, setTimezone] = useState(
    settings['mogboard_timezone'] ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      'Europe/London'
  );
  const [showLeftNav, setShowLeftNav] = useState(settings['mogboard_leftnav'] ?? 'on');
  const [showDefaultHomeWorld, setShowDefaultHomeWorld] = useState(
    settings['mogboard_homeworld'] ?? 'no'
  );

  const tzData = useSWRImmutable('https://universalis.app/api/v3/misc/time-zones', async (path) => {
    const tzs: { id: string; offset: number; name: string }[] = await fetch(path).then((res) =>
      res.json()
    );
    return tzs;
  });

  const dcData = useSWRImmutable(
    'https://universalis.app/api/v3/game/data-centers',
    async (path) => {
      const dataCenters: { name: string; worlds: number[] }[] = await fetch(path).then((res) =>
        res.json()
      );
      return dataCenters;
    }
  );
  const worldData = useSWRImmutable('https://universalis.app/api/v3/game/worlds', async (path) => {
    const worlds: { id: number; name: string }[] = await fetch(path).then((res) => res.json());
    return worlds;
  });

  if (tzData.error) {
    console.log(tzData.error);
  }

  if (dcData.error) {
    console.log(dcData.error);
  }

  if (worldData.error) {
    console.log(worldData.error);
  }

  const worlds = (worldData.data ?? []).reduce<Record<number, string>>((agg, next) => {
    agg[next.id] = next.name;
    return agg;
  }, {});
  const dcRegions = {
    europe: ['Chaos', 'Light'],
    japan: ['Elemental', 'Gaia', 'Mana'],
    america: ['Crystal', 'Primal', 'Aether'],
    oceania: ['Materia'],
    china: ['陆行鸟', '莫古力', '猫小胖', '豆豆柴'],
  };
  const dcs = (dcData.data ?? []).map((dc) => ({
    name: dc.name,
    worlds: dc.worlds.map((worldId) => worlds[worldId]),
  }));

  const timezones = tzData.data ?? [];

  return (
    <div ref={modalRef} className={`modal modal_settings ${isOpen ? 'open' : ''}`}>
      <button type="button" className="modal_close_button" onClick={closeModal}>
        <i className="xiv-NavigationClose"></i>
      </button>

      <div className={`row row_top ${settings['mogboard_server'] == '' ? 'row-alert' : ''}`}>
        <div className="flex">
          <div className="flex_50">
            <label htmlFor="servers">Your Server</label>
            <div className="form">
              <select
                value={server}
                id="servers"
                className="servers"
                onChange={(e) => setServer(e.target.value)}
              >
                <option disabled>- Please Choose a Server -</option>
                {dcs.map(({ name, worlds }) => {
                  const region = dcRegions.europe.includes(name)
                    ? 'Europe'
                    : dcRegions.japan.includes(name)
                    ? 'Japan'
                    : dcRegions.america.includes(name)
                    ? 'America'
                    : dcRegions.oceania.includes(name)
                    ? 'Oceania'
                    : dcRegions.china.includes(name)
                    ? '中国'
                    : '(Unknown)';
                  return (
                    <optgroup key={`${name} - ${region}`} label={`${name} - ${region}`}>
                      {worlds.map((world) => (
                        <option key={world} value={world}>
                          {world}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex_50">
            <label htmlFor="languages">Language</label>
            <div className="form">
              <select
                value={lang}
                id="languages"
                className="languages"
                onChange={(e) => {
                  const val = e.target.value;
                  if (
                    val === 'en' ||
                    val === 'fr' ||
                    val === 'de' ||
                    val === 'ja' ||
                    val === 'chs'
                  ) {
                    setLang(val);
                  }
                }}
              >
                <option disabled>- Choose your language -</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                {/* <option value="kr">한국어</option> */}
                <option value="chs">中文</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row row_top">
        <label htmlFor="timezones">Timezone</label>
        <div className="form">
          <select
            value={timezone}
            id="timezones"
            className="timezones"
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option disabled>- Choose your timezone -</option>
            {timezones
              .sort((a, b) => a.offset - b.offset)
              .map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="row row_top">
        <div className="flex">
          <div className="flex_50">
            <label htmlFor="leftnav">Left Navigation</label>
            <div style={{ paddingBottom: 10 }}>
              <small>This enables a quick-access left-navigation of all market categories.</small>
            </div>
            <div className="form">
              <select
                value={showLeftNav}
                id="leftnav"
                className="leftnav"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'on' || val === 'off') {
                    setShowLeftNav(val);
                  }
                }}
              >
                <option value="off">No</option>
                <option value="on">Yes</option>
              </select>
            </div>
          </div>
          <div className="flex_50">
            <label htmlFor="homeworld">Default Home World</label>
            <div style={{ paddingBottom: 10 }}>
              <small>
                This will show prices/history on your home world by default instead of cross-world.
              </small>
            </div>
            <div className="form">
              <select
                value={showDefaultHomeWorld}
                id="homeworld"
                className="homeworld"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'yes' || val === 'no') {
                    setShowDefaultHomeWorld(val);
                  }
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row form tac">
        <button
          type="button"
          className="btn-green"
          onClick={() => {
            setSetting('mogboard_server', server);
            setSetting('mogboard_language', lang);
            setSetting('mogboard_timezone', timezone);
            setSetting('mogboard_leftnav', showLeftNav);
            setSetting('mogboard_homeworld', showDefaultHomeWorld);
            onSave();
            location.reload();
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
