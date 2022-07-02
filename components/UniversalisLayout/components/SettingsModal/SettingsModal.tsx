import { t, Trans } from '@lingui/macro';
import { useEffect, useState } from 'react';
import { getServers, Servers } from '../../../../data/game/servers';
import { getTimeZones, TimeZone } from '../../../../data/game/timezones';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, closeModal, onSave }: SettingsModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(null, closeModal);

  const [settings, setSetting] = useSettings({
    mogboard_server: 'Phoenix',
    mogboard_language: 'en',
    mogboard_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Europe/London',
    mogboard_leftnav: 'on',
    mogboard_homeworld: 'no',
  });
  const [server, setServer] = useState(settings['mogboard_server']);
  const [lang, setLang] = useState(settings['mogboard_language']);
  const [timezone, setTimezone] = useState(settings['mogboard_timezone']);
  const [showLeftNav, setShowLeftNav] = useState(settings['mogboard_leftnav']);
  const [showDefaultHomeWorld, setShowDefaultHomeWorld] = useState(settings['mogboard_homeworld']);

  const [settingsData, setSettingsData] = useState<Servers & { timezones: TimeZone[] }>({
    dcs: [],
    worlds: [],
    timezones: [],
  });
  useEffect(() => {
    (async () => {
      const timezones = await getTimeZones();
      const servers = await getServers({
        europe: t`Europe`,
        japan: t`Japan`,
        america: t`America`,
        oceania: t`Oceania`,
        china: t`中国`,
        unknown: t`(Unknown)`,
      });
      setSettingsData({ ...servers, ...{ timezones } });
    })();
  }, []);

  return (
    <div ref={modalRef} className={`modal modal_settings ${isOpen ? 'open' : ''}`}>
      <button type="button" className="modal_close_button" onClick={closeModal}>
        <i className="xiv-NavigationClose"></i>
      </button>

      <div className={`row row_top ${settings['mogboard_server'] == '' ? 'row-alert' : ''}`}>
        <div className="flex">
          <div className="flex_50">
            <label htmlFor="servers">
              <Trans>Your Server</Trans>
            </label>
            <div className="form">
              <select
                value={server}
                id="servers"
                className="servers"
                onChange={(e) => {
                  if (server !== e.target.value) {
                    setServer(e.target.value);
                  }
                }}
              >
                <option disabled>
                  <Trans>- Please Choose a Server -</Trans>
                </option>
                {settingsData.dcs.map(({ name, region, worlds }) => (
                  <optgroup key={name} label={`${name} - ${region}`}>
                    {worlds.map((world) => (
                      <option key={world.id} value={world.name}>
                        {world.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="flex_50">
            <label htmlFor="languages">
              <Trans>Language</Trans>
            </label>
            <div className="form">
              <select
                value={lang}
                id="languages"
                className="languages"
                onChange={(e) => {
                  const val = e.target.value;
                  if (
                    lang !== val &&
                    (val === 'en' || val === 'fr' || val === 'de' || val === 'ja' || val === 'chs')
                  ) {
                    setLang(val);
                  }
                }}
              >
                <option disabled>
                  <Trans>- Choose your language -</Trans>
                </option>
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
        <label htmlFor="timezones">
          <Trans>Timezone</Trans>
        </label>
        <div className="form">
          <select
            value={timezone}
            id="timezones"
            className="timezones"
            onChange={(e) => {
              if (timezone !== e.target.value) {
                setTimezone(e.target.value);
              }
            }}
          >
            <option disabled>
              <Trans>- Choose your timezone -</Trans>
            </option>
            {settingsData.timezones
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
            <label htmlFor="leftnav">
              <Trans>Left Navigation</Trans>
            </label>
            <div style={{ paddingBottom: 10 }}>
              <small>
                <Trans>This enables a quick-access left-navigation of all market categories.</Trans>
              </small>
            </div>
            <div className="form">
              <select
                value={showLeftNav}
                id="leftnav"
                className="leftnav"
                onChange={(e) => {
                  const val = e.target.value;
                  if (showLeftNav !== val && (val === 'on' || val === 'off')) {
                    setShowLeftNav(val);
                  }
                }}
              >
                <option value="off">
                  <Trans>No</Trans>
                </option>
                <option value="on">
                  <Trans>Yes</Trans>
                </option>
              </select>
            </div>
          </div>
          <div className="flex_50">
            <label htmlFor="homeworld">
              <Trans>Default Home World</Trans>
            </label>
            <div style={{ paddingBottom: 10 }}>
              <small>
                <Trans>
                  This will show prices/history on your home world by default instead of
                  cross-world.
                </Trans>
              </small>
            </div>
            <div className="form">
              <select
                value={showDefaultHomeWorld}
                id="homeworld"
                className="homeworld"
                onChange={(e) => {
                  const val = e.target.value;
                  if (showDefaultHomeWorld !== val && (val === 'yes' || val === 'no')) {
                    setShowDefaultHomeWorld(val);
                  }
                }}
              >
                <option value="no">
                  <Trans>No</Trans>
                </option>
                <option value="yes">
                  <Trans>Yes</Trans>
                </option>
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
          }}
        >
          <Trans>Save Settings</Trans>
        </button>
      </div>
    </div>
  );
}
