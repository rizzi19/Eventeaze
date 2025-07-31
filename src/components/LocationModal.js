import '../styles/LocationModal.css';
import React, { useState } from 'react';

const LocationModal = ({ onDetect, onSkip }) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    setIsDetecting(true);

    if (!navigator.geolocation) {
      alert("❌ Your browser does not support location access.");
      onSkip();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const apiKey = 'e45bf80799034bb9845540244bebc478'; 
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

          const res = await fetch(url);
          const data = await res.json();

          const components = data?.results?.[0]?.components;
          const detectedCity = components.city || components.town || components.state || '';

          if (detectedCity) {
            onDetect(detectedCity);
          } else {
            alert("❌ Could not determine city from location.");
            onSkip();
          }
        } catch (error) {
          console.error("❌ Error while fetching city:", error);
          onSkip();
        }
      },
      (error) => {
        console.error("❌ Geolocation error:", error.message);
        alert("⚠️ Location permission denied or failed.");
        onSkip();
      }
    );
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        {!isDetecting ? (
          <>
            <h3>Allow Eventeaze to access your location?</h3>
            <p>We’ll use your location to show nearby vendor events.</p>
            <div className="location-modal-buttons">
              <button className="allow-button" onClick={handleDetectLocation}>Yes, Detect Location</button>
              <button className="skip-button" onClick={onSkip}>No, I’ll Choose Manually</button>
            </div>
          </>
        ) : (
          <div className="detecting">
            <p>🔍 Detecting your location...</p>
            <div className="loader" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
