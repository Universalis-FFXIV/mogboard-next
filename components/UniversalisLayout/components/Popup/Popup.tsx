const icons = {
  success: 'xiv-SymbolCheck',
  error: 'xiv-SymbolCross',
  warning: 'xiv-SymbolAlert',
  info: 'xiv-SymbolQuestion',
};

interface PopupProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  forceOpen?: boolean;
  isOpen: boolean;
}

export default function Popup({ type, title, message, forceOpen, isOpen }: PopupProps) {
  return (
    <div className={`popup ${isOpen ? 'open' : ''}`}>
      <div className="popup_display">
        <button
          type="button"
          className="popup_close_button"
          style={{ visibility: forceOpen ? 'hidden' : undefined }}
        >
          <i className="xiv-NavigationClose"></i>
        </button>
        <div className="popup_icon" data-type={type ?? 'success'}>
          <i className={type != null ? icons[type] : 'xiv-SymbolCheck'}></i>
        </div>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
