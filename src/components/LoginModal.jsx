"use client";

import React, { useState } from 'react';
import styles from './LoginModal.module.css';
import { apiService } from '../services/api.service';

export function LoginModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Auto-generate a userName if omitted
    const finalData = { ...formData };
    if (!finalData.userName) {
      finalData.userName = formData.email.split('@')[0] + Math.floor(Math.random() * 1000);
    }

    const { ok, data, error: apiError } = await apiService.registerUser(finalData);
    
    setLoading(false);
    
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        onClose();
      }, 2500);
    } else {
      setError(apiError || data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <div className={styles.header}>
          <h2 className={styles.brand}>GoldenHive</h2>
          <p className={styles.tagline}>Premium Travels</p>
        </div>

        <div className={styles.body}>
          {success ? (
            <div style={{ padding: "40px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
              <h2 className={styles.bodyTitle}>Welcome Aboard!</h2>
              <p className={styles.bodySubtitle}>Your account has been successfully created.</p>
            </div>
          ) : step === 1 ? (
            <>
              <h2 className={styles.bodyTitle}>Enter your mobile number</h2>
              <p className={styles.bodySubtitle}>If you don't have an account yet, we'll create one for you</p>
              
              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.form}>
                <div className={styles.inputGroup}>
                  <div className={styles.countryCode}>🇮🇳 +91</div>
                  <input 
                    type="tel" 
                    name="phone"
                    className={styles.input} 
                    placeholder="Enter mobile number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoFocus
                  />
                </div>
                <button 
                  className={styles.submitBtn} 
                  onClick={handleNext}
                  disabled={formData.phone.length < 5}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className={styles.bodyTitle}>Complete Registration</h2>
              <p className={styles.bodySubtitle}>Please provide your details below.</p>
              
              {error && <div className={styles.errorBox}>{error}</div>}

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup} style={{ borderRight: "1px solid var(--border)"}}>
                  <input 
                    type="text" 
                    name="fullName"
                    className={styles.input} 
                    placeholder="Full Name" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.inputGroup} style={{ borderRight: "1px solid var(--border)"}}>
                  <input 
                    type="email" 
                    name="email"
                    className={styles.input} 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup} style={{ borderRight: "1px solid var(--border)"}}>
                  <input 
                    type="password" 
                    name="password"
                    className={styles.input} 
                    placeholder="Create a Password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className={styles.submitBtn} style={{ background: '#f3f3f3', color: '#1c1c1c', flex: 1 }} onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className={styles.submitBtn} disabled={loading} style={{ flex: 2 }}>
                    {loading ? "Registering..." : "Sign Up"}
                  </button>
                </div>
              </form>
            </>
          )}

          {!success && (
            <div className={styles.footer}>
              By continuing, you agree to our <br/>
              <a href="#!">Terms of Service</a> &nbsp; <a href="#!">Privacy Policy</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
