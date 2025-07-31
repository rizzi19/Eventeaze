import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import SetupProfile from './components/SetupProfile';
import FindEvents from './components/FindEvents';
import FindEventsPage from './components/FindEventsPage';
import Detailspage from './components/detailspage';
import PublishEvent from './components/PublishEvent';
import PayPal from './components/Paypal';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './services/AuthContext';
import PreloaderScreen from './components/preloader';
import './App.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomeLayout = () => (
  <div className="hero-bg">
    <Home />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/paypal" element={<PayPal amount={0.99} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/setup-profile" element={<SetupProfile />} />
          <Route path="/find-events" element={<FindEvents />} />
          <Route path="/events" element={<FindEventsPage />} />
          <Route path="/detailspage" element={<Detailspage />} />
          <Route path="/publish-event" element={<PublishEvent />} />
          <Route path="/home" element={<HomeLayout />} />
          <Route path="/" element={<PreloaderScreen/>}/>
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
