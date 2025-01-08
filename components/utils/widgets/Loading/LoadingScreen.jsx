import React from 'react';

export default function LoadingScreen({ backgroundColor = 'rgba(0, 0, 0, 0.5)', message = 'Loading...', showSpinner = true }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    }}
    >

      <div className="loading_screen-content">
        <div className="loading_screen-loader">
          <span >L</span>
          <span >o</span>
          <span >a</span>
          <span >d</span>
          <span >i</span>
          <span >n</span>
          <span >g</span>
          <span >.</span>
          <span >.</span>
          <span >.</span>
        </div>
      </div>

    </div>


  );
}
