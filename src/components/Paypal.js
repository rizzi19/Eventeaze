import React, { useState} from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import '../styles/paypal.css'

const PayPal = ({ amount }) => {

      const navigate = useNavigate();
      const [toast, setToast] = useState({ show: false, message: '', success: true });

    const showToast = (message, success = true) => {
        setToast({ show: true, message, success });
        setTimeout(() => {
          setToast({ show: false, message: '', success: true });
        }, 3000);
      };

  return (
    <PayPalScriptProvider options={{ "client-id": "AfUBJDERteLSsQmxbAJFHlz0I90e1JXCC4q_U4zHTJwiT4pAY4eDRSFq0w3WvcOfrsPmzo3JVHWGkS3D" }}>
       <div className="paypal-bg">
        <div className="paypal-button-wrapper">
          <div className="paypal-text">
            <p>Pay (USD ${amount}) to proceed for Eventeaze</p>
          </div>
          <div className="paypal-button-container">
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: amount.toString()
                    }
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  showToast(`Transaction completed by ${details.payer.name.given_name}`);
                  setTimeout(() => {
                    navigate('/home');
                  }, 2000); 
                });
              }}
            />
          </div>
        </div>
      </div>  

      {toast.show && (
        <div className={`toast ${toast.success ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
                    </PayPalScriptProvider>
  );
};

export default PayPal;
