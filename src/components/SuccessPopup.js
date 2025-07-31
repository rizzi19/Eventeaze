import React from 'react';

const SuccessPopup = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="checkmark-circle">
          <div className="checkmark">✓</div>
        </div>
        <h2 style={{color:'black'}}>Success</h2>
        <p style={{color:'black'}}>Verification email sent successfully !!</p>
        <button className="ok-button" onClick={onClose}>Ok</button>
      </div>
    </div>
  );
};

export default SuccessPopup;
