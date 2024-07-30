import React from "react";
import { ModalProps } from "./interface";
import Modal from "./Modal";

type ConfirmModalProps = Omit<ModalProps, "showClose"> & {
  action: string;
  onAction: () => any;
};

export default function ConfirmModal({
  btn,
  children,
  action,
  onAction,
}: ConfirmModalProps) {
  return (
    <Modal btn={btn}>
      {({ ref }) => (
        <>
          {typeof children == "function" ? children({ ref }) : children}
          <div className="modal-action">
            <button className="btn" onClick={() => ref.current?.close()}>
              Close
            </button>
            <button className="btn btn-primary" onClick={() => {
              onAction();
              ref.current?.close();
            }}>
              {action}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
