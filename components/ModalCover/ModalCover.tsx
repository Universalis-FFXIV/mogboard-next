interface ModalCoverProps {
  modalOpen: boolean;
}

export default function ModalCover({ modalOpen }: ModalCoverProps) {
  return (
    <>
      <div className={`modal_cover ${modalOpen ? 'open' : ''}`} />
      <div className="popup">
        <div className="popup_display">
          <button type="button" className="popup_close_button">
            <i className="xiv-NavigationClose"></i>
          </button>
          <div className="popup_icon" data-type="success">
            <i className="xiv-SymbolCheck"></i>
          </div>
          <h1 />
          <p />
        </div>
      </div>
    </>
  );
}
