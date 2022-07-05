import { getItem, getMateria } from '../../data/game';
import { Language } from '../../types/universalis/lang';

interface GameMateriaProps {
  materiaId: number;
  slotId: number;
  lang: Language;
}

export default function GameMateria({ materiaId, slotId, lang }: GameMateriaProps) {
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
