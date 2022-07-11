import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Language } from '../types/universalis/lang';

interface Settings {
  mogboard_server: string;
  mogboard_language: Language;
  mogboard_timezone: string;
  mogboard_leftnav: 'on' | 'off';
  mogboard_homeworld: 'yes' | 'no';
}

function validateLanguage(
  settings: Partial<Settings>,
  setSettings: (name: keyof Settings, value: any) => void
) {
  if (!['ja', 'en', 'fr', 'de', 'chs', undefined].includes(settings['mogboard_language'])) {
    setSettings('mogboard_language', 'en');
  }
}

/**
 * Retrieve the user's site settings.
 * WARNING: This function refreshes the expiry of all settings cookies; this is a relatively *slow* operation!
 * Try to pass specific values from this where possible, instead of calling it in a deeply-nested loop.
 */
export default function useSettings(): [
  Partial<Settings>,
  (name: keyof Settings, value: any) => void
] {
  const keys: (keyof Settings)[] = [
    'mogboard_server',
    'mogboard_language',
    'mogboard_timezone',
    'mogboard_leftnav',
    'mogboard_homeworld',
  ];

  const [cookies, setCookie] = useCookies<keyof Settings, Partial<Settings>>(keys);
  const setSetting = (name: keyof Settings, value: any) => {
    const date = new Date();
    date.setDate(date.getDate() + 365);

    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }

    setCookie(name, value, {
      expires: date,
      path: '/',
      sameSite: 'none',
      secure: true,
    });
  };

  useEffect(() => {
    for (const key of keys) {
      const localValue = localStorage.getItem(key);
      setSetting(key, localValue);
    }

    // This only runs on the client
    validateLanguage(cookies, setSetting);
  });

  // This runs on the server first, and then on the client; bad data needs to be handled
  // in the initial page render.
  validateLanguage(cookies, setSetting);

  return [cookies, setSetting];
}
