// PreloaderScreen.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ImagePreloader.css'; 
import img from '../assets/preloader.png';

const PreloaderScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // Replace '/home' with your target route
    }, 4000);

    return () => clearTimeout(timer); // cleanup
  }, [navigate]);

  return (
    <div className="image-preloader-container">
      <img src={img} alt="Loading..." className="preloader-image" />
    </div>
  );
};

export default PreloaderScreen;
