interface ModalCoverProps {
  isOpen: boolean;
}

export default function ModalCover({ isOpen }: ModalCoverProps) {
  return <div className={`modal_cover ${isOpen ? 'open' : ''}`} />;
}
