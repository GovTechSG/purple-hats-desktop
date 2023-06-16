const UserDetailsForm = ({
    formID, 
    name,
    email,
    setName, 
    setEmail,
    handleOnSubmit,
    userInputErrorMessage,
}) => {
    return (
        <div className="user-form">
            <form id={formID} onSubmit={(e) => handleOnSubmit(e)}>
                <div className="user-form-field">
                    <label className="user-form-label" for="name">Name</label>
                    <input className="user-form-input" type="text" id="name" defaultValue={name} onChange={(e) => setName(e.target.value)}></input>
                </div>
                <div className="user-form-field">
                    <label className="user-form-label" for="email">Work Email</label>
                    <input className="user-form-input" type="text" id="email" defaultValue={email} onChange={(e) => setEmail(e.target.value)}></input>
                </div>
                <div className="user-form-error error-text">{userInputErrorMessage}</div>
            </form>
        </div>
    );
}

export default UserDetailsForm;