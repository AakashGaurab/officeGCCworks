import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { ModalText } from '../constants/Text';
import './Modal.css';

type ModalProps = {
  isOpen: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
};

// A pop-up window over the page, built on the browser's own <dialog> element. showModal() gives us, for free:
// the dimmed backdrop, keyboard focus kept inside the dialog, Esc to close, and focus returned to the
// button that opened it. That is why this component is so small.
const Modal = ({ isOpen, label, onClose, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // The parent owns "is it open"; this keeps the real dialog in step with it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // A click on the dimmed area is a click on the dialog element itself (the content sits inside it).
  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    // onClose fires when the browser closes the dialog (Esc key), so the parent state stays correct.
    <dialog ref={dialogRef} className="modal" aria-label={label} onClick={handleDialogClick} onClose={onClose}>
      <button className="modal-close" type="button" aria-label={ModalText.CLOSE} onClick={onClose}>
        &times;
      </button>
      {children}
    </dialog>
  );
};

export default Modal;
