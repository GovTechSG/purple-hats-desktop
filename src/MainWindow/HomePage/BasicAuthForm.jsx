import React from "react";

export const BasicAuthForm = ({ handleBasicAuthSubmit }) => {
  return (
    <div className="user-form">
      <form
        id="home-page-basic-auth-form"
        onSubmit={(e) => handleBasicAuthSubmit(e)}
      >
        <div className="user-form-field">
          <label className="user-form-label" htmlFor="username">
            Username
          </label>
          <input
            className="user-form-input"
            type="text"
            id="username"
            name="username"
          />
        </div>
        <div className="user-form-field">
          <label className="user-form-label" htmlFor="password">
            Password
          </label>
          <input
            className="user-form-input"
            type="password"
            id="password"
            name="password"
          />
        </div>
      </form>
    </div>
  );
};

export const BasicAuthFormFooter = ({ setShowBasicAuthModal }) => {
  return (
    <>
      <button
        className="button secondary"
        aria-controls="basic-auth-modal"
        onClick={() => setShowBasicAuthModal(false)}
      >
        Close
      </button>
      <button
        form="home-page-basic-auth-form"
        className="button primary"
        type="submit"
      >
        Scan
      </button>
    </>
  );
};
