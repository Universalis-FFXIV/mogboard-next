import { useEffect, useState } from 'react';
import { getRepositoryUrl } from '../../data/game/repository';
import useSettings from '../../hooks/useSettings';

interface GameMateriaProps {
  materiaId: number;
  slotId: number;
}

export default function GameMateria({ materiaId, slotId }: GameMateriaProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  const [name, setName] = useState('');
  useEffect(() => {
    (async () => {
      const baseUrl = getRepositoryUrl(lang);
      const data = await fetch(`${baseUrl}/Materia/${materiaId}`).then((res) => res.json());
      setName(data[`Item${slotId}`][`Name_${lang}`]);
    })();
  }, [lang, materiaId, slotId]);
  return <>{name}</>;
}
