import { useEffect, useRef } from "preact/hooks";
import { Button } from "../../../design/button/Button";
import styles from "./global-modal.module.css";
import localStyles from "./AdAction.module.css";
import { Close } from "../../../design/icons/close";

export interface AdActionProps {
  url: string;
  label: string;
}

export function AdAction({ url, label }: AdActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollPositionRef = useRef(0);

  const handleOpenModal = () => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;

    // Fix body position to prevent scroll jump
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.classList.add("modal-open");

    dialogRef.current?.showModal();
  };

  const handleCloseModal = () => {
    dialogRef.current?.close();

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
        document.body.classList.remove("modal-open");
        document.body.style.top = "";
        window.scrollTo(0, scrollPositionRef.current);
      },
      controller,
    );

    window.addEventListener(
      "message",
      (event) => {
        // bolt-bce-transaction-success, bolt-transaction-success
        if (event.data.type === "bolt-gaming-issue-reward") {
          handleCloseModal();
        }
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
      <Button onClick={handleOpenModal}>{label}</Button>

      <dialog ref={dialogRef} className={styles.globalModal}>
        <button
          onClick={handleCloseModal}
          className={localStyles.closeButton}
          aria-label="Close modal">
          Close Demo <Close size={20} />
        </button>
        <iframe
          src={url}
          className={localStyles.iframe}
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          title={label}
        />
      </dialog>
    </>
  );
}
