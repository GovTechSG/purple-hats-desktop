// const { ipcRenderer } = require("electron");

// window.addEventListener("DOMContentLoaded", () => {
//   const observer = new MutationObserver(() => {
//     const elements = Array.from(document.getElementsByTagName("p"));
//     elements.forEach((e) => {
//       if (e.innerText.startsWith("Response ID: ")) {
//         document.getElementsByTagName("label")[0].innerHTML =
//           "How was your experience with Purple HATS?";
//         ipcRenderer.send("userDataFormSubmitted");
//         observer.disconnect();
//       }
//     });
//   });

//   observer.observe(document.getElementById("root"), {
//     subtree: true,
//     childList: true,
//   });
// });
