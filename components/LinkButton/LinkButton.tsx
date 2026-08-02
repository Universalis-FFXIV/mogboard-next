import { ReactElement } from 'react';
import styles from './LinkButton.module.scss';

export interface LinkButtonProps {
  onClick: () => void;
  children: string | ReactElement | ReactElement[];
}

export default function LinkButton({ onClick, children }: LinkButtonProps) {
  return (
    <button type="button" className={styles.linkButton} onClick={onClick}>
      {children}
    </button>
  );
}
