import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import { Item } from '../../../../types/game/Item';
import CategoriesNavbar from '../CategoriesNavbar/CategoriesNavbar';

interface UniversalisLeftNavProps {
  onCategoryOpen: (cat: Item[]) => void;
}

export default function UniversalisLeftNav({ onCategoryOpen }: UniversalisLeftNavProps) {
  return (
    <aside>
      <SimpleBar>
        <Link href="/">
          <a className="nav-home">
            <img
              src="/i/brand/universalis/universalis_bodge.png"
              alt="Universalis"
              width={170}
              height={30}
            />
          </a>
        </Link>
        <CategoriesNavbar onCategoryOpen={onCategoryOpen} />
      </SimpleBar>
    </aside>
  );
}
