import { t, Trans } from '@lingui/macro';
import { sprintf } from 'sprintf-js';
import { UserList } from '../../../types/universalis/user';

interface ListHeaderProps {
  list: UserList;
  reqIsOwner: boolean;
  openRenameModal: () => void;
  showHomeWorld: boolean;
  setShowHomeWorld: (homeWorld: boolean) => void;
}

export default function ListHeader({
  list,
  reqIsOwner,
  openRenameModal,
  showHomeWorld,
  setShowHomeWorld,
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
        </span>
      </h1>
    </>
  );
}
