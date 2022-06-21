import { useCookies } from 'react-cookie';

type Settings = {
  mogboard_server?: string;
  mogboard_language?: 'en' | 'fr' | 'de' | 'ja' | 'chs';
  mogboard_timezone?: string;
  mogboard_leftnav?: 'on' | 'off';
  mogboard_homeworld?: 'yes' | 'no';
};

export default function useSettings(): [Settings, (name: keyof Settings, value: any) => void] {
  const keys: (keyof Settings)[] = [
    'mogboard_server',
    'mogboard_language',
    'mogboard_timezone',
    'mogboard_leftnav',
    'mogboard_homeworld',
  ];

  const [cookies, setCookie] = useCookies<keyof Settings, Settings>(keys);
  const setSetting = (name: keyof Settings, value: any) => {
    const date = new Date();
    localStorage.setItem(name, value);

    date.setDate(date.getDate() + 365);
    setCookie(name, value, {
      expires: date,
      path: '/',
      sameSite: 'none',
      secure: true,
    });
  };

  for (const key of keys) {
    if (typeof window !== 'undefined') {
      setSetting(key, localStorage?.getItem(key));
    }
  }

  return [cookies, setSetting];
}
