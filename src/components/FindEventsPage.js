import React, { useEffect, useState, useMemo } from 'react';
import '../styles/FindEventsPage.css';
import logo from '../assets/logo.png';
import homeIcon from '../assets/icons/home.png';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa'; // outline & filled
import { FaMapMarkerAlt, FaRegCalendarAlt } from 'react-icons/fa';
import locationIcon from '../assets/icons/location.png';
import event1 from '../assets/icons/event1.jpg';
import { fetchEvents as fetchFromGoogle} from '../services/fetchEvents';
import { supabase } from '../services/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileSection from './ProfileSection';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LocationModal from '../components/LocationModal';
import {useAuth} from '../services/AuthContext'; 

function extractDate(text) {
  if (!text) return null;
  const formats = [
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}/i,
    /\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?),?\s+\d{4}/i,
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
  ];
  for (const regex of formats) {
    const match = text.match(regex);
    if (match) {
      const dateStr = match[0];
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate)) return parsedDate;
    }
  }
  return null;
}

const EVENTS_PER_PAGE = 8;

const FindEventsPage = () => {
  const { authUser } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const email = routerLocation.state?.email || authUser?.email;
  const username = routerLocation.state?.username || authUser?.username; 

  const initialLocationModalState = localStorage.getItem("locationSelected") === "true" ? false : true;
  const [showLocationModal, setShowLocationModal] = useState(initialLocationModalState);
  const categories = useMemo(() => {
    return routerLocation.state?.categories ||
          JSON.parse(localStorage.getItem('selectedCategories')) ||
          [];
  }, [routerLocation.state?.categories]);

  const [location, setLocation] = useState(
    localStorage.getItem('selectedCity'));

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
  
    const [searching, setSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('events');
    const [savedEventIds, setSavedEventIds] = useState(new Set());
    const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
    const [insuredEventIds, setInsuredEventIds] = useState(new Set());

    // If no categories passed via router, try reading from localStorage

   // Location dropdown data
   const [countries, setCountries] = useState([]);
   const [states, setStates] = useState([]);
   const [cities, setCities] = useState([]);
 
   const [selectedCountry, setSelectedCountry] = useState('');
   const [selectedState, setSelectedState] = useState('');

   
   // Fetch all countries and their states on mount
   useEffect(() => {
     fetch('https://countriesnow.space/api/v0.1/countries/states')
       .then((res) => res.json())
       .then((data) => setCountries(data.data))
       .catch(console.error);
   }, []);
 
   // Load states when country changes
   useEffect(() => {
     setStates([]);
     setSelectedState('');
     setCities([]);
     setLocation('');
 
     if (selectedCountry) {
       const countryData = countries.find((c) => c.name === selectedCountry);
       if (countryData) {
         setStates(countryData.states || []);
       }
     }
   }, [selectedCountry]);
 
   // Load cities when state changes
   useEffect(() => {
     setCities([]);
     setLocation('');
 
     if (selectedCountry && selectedState) {
       fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           country: selectedCountry,
           state: selectedState,
         }),
       })
         .then((res) => res.json())
         .then((data) => {
           if (data.data) {
             setCities(data.data);
           }
         })
         .catch(console.error);
     }
   }, [selectedState]);
 
   // Save location (city) to localStorage when updated
   useEffect(() => {
     if (location) {
       localStorage.setItem('selectedCity', location);
     }
   }, [location]);

   
  const [dateFilters, setDateFilters] = useState({
    week: false,
    month: false,
    year: false,
  });
  
  
  const handleGoBack = () => {
    navigate('/find-events', {
      state: {
        categories: categories,
        username: username,
        email: email,
      },
    });
  };

 const handleDetect = (detectedCity) => {
  setLocation(detectedCity); // 👈 Updates selected <option>
  toast.success(`📍 Location detected: ${detectedCity}`);
  setShowLocationModal(false);
  localStorage.setItem("locationSelected", "true");
  localStorage.setItem("selectedCity", detectedCity); // Persist city
};

  
  
  const handleSkip = () => {
    toast.info("📍 You can manually choose a city from the dropdown.");
    setShowLocationModal(false);
    localStorage.setItem("locationSelected", "true");
  };
  
  useEffect(() => {
    if (!username) return;
  
    const fetchUserEventStatus = async () => {
      try {
        // Fetch Registered Events
        const { data: registeredData, error: regError } = await supabase
          .from('registered_events')
          .select('event_link')
          .eq('username', username);
  
        if (regError) throw regError;
        setRegisteredEventIds(new Set(registeredData.map((e) => e.event_link)));
  
        // Fetch Insured Events
        const { data: insuredData, error: insError } = await supabase
          .from('insurance_events')
          .select('event_link')
          .eq('username', username);
  
        if (insError) throw insError;
        setInsuredEventIds(new Set(insuredData.map((e) => e.event_link)));
  
        console.log('✅ Registered & insured events loaded');
      } catch (err) {
        console.error('❌ Error fetching event statuses:', err.message);
      }
    };
  
    fetchUserEventStatus();
  }, [username]);
  

  useEffect(() => {
    const fetchSavedEventIds = async () => {
      if (!username) return;
  
      const { data, error } = await supabase
        .from('saved_events')
        .select('event_link')
        .eq('username', username);
  
      if (!error && data) {
        const ids = new Set(data.map((e) => e.event_link));
        setSavedEventIds(ids);
        console.log("🔄 Updated savedEventIds", ids);
      } else {
        console.error("❌ Error loading saved event links:", error?.message);
      }
    };
  
    fetchSavedEventIds();
  }, [username]);
  

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const apiResults = [];
        const apiKey = 'AIzaSyA1Jzs7jWw2IPwyU1sIVWEUG31ZVvY6MQY';
        const cx = '0344923418c0b4735';
  
        const now = new Date();
        let futureDate = new Date();
  
        // Determine future date based on selected filter
        if (dateFilters.threeMonths) {
          futureDate.setMonth(now.getMonth() + 3);
        } else if (dateFilters.sixMonths) {
          futureDate.setMonth(now.getMonth() + 6);
        } else if (dateFilters.oneYear) {
          futureDate.setFullYear(now.getFullYear() + 1);
        } else {
          futureDate = null;
        }
  
        // Create date range for query
        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
        const dateRange =
          futureDate !== null
            ? ` between ${monthFormatter.format(now)} and ${monthFormatter.format(futureDate)} ${futureDate.getFullYear()}`
            : '';
  
        for (const category of categories) {
          const query = `${category} event vendor registration in ${location}${dateRange}`;
          const encodedQuery = encodeURIComponent(query);
  
          const res = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodedQuery}`
          );
          const data = await res.json();
  
          if (data.items) {
            apiResults.push(
              ...data.items.map((item) => {
                const parsedDate = extractDate(item.snippet);
                console.log('📅 Parsed date:', parsedDate, '| Title:', item.title);
  
                return {
                  id: item.cacheId || item.link,
                  title: item.title,
                  link: item.link,
                  location,
                  image_url: item.pagemap?.cse_image?.[0]?.src || null,
                  start_date: parsedDate,
                  description: item.snippet,
                };
              })
            );
          }
        }
  
        setEvents(apiResults);
      } catch (err) {
        console.error('❌ Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (categories.length > 0) {
      loadEvents();
    } else {
      setLoading(false);
    }
  }, [categories, location, dateFilters]);
  

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setCurrentPage(1);
    try {
      await fetchFromGoogle([searchTerm], location);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const toggleSaveEvent = async (event) => {
    const isSaved = savedEventIds.has(event.link);
    console.log('Toggle Save:', { isSaved, link: event.link });
  
    if (!event.link || !event.title) {
      toast.error('Event data is missing required fields');
      console.warn('Event object is invalid:', event);
      return;
    }
  
    if (isSaved) {
      const { error } = await supabase
        .from('saved_events')
        .delete()
        .eq('event_link', event.link)
        .eq('username', username);
  
      if (error) {
        toast.error('Failed to unsave event');
        console.error('Unsave error:', error);
      } else {
        toast.info('Event removed from saved');
        setSavedEventIds((prev) => {
          const updated = new Set(prev);
          updated.delete(event.link);
          return updated;
        });
      }
    } else {
      const { error } = await supabase.from('saved_events').insert([
        {
          username: username,
          event_name: event.title,
          event_link: event.link,
          image: event.image_url || null,
          description: event.description || null,
          event_location: event.location || null,
          event_date_from: event.start_date?.toISOString() || null,
          event_date_to: null,
        },
      ]);
  
      if (error) {
        toast.error('Failed to save event');
        console.error('Insert error:', error);
      } else {
        toast.success('Event saved!');
        setSavedEventIds((prev) => new Set(prev).add(event.link));
      }
    }
  };
     
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchTerm.trim()
      ? (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         event.description?.toLowerCase()?.includes(searchTerm.toLowerCase()))
      : true;
  
    const eventDate = event.start_date ? new Date(event.start_date) : null;
    const now = new Date();
  
    let matchesDate = !dateFilters.threeMonths && !dateFilters.sixMonths && !dateFilters.oneYear;
  
    if ((dateFilters.threeMonths || dateFilters.sixMonths || dateFilters.oneYear) && !eventDate) {
      matchesDate = false; // If event has no date, exclude it when a filter is active
    } else if (eventDate) {
      if (dateFilters.threeMonths) {
        const later = new Date();
        later.setMonth(now.getMonth() + 3);
        matchesDate = eventDate >= now && eventDate <= later;
      }
  
      if (dateFilters.sixMonths) {
        const later = new Date();
        later.setMonth(now.getMonth() + 6);
        matchesDate = eventDate >= now && eventDate <= later;
      }
  
      if (dateFilters.oneYear) {
        const later = new Date();
        later.setFullYear(now.getFullYear() + 1);
        matchesDate = eventDate >= now && eventDate <= later;
      }
    }
  
    return matchesSearch && matchesDate;
  });
  
  
  

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );
  

  return (
    <>
      <div className="find-events-page">
        <div className="top-bar">
          <div className="top-left">
          <div
            className="home-box"
             onClick={() => navigate("/home")}
               style={{ cursor: "pointer" }}
              >
             <div className="home-container">
              <img src={homeIcon} alt="Home" className="home-icon" />
              <span className="home-text">Home</span>
            </div>

              </div>

            <div className="welcome-location-combo">
              <div className="location-box">
                <img src={locationIcon} alt="Location" className="location-icon" />
       {/* Country Dropdown */}
<select
  className="country-selector"
  value={selectedCountry}
  onChange={(e) => setSelectedCountry(e.target.value)}
>
  <option value="">Select Country</option>
  {countries.map((country, i) => (
    <option key={i} value={country.name}>
      {country.name}
    </option>
  ))}
</select>

{/* State Dropdown (Always Visible) */}
<div className="select-with-icon">
  <select
    className="state-selector"
    value={selectedState || location}
    onChange={(e) => setSelectedState(e.target.value) || setLocation(e.target.value)}
    disabled={!states.length}
  >
    <option value="">Select State</option>
    {states.length ? (
      states.map((state, i) => (
        <option key={i} value={state.name}>
          {state.name}
        </option>
      ))
    ) : (
      <option disabled>No states found</option>
    )}
  </select>
</div>

{/* City Dropdown (Always Visible) */}
<div className="select-with-icon">
  <select
    className="city-selector"
    value={location}
    onChange={(e) => {
      setLocation(e.target.value);
      localStorage.setItem("selectedCity", e.target.value);
    }}
    disabled={!cities.length}
  >
    <option value="">Select City</option>
    {cities.length ? (
      cities.map((city, i) => (
        <option key={i} value={city}>
          {city}
        </option>
      ))
    ) : (
      <option disabled>No cities found</option>
    )}
  </select>
</div>

              </div>
            </div>
          </div>

          <div className="top-center">
            <div className="search-bar-inline">
              <input
                type="text"
                placeholder="Search event name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="search-button"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="top-right">
  <button
    className={`tab ${activeTab === 'events' ? 'active' : ''}`}
    onClick={() => setActiveTab('events')}
  >
    Events
  </button>
  <button
    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
    onClick={() => setActiveTab('saved')}
  >
    Saved
  </button>
  <button
    className={`tab ${activeTab === 'registered' ? 'active' : ''}`}
    onClick={() => setActiveTab('registered')}
  >
    Registered
  </button>
  <button
    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
    onClick={() => setActiveTab('profile')}
  >
    Profile
  </button>
</div>

        </div>

        <div className="content-area">
          <div className="filter-sidebar">
          <h2 className='back-text'  onClick={handleGoBack} style={{ cursor: 'pointer' }} > <span style={{ fontSize: '30px',marginRight:'5px',fontWeight:'700'}}>&#8592;</span>
          Go Back</h2>
            <h3>Filters</h3>
            
            <div className="filter-group">
            <strong>Date</strong>
<label>
  <input
    type="checkbox"
    checked={dateFilters.threeMonths}
    onChange={() =>
      setDateFilters((prev) => ({
        threeMonths: !prev.threeMonths,
        sixMonths: false,
        oneYear: false,
      }))
    }
  />{' '}
  Next 3 Months
</label>
<label>
  <input
    type="checkbox"
    checked={dateFilters.sixMonths}
    onChange={() =>
      setDateFilters((prev) => ({
        threeMonths: false,
        sixMonths: !prev.sixMonths,
        oneYear: false,
      }))
    }
  />{' '}
  Next 6 Months
</label>
<label>
  <input
    type="checkbox"
    checked={dateFilters.oneYear}
    onChange={() =>
      setDateFilters((prev) => ({
        threeMonths: false,
        sixMonths: false,
        oneYear: !prev.oneYear,
      }))
    }
  />{' '}
  Next 1 Year
</label>
</div>
</div>


          {activeTab === 'events' && (
            <div className="event-grid">
             {
             loading ? (
    <div className="empty-state">Loading events...</div>
  ) : paginatedEvents.length === 0 ? (
    <div className="empty-state">No events found</div>
  ) :  (
  paginatedEvents.map((event, index) => 
    {
      const isRegistered = registeredEventIds.has(event.link);
      const isInsured = insuredEventIds.has(event.link);
    
      return (
        <div
        className="event-card"
        key={event.id || index}
        onClick={() => navigate('/Detailspage', { state: { event, username} })}
      >
        <div className="image-wrapper">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="event-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex'; // Show fallback
              }}
            />
          ) : null}
      
          <div
            className="image-placeholder"
            style={{
              display: event.image_url ? 'none' : 'flex',
              backgroundColor: '#741616',
              height: '160px',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            No Image Available
          </div>
      
          <button
            className="details-overlay1"
            onClick={(e) => {
              e.stopPropagation(); 
              navigate('/Detailspage', { state: { event, username} });
            }}
          >
            See Details
          </button>
        
          {savedEventIds.has(event.link) ? (
        <FaBookmark
          className="bookmark-icon saved"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveEvent(event);
          }}
          title="Saved"
        />
      ) : (
        <FaRegBookmark
          className="bookmark-icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveEvent(event);
          }}
          title="Save"
        />
      )}

      </div>
      <div className="event-details">
        <div className="event-title" style={{ paddingBottom:'5px'}}>{event.title}</div>
        <div className="event-location" style={{ paddingBottom:'5px'}}>
          <FaMapMarkerAlt style={{ marginRight: '6px', color: '#741616' }} />
          {event.location}
        </div>

        <div className="event-date">
          <FaRegCalendarAlt style={{ marginRight: '6px', color: '#741616' }} />
          {event.start_date
            ? new Date(event.start_date).toDateString()
            : 'Date not available'}
        </div>
        <div className="event-badges right-align" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
        {isRegistered && (
          <span className="badge registered-badge">Registered</span>
        )}
        {isInsured && (
          <span className="badge insured-badge">Insured</span>
        )}
      </div>

 </div>
    </div>
  )})
)}

            </div>
          )}

          {activeTab === 'saved' && (
            <div className="event-grid">
              {username ? (
                <SavedEvents username={username} />
              ) : (
                <div className="empty-state">Loading saved events...</div>
              )}
            </div>
          )}

          {activeTab === 'registered' && (
            <div className="event-grid">
              {username ? (
                <RegisteredEvents username={username} />
              ) : (
                <div className="empty-state">Loading registered events...</div>
              )}
            </div>
          )}
        </div>
      </div>
      
 {/* Add this div inside your footer */}
 {activeTab === 'events' && (
    <div className="pagination-footer-right">
      {Array.from({ length: Math.ceil(filteredEvents.length / EVENTS_PER_PAGE) }, (_, i) => (
        <button
          key={i}
          className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )}
      <div className="footer">
  <img src={logo} alt="EventEaze Logo" className="footer-logo" />
</div>


      {activeTab === 'profile' && (
        <ProfileSection
          username={username}
          email={email}
          onClose={() => setActiveTab('events')}
          isVisible={true}
        />
      )}
     
     {showLocationModal && (
        <LocationModal
          onDetect={handleDetect}
          onSkip={handleSkip}
        />
      )}


      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};


const SavedEvents = () => {
    const { authUser } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const email = routerLocation.state?.email || authUser?.email;
  const username = routerLocation.state?.username || authUser?.username; 

  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchSaved = async () => {
      console.log("🧪 Fetching saved events for:", username);
  
      const { data, error } = await supabase
        .from('saved_events')
        .select('*')
        .eq('username',username);
  
      if (error) {
        console.error("❌ Error fetching saved events:", error.message);
      } else {
        console.log("✅ Saved events loaded:", data.length);
        setSaved(data);
      }
  
      setLoading(false);
    };
  
    if (username) {
      fetchSaved();
    }
  }, [username]);
  

  if (loading) return <div className="empty-state">Loading saved events...</div>;
  if (!saved.length) return <div className="empty-state">No saved events found</div>;

  return saved.map((event, index) => (
    <div className="event-card" key={event.id || index}  onClick={() => navigate('/Detailspage', { state: { event,username}})}>
      <div className="image-wrapper">
        <img src={event.image || event1} alt={event.event_name} className="event-image" />
        <button
          className="details-overlay"
          onClick={() => navigate('/Detailspage', { state: { event, username} })}
        >
          See Details
        </button>
        <FaBookmark
          className="bookmark-icon saved"
          title="Saved"
          onClick={(e) => {
            e.stopPropagation();}}
        />
      </div>
      <div className="event-details">
        <div className="event-title" style={{ paddingBottom:'5px'}}>{event.event_name}</div>
        <div className="event-location" style={{ paddingBottom:'5px'}}>
        <FaMapMarkerAlt style={{ marginRight: '6px' , color:'#741616' }} />
          {event.event_location}
          </div>
        <div className="event-date">
        <FaRegCalendarAlt style={{ marginRight: '6px', color:'#741616' }} />
          {event.event_date_from
            ? new Date(event.event_date_from).toDateString()
            : 'Date not available'}
        </div>
      </div>
    </div>
  ));
};

const RegisteredEvents = () => {
  const { authUser } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const email = routerLocation.state?.email || authUser?.email;
  const username = routerLocation.state?.username || authUser?.username;

  const [registered, setRegistered] = useState([]);
  const [insured, setInsured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [insuredEventIds, setInsuredEventIds] = useState(new Set());

  useEffect(() => {
    if (!username) return;

    const fetchUserEventStatus = async () => {
      try {
        const { data: registeredData, error: regError } = await supabase
          .from('registered_events')
          .select('event_link')
          .eq('username', username);

        if (regError) throw regError;

        setRegisteredEventIds(
          new Set(registeredData.map((e) => (e.event_link || '').trim().toLowerCase()))
        );

        const { data: insuredData, error: insError } = await supabase
          .from('insurance_events')
          .select('event_link')
          .eq('username', username);

        if (insError) throw insError;

        setInsuredEventIds(
          new Set(insuredData.map((e) => (e.event_link || '').trim().toLowerCase()))
        );

        console.log('✅ Registered & insured event links loaded');
      } catch (err) {
        console.error('❌ Error fetching event statuses:', err.message);
      }
    };

    fetchUserEventStatus();
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);

      const [registeredRes, insuredRes] = await Promise.all([
        supabase.from('registered_events').select('*').eq('username', username),
        supabase.from('insurance_events').select('*').eq('username', username),
      ]);

      if (!registeredRes.error) setRegistered(registeredRes.data || []);
      if (!insuredRes.error) setInsured(insuredRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [username]);

  if (loading) return <div className="empty-state">Loading registered / insured events...</div>;

  if (!registered.length && !insured.length)
    return <div className="empty-state">No registered or insured events found</div>;

  // Combine registered and insured arrays to get unique event_links
  const combinedEventsMap = new Map();

  registered.forEach((event) => {
    combinedEventsMap.set(event.event_link.trim().toLowerCase(), event);
  });

  insured.forEach((event) => {
    const key = event.event_link.trim().toLowerCase();
    if (!combinedEventsMap.has(key)) {
      combinedEventsMap.set(key, event);
    }
  });

  const combinedEvents = Array.from(combinedEventsMap.values());

  return (
    <>
      {combinedEvents.map((event, index) => {
        const normalizedLink = (event.event_link || '').trim().toLowerCase();
        const isRegistered = registeredEventIds.has(normalizedLink);
        const isInsured = insuredEventIds.has(normalizedLink);

        return (
          <div
            className="event-card"
            key={event.id || index}
            onClick={() => navigate('/Detailspage', { state: { event, username } })}
            style={{ cursor: 'pointer' }}
          >
            <div className="image-wrapper">
              <img
                src={event.image || event1}
                alt={event.event_name}
                className="event-image"
              />
              <button
                className="details-overlay"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent onClick triggering
                  navigate('/Detailspage', { state: { event, username } });
                }}
              >
                See Details
              </button>
            </div>
            <div className="event-details">
              <div className="event-title" style={{ paddingBottom: '5px' }}>
                {event.event_name}
              </div>
              <div className="event-location" style={{ paddingBottom: '5px' }}>
                <FaMapMarkerAlt style={{ marginRight: '6px', color: '#741616' }} />
                {event.event_location}
              </div>
              <div className="event-date">
                <FaRegCalendarAlt style={{ marginRight: '6px', color: '#741616' }} />
                {event.event_date_from
                  ? new Date(event.event_date_from).toDateString()
                  : 'Date not available'}
              </div>
              <div
                className="event-badges right-align"
                style={{ marginTop: '8px', display: 'flex', gap: '8px' }}
              >
                {/* Show badges according to status */}
                {isRegistered && !isInsured && (
                  <span className="badge registered-badge">Registered</span>
                )}
                {!isRegistered && isInsured && (
                  <span className="badge insured-badge">Insured</span>
                )}
                {isRegistered && isInsured && (
                  <>
                    <span className="badge registered-badge">Registered</span>
                    <span className="badge insured-badge">Insured</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FindEventsPage;
