import { Trans } from '@lingui/macro';
import { RefObject } from 'react';
import { UserList } from '../../../types/universalis/user';

interface ListRenameModalProps {
  renameModalOpen: boolean;
  closeRenameModal: () => void;
  name: string;
  setName: (x: string) => void;
  submitRef: RefObject<HTMLButtonElement>;
  updating: boolean;
  setUpdating: (x: boolean) => void;
  updateList: (x: Pick<UserList, 'name'>) => void;
}

export default function ListRenameModal({
  renameModalOpen,
  closeRenameModal,
  name,
  setName,
  submitRef,
  updating,
  setUpdating,
  updateList,
}: ListRenameModalProps) {
  return (
    <div className={`modal list_rename_modal ${renameModalOpen ? 'open' : ''}`}>
      <button type="button" className="modal_close_button" onClick={() => closeRenameModal()}>
        <i className="xiv-NavigationClose"></i>
      </button>
      <div className="modal_row">
        <div className="modal_form_row_1">
          <h1>
            <Trans>Rename List</Trans>
          </h1>
        </div>
        <form method="post" className="modal_form rename_list_form">
          <div>
            <input
              name="list_name"
              id="list_name"
              type="text"
              placeholder="Name"
              className="full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <br />
          <br />
          <div className="modal_form_end">
            <button
              ref={submitRef}
              type="submit"
              disabled={updating}
              className={`btn-green btn_rename_list ${updating ? 'loading_interaction' : ''}`}
              style={
                updating
                  ? {
                      minWidth: submitRef.current?.offsetWidth,
                      minHeight: submitRef.current?.offsetHeight,
                      display: 'inline-block',
                    }
                  : undefined
              }
              onClick={(e) => {
                e.preventDefault();
                if (name != null) {
                  setUpdating(true);
                  updateList({ name });
                }
              }}
            >
              {updating ? <>&nbsp;</> : <Trans>Rename List</Trans>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
