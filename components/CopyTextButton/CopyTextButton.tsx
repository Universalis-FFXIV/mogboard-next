import CopyToClipboard from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import Tooltip from '../Tooltip/Tooltip';
import styles from './CopyTextButton.module.scss';

interface CopyTextButtonProps {
  text: string;
  onCopy?: () => void;
}

export default function CopyTextButton({ text, onCopy }: CopyTextButtonProps) {
  return (
    <Tooltip label="Copy item name to clipboard">
      <a className={styles.copyText}>
        <CopyToClipboard text={text} onCopy={onCopy}>
          <MdContentCopy />
        </CopyToClipboard>
      </a>
    </Tooltip>
  );
}
