import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../../../design/button/Button";
import { Spinner } from "../../../design/spinner/Spinner";
import styles from "./global-modal.module.css";
import localStyles from "./AdAction.module.css";
import { Close } from "../../../design/icons/close";
import { getPaymentLink } from "../../../endpoints";

export interface AdActionProps {
  label: string;
}

export function CheckoutAction({ label }: AdActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollPositionRef = useRef(0);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = async () => {
    setIsLoading(true);
    try {
      const paymentLink = await getPaymentLink("gems-100");
      console.log("Payment link retrieved:", paymentLink);
      setPaymentUrl(paymentLink);
      setIsModalOpen(true);

      // Save current scroll position
      scrollPositionRef.current = window.scrollY;

      // Fix body position to prevent scroll jump
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.classList.add("modal-open");

      dialogRef.current?.showModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    dialogRef.current?.close();
    setIsModalOpen(false);

    // Restore body styles and scroll position
    document.body.classList.remove("modal-open");
    document.body.style.top = "";
    window.scrollTo(0, scrollPositionRef.current);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const controller = new AbortController();

    dialog.addEventListener(
      "close",
      () => {
        setIsModalOpen(false);
        document.body.classList.remove("modal-open");
        document.body.style.top = "";
        window.scrollTo(0, scrollPositionRef.current);
      },
      controller,
    );

    return () => {
      controller.abort();
      // Cleanup: restore scroll on unmount if dialog was open
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
    };
  }, []);

  return (
    <>
      <Button onClick={handleOpenModal} disabled={isLoading}>
        {label}
        {isLoading && <Spinner size={16} />}
      </Button>

      <dialog ref={dialogRef} className={styles.globalModal}>
        <button
          onClick={handleCloseModal}
          className={localStyles.closeButton}
          aria-label="Close modal">
          Close Demo <Close size={20} />
        </button>
        {isModalOpen && (
          <iframe
            src={paymentUrl}
            className={localStyles.iframe}
            sandbox="allow-scripts allow-same-origin allow-forms"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            title={label}
          />
        )}
      </dialog>
    </>
  );
}
