import { useCookies } from 'react-cookie';

type Settings = {
  mogboard_server: string;
  mogboard_language: 'en' | 'fr' | 'de' | 'ja' | 'chs';
  mogboard_timezone: string;
  mogboard_leftnav: 'on' | 'off';
  mogboard_homeworld: 'yes' | 'no';
};

export default function useSettings(
  defaultValues: Partial<Settings> = {}
): [Partial<Settings>, (name: keyof Settings, value: any) => void] {
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

  for (const key of keys) {
    if (typeof window !== 'undefined') {
      const localValue = localStorage.getItem(key);
      if (localValue != null) {
        setSetting(key, localValue);
      }
    }

    if (cookies[key] == null && defaultValues[key] != null) {
      const date = new Date();
      date.setDate(date.getDate() + 365);
      setCookie(key, defaultValues[key], {
        expires: date,
        path: '/',
        sameSite: 'none',
        secure: true,
      });
    }
  }

  return [cookies, setSetting];
}
