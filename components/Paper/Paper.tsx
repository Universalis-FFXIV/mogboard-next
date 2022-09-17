import { PropsWithChildren } from 'react';
import styles from './Paper.module.scss';

export default function Paper({ children }: PropsWithChildren) {
  return <div className={styles.paper}>{children}</div>;
}
