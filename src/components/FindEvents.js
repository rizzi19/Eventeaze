import React, { useEffect, useState, useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import '../styles/FindEvents.css';
import categories from '../data/categories';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../services/AuthContext';

const FindEvents = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [offerType, setOfferType] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuth();
  const email = location.state?.email || authUser?.email;
  const username = location.state?.username || authUser?.username;  
  const dropdownRef = useRef(null);

  const showToast = (message, success = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => {
      setToast({ show: false, message: '', success: true });
    }, 3000);
  };

  useEffect(() => {
    const initializeUser = async () => {
      if (!username || !email) {
        showToast('❌ Missing user info. Please log in again.', false);
        return;
      }

      const { data: savedCats, error: catError } = await supabase
        .from('user_categories')
        .select('category, business_type')
        .eq('username', authUser.username);

      if (catError) {
        console.error('❌ Error fetching saved categories:', catError.message);
        return;
      }

      if (savedCats && savedCats.length > 0) {
        const categoriesList = savedCats.map((item) => item.category);
        const typesSet = new Set(savedCats.map((item) => item.business_type).filter(Boolean));
        setSelectedCategories(categoriesList);
        setOfferType(typesSet.size === 1 ? [...typesSet][0] : 'Both');
      }
    };

    initializeUser();
  }, [username]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (category) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

  const removeCategory = (category) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== category));
  };

  const handleSubmitPreferences = async () => {
    try {
      if (!username || !email) {
        showToast('❌ Missing user info', false);
        return;
      }

      if (!offerType) {
        showToast('Please select what you offer.', false);
        return;
      }

      const { data: existingData, error: fetchError } = await supabase
        .from('user_categories')
        .select('category, business_type')
        .eq('username', username);

      if (fetchError) {
        console.error('❌ Error fetching existing categories:', fetchError.message);
        showToast('Error fetching your categories', false);
        return;
      }

      const existingMap = {};
      if (Array.isArray(existingData)) {
        existingData.forEach((item) => {
          existingMap[item.category] = item.business_type;
        });
      }

      const toDelete = Object.keys(existingMap).filter(
        (cat) => !selectedCategories.includes(cat)
      );

      const toInsert = selectedCategories
        .filter((cat) => !(cat in existingMap))
        .map((cat) => ({
          username: username,
          category: cat,
          business_type: offerType || 'Both',
        }));

      const toUpdate = selectedCategories.filter(
        (cat) => cat in existingMap && existingMap[cat] !== offerType
      );

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_categories')
          .delete()
          .eq('username', username)
          .in('category', toDelete);

        if (deleteError) {
          console.error('❌ Deletion failed:', deleteError.message);
          showToast('Failed to remove unselected categories', false);
          return;
        }
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('user_categories')
          .insert(toInsert);

        if (insertError) {
          console.error('❌ Insertion failed:', insertError.message);
          showToast('Error saving new categories', false);
          return;
        }
      }

      for (const cat of toUpdate) {
        const { error: updateError } = await supabase
          .from('user_categories')
          .update({ business_type: offerType })
          .eq('username', username)
          .eq('category', cat);

        if (updateError) {
          console.error(`❌ Failed to update business_type for ${cat}:`, updateError.message);
          showToast(`Failed to update category: ${cat}`, false);
          return;
        }
      }

      showToast('✅ Preferences saved successfully');
      localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));

      navigate('/events', {
        state: {
          categories: selectedCategories,
          username: username,
          email: email,
        },
      });
    } catch (err) {
      console.error('❌ Error submitting preferences:', err);
      showToast('Something went wrong.', false);
    }
  };

  // 🔍 Filter categories for dropdown
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="top-curve"></div>

      <div className="find-events-container">
      <h1>Hi, {(username ? username.charAt(0).toUpperCase() + username.slice(1) + '!' : 'There!')}</h1>
        <p className="subtitle">Let’s get you started!</p>
        <p className="highlight">Just one more step towards more opportunities!</p>

        <div className="offer-type-section">
          <p className="label">What do you offer?</p>
          <div className="offer-buttons">
            {['Product', 'Services', 'Both'].map((type) => (
              <button
                key={type}
                className={`offer-btn ${offerType === type ? 'selected' : ''}`}
                onClick={() => setOfferType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="category-selection-wrapper">
          <div className="selected-section left-section">
            <label className="label">Selected Categories:</label>
            <div className="selected-tags">
              {selectedCategories.map((cat, idx) => (
                <span key={idx} className="tag">
                  {cat}
                  <span className="remove-tag" onClick={() => removeCategory(cat)}>
                    ×
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div
            className="dropdown right-section"
            ref={dropdownRef}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <input
              type="text"
              placeholder="Search categories"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(true);
              }}
            />

            <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>

            {dropdownOpen && (
              <div className="dropdown-list">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category}
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category);
                        setSearchTerm('');
                      }}
                    >
                      {category}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item no-results">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="find-btn" onClick={handleSubmitPreferences}>
          Find your events
        </button>

        {toast.show && (
          <div className={`toast ${toast.success ? 'toast-success' : 'toast-error'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
};

export default FindEvents;
