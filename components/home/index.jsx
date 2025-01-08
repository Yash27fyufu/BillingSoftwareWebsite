import React from 'react';

import Sidebar from '../utils/widgets/SideBar/SideNavBar';

function Home  ()  {
  // useEffect(() => {
  //   // Define the custom keyboard shortcut
  //   const handleCustomShortcut = (event) => {

  //     // Check for the specific keyboard shortcut (e.g., Ctrl + Shift + X)
  //     if (event.ctrlKey && event.shiftKey && event.key === 'W') {
  //       // Perform your custom action here
  //       performCustomAction();
  //     }
  //   };

  //   // Add an event listener to the document
  //   document.addEventListener('keydown', handleCustomShortcut);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener('keydown', handleCustomShortcut);
  //   };
  // }, []);

  // // Define the custom action to be performed
  // const performCustomAction = () => {
  //   // Your custom action logic here
  // };



  return (
    <div className="home-body">
      <Sidebar />
    </div>
  );
};

export default Home;
