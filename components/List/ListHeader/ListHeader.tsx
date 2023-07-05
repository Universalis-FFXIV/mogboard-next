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
  showCrossDc: boolean;
  setShowCrossDc: (value: boolean) => void;
}

export default function ListHeader({
  list,
  reqIsOwner,
  openRenameModal,
  showHomeWorld,
  setShowHomeWorld,
  showHqOnly,
  setShowHqOnly,
  showCrossDc,
  setShowCrossDc,
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
          {showCrossDc ? (
            <>
              <a
                onClick={() => {
                  setShowCrossDc(false);
                  setShowHomeWorld(false);
                }}
              >
                <Trans>Show Cross-World</Trans>
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <a
                onClick={() => {
                  setShowCrossDc(false);
                  setShowHomeWorld(true);
                }}
              >
                <Trans>Show Home Server Only</Trans>
              </a>
            </>
          ) : showHomeWorld ? (
            <>
              <a onClick={() => setShowCrossDc(true)}>
                <Trans>Show Cross-DC</Trans>
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <a
                onClick={() => {
                  setShowCrossDc(false);
                  setShowHomeWorld(false);
                }}
              >
                <Trans>Show Cross-World</Trans>
              </a>
            </>
          ) : (
            <>
              <a onClick={() => setShowCrossDc(true)}>
                <Trans>Show Cross-DC</Trans>
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <a
                onClick={() => {
                  setShowCrossDc(false);
                  setShowHomeWorld(true);
                }}
              >
                <Trans>Show Home Server Only</Trans>
              </a>
            </>
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
