import { createContext, PropsWithChildren, useContext } from 'react';

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
  onClose: () => void;
}

export type PopupData = Omit<PopupProps, 'onClose'>;

interface PopupContextData {
  popup: PopupData;
  setPopup: (popup: PopupData) => void;
}

const PopupContext = createContext<PopupContextData>({
  popup: { isOpen: false },
  setPopup: () => {},
});

export const PopupProvider = ({
  popup,
  setPopup,
  children,
}: PropsWithChildren<PopupContextData>) => {
  return <PopupContext.Provider value={{ popup, setPopup }}>{children}</PopupContext.Provider>;
};

export const usePopup = () => useContext(PopupContext);

export default function Popup({ type, title, message, forceOpen, isOpen, onClose }: PopupProps) {
  return (
    <div className={`popup ${isOpen ? 'open' : ''}`}>
      <div className="popup_display">
        <button
          type="button"
          className="popup_close_button"
          style={{ visibility: forceOpen ? 'hidden' : undefined }}
          onClick={onClose}
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
