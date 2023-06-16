import { useState } from "react";
import services from "../../services";
import { policyUrlElem } from "../../common/constants";
import Modal from "../../common/components/Modal"; 
import UserDetailsForm from "../../common/components/UserDetailsForm";

const EditUserDetailsModal = ({
    formID,
    showModal,
    initialName,
    initialEmail,
    setShowEditDataModal,
}) => {
    const [userInputErrorMessage, setUserInputErrorMessage] = useState('');
    const [editedName, setEditedName] = useState(initialName); 
    const [editedEmail, setEditedEmail] = useState(initialEmail);
    
    const isSubmitDisabled = editedName.trim() === "" || editedEmail.trim() === ""
                                || (editedName === initialName && editedEmail === initialEmail); 
    
    const handleEditUserData = (e) => {
        e.preventDefault(); 

        if (!services.isValidEmail(editedEmail)) {
          setUserInputErrorMessage('Please enter a valid email.'); 
          return;
        }
    
        window.services.editUserData({name: editedName, email: editedEmail}); 
        setShowEditDataModal(false);
      }  

    return (
        <Modal
            showModal={showModal}
            showHeader={true}
            modalTitle={"Edit Form"}
            modalBody={
                <>
                    <UserDetailsForm
                        formID={formID}
                        name={editedName}
                        email={editedEmail}
                        setName={setEditedName}
                        setEmail={setEditedEmail}
                        handleOnSubmit={handleEditUserData}
                        userInputErrorMessage={userInputErrorMessage}
                        isSubmitDisabled={isSubmitDisabled}
                    />
                    <p>We are collecting your name, email address and app usage data. Your information fully complies with {policyUrlElem}.</p>
                </>
            }
            modalFooter = {
                <button
                type="submit"
                form={formID}
                className="primary modal-button"
                disabled={isSubmitDisabled}
              >
                Update
              </button>
            }
            setShowModal={setShowEditDataModal}
        />
    )
}

export default EditUserDetailsModal;