import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { getRepositoryUrl } from '../../data/game/repository';
import useSettings from '../../hooks/useSettings';
import { Item } from '../../types/game/Item';

interface ItemProviderProps {
  itemId: number;
}

const ItemContext = createContext<Item | undefined>(undefined);

export const useItem = () => {
  return useContext(ItemContext);
};

export default function ItemProvider({ itemId, children }: PropsWithChildren<ItemProviderProps>) {
  const [settings] = useSettings();
  const [item, setItem] = useState<Item | undefined>(undefined);
  const lang = settings['mogboard_language'] ?? 'en';
  useEffect(() => {
    (async () => {
      const baseUrl = getRepositoryUrl(lang);

      let data: any = null;
      do {
        const res = await fetch(`${baseUrl}/Item/${itemId}`);
        if (res.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          data = await res.json();
        }
      } while (data == null);

      setItem({
        id: data.ID,
        name: data.Name,
        icon: `https://xivapi.com${data.Icon}`,
        levelItem: data.LevelItem,
        rarity: data.Rarity,
        itemKind: data.ItemKind.Name,
        itemSearchCategory: {
          id: data.ItemSearchCategory.ID,
          name: data.ItemSearchCategory.Name,
        },
        classJobCategory: data.ClassJobCategory
          ? {
              id: data.ClassJobCategory.ID,
              name: data.ClassJobCategory.Name,
            }
          : undefined,
      });
    })();
  }, [lang, itemId]);

  return <ItemContext.Provider value={item}>{children}</ItemContext.Provider>;
}
