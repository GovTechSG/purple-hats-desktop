import React from "react";
import UserDetailsForm from "./UserDetailsForm";


const Modal = ({
  id, 
  showModal, 
  showHeader,
  isOnboarding,
  modalTitle,
  modalBody,
  modalFooter,
  setShowModal
}) => {
  const showHideClassName = showModal ? "modal fade show" : "modal d-none";
  const showHeaderClassName = showHeader ? "modal-header show" : "modal-header hide"; 
  const modalContentClassName = isOnboarding ? "onboarding-modal modal-content" : "modal-content"
  const modalBodyClassName = isOnboarding ? "onboarding-modal modal-body fade-in text-center" : "modal-body";

  return (
    <div className={showHideClassName} id={id}>
      <div className="modal-dialog">
        <div className={modalContentClassName}>
          <div className={showHeaderClassName}>
            <h3 className="modal-title"defaultValue={"modalTitle"}>{modalTitle}</h3>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              aria-controls={id}
            />
          </div>
          <div className={modalBodyClassName}>{modalBody}</div>
          <div className="modal-footer">{modalFooter}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal;