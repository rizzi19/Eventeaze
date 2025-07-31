// src/components/sendVerifyEmail.js
import emailjs from '@emailjs/browser';
import { supabase } from '../services/supabaseClient';

export const sendVerificationEmail = async (toEmail, verifyToken) => {
  const serviceId = 'service_hru4ydu';
  const templateId = 'template_pgh807v';
  const publicKey = '8vaLWAd4SXHWReibL';
  
  const verificationLink = `https://eventeaze.app/verify.html?token=${verifyToken}`;

  const templateParams = {
    user_email: toEmail,
    verification_link: verificationLink,
  };
  

  try {
    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('✅ Verification email sent:', result.text);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
};

export const sendVerificationEmailByUsername = async (username) => {
  const serviceId = 'service_hru4ydu';
  const templateId = 'template_pgh807v';
  const publicKey = '8vaLWAd4SXHWReibL';

  // Fetch user email and token from Supabase
  const { data: user, error } = await supabase
    .from('users') // Replace with your actual table name
    .select('email, verify_email_token')
    .eq('username', username)
    .single();

  if (error || !user) {
    console.error('❌ User not found or error fetching data:', error);
    return false;
  }

  const verificationLink = `https://eventeaze.app/verify.html?token=${user.verify_email_token}`;

  const templateParams = {
    user_email: user.email,
    verification_link: verificationLink,
  };

  try {
    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('✅ Verification email sent:', result.text);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
};

