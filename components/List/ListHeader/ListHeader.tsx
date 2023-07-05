import { t, Trans } from '@lingui/macro';
import { sprintf } from 'sprintf-js';
import { UserList } from '../../../types/universalis/user';

interface ListHeaderProps {
  list: UserList;
  reqIsOwner: boolean;
  openRenameModal: () => void;
  showHomeWorld: boolean;
  setShowHomeWorld: (homeWorld: boolean) => void;
  showHqOnly: boolean;
  setShowHqOnly: (value: boolean) => void;
}

export default function ListHeader({
  list,
  reqIsOwner,
  openRenameModal,
  showHomeWorld,
  setShowHomeWorld,
  showHqOnly,
  setShowHqOnly,
}: ListHeaderProps) {
  const nOfMItems = sprintf(t`%d / %d items`, list.items.length, 100);
  return (
    <>
      <small>
        <Trans>LIST</Trans>
      </small>
      <h1>
        {list.name}
        <span>
          {reqIsOwner && (
            <>
              <a className="link_rename_list" onClick={() => openRenameModal()}>
                <Trans>Rename</Trans>
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
            </>
          )}
          {nOfMItems}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          {showHomeWorld ? (
            <a onClick={() => setShowHomeWorld(false)}>
              <Trans>Show Cross-World</Trans>
            </a>
          ) : (
            <a onClick={() => setShowHomeWorld(true)}>
              <Trans>Show Home Server Only</Trans>
            </a>
          )}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          {showHqOnly ? (
            <a onClick={() => setShowHqOnly(false)}>
              <Trans>Show NQ and HQ</Trans>
            </a>
          ) : (
            <a onClick={() => setShowHqOnly(true)}>
              <Trans>Show HQ Only</Trans>
            </a>
          )}
        </span>
      </h1>
    </>
  );
}
