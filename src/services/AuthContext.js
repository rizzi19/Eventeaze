import React, { createContext, useContext, useState, useEffect } from 'react';
import {supabase} from './supabaseClient' 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically fetch user profile from Supabase on app load
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const auth = sessionData?.session?.user;

      if (auth) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', auth.id)
          .single();

        setAuthUser(userProfile);
      }

      setLoading(false);
    };

    getUserProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
