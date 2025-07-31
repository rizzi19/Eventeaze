// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDdiuC2bQ1zNuO57y_ZGKF-fwqJ0kOAirY',
  authDomain: 'eventeaze-4c1d4.firebaseapp.com',
  projectId: 'eventeaze-4c1d4',
  storageBucket: 'eventeaze-4c1d4.appspot.com',
  messagingSenderId: '644129813802', // Optional for Google Auth
  appId: '1:644129813802:android:2c881f135f0d3521239a53' // Optional for Google Auth
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Google Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
