import { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import ScanningPage from "./ScanningPage";
import ResultPage from "./ResultPage";
import OnboardingComponent from "./Onboarding/OnboardingComponent";
import ConnectionNotification from "./ConnectionNotification";
import services from "../services";
import "./MainWindow.css";


const MainWindow = ({ appVersion }) => {
  const [completedScanId, setCompletedScanId] = useState(null);
  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [userInputErrorMessage, setUserInputErrorMessage] = useState('');
  const [dataExistStatus, setDataExistStatus] = useState(null);

  useEffect(() => {
    window.services.userDataExists((status) => {
      setDataExistStatus(status)
    })
  }, []);

  const handleSetUserData =  (event) =>  {
    event.preventDefault();

    console.log(event.target);
    
    if (!services.isValidEmail(email)) {
      setUserInputErrorMessage('Please enter a valid email.'); 
      return;
    }

    window.services.setUserData({name: name, email: email});
    setDataExistStatus("exists");
  }

  if (dataExistStatus === "doesNotExist") {
    return (
      <OnboardingComponent 
        handleSetUserData={handleSetUserData} 
        name={name}
        email={email}
        setName={setName}
        setEmail={setEmail}
        userInputErrorMessage={userInputErrorMessage}
        setUserInputErrorMessage={setUserInputErrorMessage}
      />
    )
  }

  if (dataExistStatus === "exists") {
    return (
      <>
        <ConnectionNotification />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  appVersion={appVersion}
                  setCompletedScanId={setCompletedScanId}
                />
              }
            />
            <Route path="/scanning" element={<ScanningPage />} />
            <Route
              path="/result"
              element={<ResultPage completedScanId={completedScanId} />}
            />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </Router>
      </>
    );
  }

  return null;
}


export default MainWindow;
