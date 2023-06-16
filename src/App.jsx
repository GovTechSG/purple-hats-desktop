import React, { useEffect, useState } from "react";
import MainWindow from "./MainWindow";
import LaunchWindow from "./LaunchWindow";
import "./sgds.css"
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    window.services.guiReady();
  }, []);

  useEffect(() => {
    window.services.appStatus((s) => {
      setStatus(s);
    });
    window.services.getVersionNumber((res) => {
      setAppVersion(res);
    });
  }, []);

  if (status === "launch") {
    return <LaunchWindow />;
  }

  if (status === "ready") {
    return <MainWindow appVersion={appVersion} />;
  }

  return null;
}

export default App;
