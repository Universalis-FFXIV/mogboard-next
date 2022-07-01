import { getItem, getMateria } from '../../data/game';
import useSettings from '../../hooks/useSettings';

interface GameMateriaProps {
  materiaId: number;
  slotId: number;
}

export default function GameMateria({ materiaId, slotId }: GameMateriaProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  const materia = getMateria(materiaId, lang);
  if (materia == null) {
    return <></>;
  }

  const item = getItem(materia.items[materia.slots.findIndex((s) => s === slotId)], lang);
  if (item == null) {
    return <></>;
  }

  return <>{item.name}</>;
}
