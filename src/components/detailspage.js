import React, { useEffect, useState } from "react";
import "../styles/detailspage.css";
import logo from "../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useAuth} from '../services/AuthContext'; 

const Detailspage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const event = location.state?.event;
  const username = location.state?.username || authUser?.username; 
  const [isInsured, setIsInsured] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  useEffect(() => {
    const fetchUserEventStatus = async () => {
      if (!username || !event?.title) return;
  
      try {
        const { data: insuranceData, error: insuranceError } = await supabase
          .from('insurance_events')
          .select('*')
          .eq('username', username)
          .eq('event_name', event.title);
  
        if (insuranceError) throw insuranceError;
        setIsInsured(insuranceData.length > 0);
  
        const { data: savedData, error: savedError } = await supabase
          .from('saved_events')
          .select('*')
          .eq('username', username)
          .eq('event_name', event.title);
  
        if (savedError) throw savedError;
        setIsRegistered(savedData.length > 0);
      } catch (error) {
        console.error('Error fetching event status:', error);
      }
    };
  
    fetchUserEventStatus();
  }, [event?.title, username]);  

  useEffect(() => {
    const checkStatus = async () => {
      if (!event || !username) return;

      const { data: registered } = await supabase
        .from("registered_events")
        .select()
        .eq("username", username)
        .eq("event_name", event.title)
        .maybeSingle();

      if (registered) {
        setIsRegistered(true);
        setCheckboxChecked(true);
      }

      const { data: insured } = await supabase
        .from("insurance_events")
        .select()
        .eq("username", username)
        .eq("event_name", event.title)
        .maybeSingle();

      if (insured) {
        setIsInsured(true);
      }
    };

    if (event) checkStatus();
  }, [event]);

  useEffect(() => {
    const checkSaveandRegisterScreenStatus = async () => {
      if (!event || !username) return;
  
      try {
        const { data: registered, error: regError } = await supabase
          .from("registered_events")
          .select()
          .eq("username", username)
          .eq("event_name", event.event_name)
          .maybeSingle();
  
        if (regError) throw regError;
        if (registered) {
          setIsRegistered(true);
          setCheckboxChecked(true);
        }
  
        const { data: insured, error: insError } = await supabase
          .from("insurance_events")
          .select()
          .eq("username", username)
          .eq("event_name", event.event_name)
          .maybeSingle();
  
        if (insError) throw insError;
        if (insured) {
          setIsInsured(true);
        }
      } catch (error) {
        console.error("Error checking event registration/insurance status:", error);
      }
    };
  
    if (event?.event_name && username) {
      checkSaveandRegisterScreenStatus();
    }
  }, [event, username]);

  const handleRegister = async () => {
    if (!event || !username) {
      toast.error("Missing user or event info");
      return;
    }

    const { error } = await supabase.from("registered_events").insert({
      username: username,
      event_name: event.title,
      event_location: event.location || '',
      event_date_from: event.start_date || '',
      event_date_to: event.start_date || '',
      description: event.description || '',
      event_link: event.link || '',
      image: event.image_url || '',
    });

    if (!error) {
      setIsRegistered(true);
      setCheckboxChecked(true);
      toast.success("Registered successfully!");
    } else {
      toast.error("❌ Registration failed");
    }
  };

  const handleUnregister = async () => {
    if (!event || !username) return;

    const { error } = await supabase
      .from("registered_events")
      .delete()
      .eq("username", username)
      .eq("event_name", event.title);

    if (!error) {
      setIsRegistered(false);
      setCheckboxChecked(false);
      toast.info("❌ Registration removed");
    }
  };

  const handleInsurance = async () => {
    if (!event || !username) return;

    const { data: existing } = await supabase
      .from("insurance_events")
      .select()
      .eq("username", username)
      .eq("event_name", event.title)
      .maybeSingle();

    const { error } = await supabase.from("insurance_events").insert({
      username: username,
      event_name: event.title,
      event_location: event.location || '',
      event_date_from: event.start_date || '',
      event_date_to: event.start_date || '',
      description: event.description || '',
      event_link: event.link || '',
      image: event.image_url || '',
    });

    if (!error) {
      setIsInsured(true);
      toast.success("✅ Insurance applied!");
      
    } else {
      toast.error("❌ Insurance failed");
    }
  };

  const handleUninsure = async () => {
    if (!event || !username) return;

    const { error } = await supabase
      .from("insurance_events")
      .delete()
      .eq("username", username)
      .eq("event_name", event.title);

    if (!error) {
      setIsInsured(false);
      toast.info("❌ Insurance removed");
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date)) return null;

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year}`;
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date)) return null;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleGoBack = () => {
    navigate('/events', {
      state: {
        username: username,
      },
    });
  };

  if (!event) {
    return (
      <div className="details-container">
        <h2>⚠️ No event data found.</h2>
        <button className="btn red" onClick={() => navigate("/events")}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-top-curve">
      <h2 className='back-text-detail'  onClick={handleGoBack} style={{ cursor: 'pointer' }} > <span style={{ fontSize: '30px',marginRight:'5px',fontWeight:'700'}}>&#8592;</span>
      Back to events</h2>
      </div>
  
      <div className="top-header">
        <div className="header-inner">
          <h1 className="event-title1">{event.title||event.event_name}</h1>
        </div>
      </div>
  
      <div className="button-group-and-checkbox">
        <div className="button-checkbox-pair">
          <button
            className={isRegistered ? "btn green" : "btn red"}
            onClick={() => {
              if (event.link) {
                window.open(event.link, "_blank");
              }
            }}
          >
            {isRegistered ? "Registered" : "Register"}
          </button>
          <label className="checkbox-label-inline">
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  handleRegister();
                } else {
                  handleUnregister();
                }
              }}
            />
            <span >Check if you have registered</span>
          </label>
        </div>
  
        <div className="button-checkbox-pair">
          <button
            className={isInsured ? "btn green" : "btn black"}
            onClick={() => {
              window.open(
                "https://www.palcanada.com/index.php/en-us/policies/event-participants",
                "_blank"
              );
            }}
          >
            {isInsured ? "Insured" : "Event Insurance"}
          </button>
          <label className="checkbox-label-inline">
            <input
              type="checkbox"
              checked={isInsured}
              onChange={(e) => {
                if (e.target.checked) {
                  handleInsurance();
                } else {
                  handleUninsure();
                }
              }}
            />
            <span>Check if you have insured</span>
          </label>
        </div>
      </div>
  
      <div className="details-content">
        <div className="details-flex-wrapper">
          <div className="info-section">
            <p>
              <strong>Website Link:</strong>
              <br />
              <a href={event.link||event.event_link} target="_blank" rel="noreferrer">
                {event.link||event.event_link}
              </a>
            </p>
            <p>
              <strong>Location:</strong> {event.location||event.event_location || "Not available"}
            </p>
            <p>
            <strong>Date and Time:</strong>{' '}
            {event.start_date || event.event_date_from ? (
              <>
                {formatEventDate(event.start_date || event.event_date_from)} ·{' '}
                {formatEventTime(event.start_date || event.event_date_from)}{' '}
                {event.timezone || ''}
              </>
            ) : (
              'Not available'
            )}
          </p>

            <p>
              <strong>About this event:</strong>{" "}
              {event.description || "No description available."}
            </p>
          </div>
  
          <div className="image-section">
            <img src={event.image_url||event.image} alt="Event" className="event-image1" />
          </div>
        </div>
      </div>
  
      <footer className="details-footer">
        <p>EventEaze©</p>
      </footer>
  
      <img src={logo} alt="Logo" className="bottom-right-logo" />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default Detailspage;
