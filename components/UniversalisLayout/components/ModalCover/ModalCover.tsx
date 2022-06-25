import { createContext, PropsWithChildren, useContext } from 'react';

interface ModalCoverProps {
  isOpen: boolean;
}

export type ModalCoverData = ModalCoverProps;

interface ModalCoverContextData {
  modalCover: ModalCoverData;
  setModalCover: (modalCover: ModalCoverData) => void;
}

const ModalCoverContext = createContext<ModalCoverContextData>({
  modalCover: { isOpen: false },
  setModalCover: () => {},
});

export const ModalCoverProvider = ({
  modalCover,
  setModalCover,
  children,
}: PropsWithChildren<ModalCoverContextData>) => {
  return (
    <ModalCoverContext.Provider value={{ modalCover, setModalCover }}>
      {children}
    </ModalCoverContext.Provider>
  );
};

export const useModalCover = () => useContext(ModalCoverContext);

export default function ModalCover({ isOpen }: ModalCoverProps) {
  return <div className={`modal_cover ${isOpen ? 'open' : ''}`} />;
}
