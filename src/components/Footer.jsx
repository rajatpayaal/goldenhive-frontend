import React from 'react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        
        <div className={styles.topRow}>
          <div className={styles.brand}>
            GoldenHive
            <span>by Local Experts</span>
          </div>
          
          <div className={styles.navLinks}>
            <a href="#!">Terms & Conditions</a>
            <a href="#!">Privacy Policy</a>
            <a href="#!">Contact Us</a>
            <a href="#!">List your activities</a>
          </div>
          
          <div className={styles.appBox}>
            <div className={styles.qrCode}>
               {/* Dummy QR code generation or SVG */}
               <svg viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="4">
                  <rect x="10" y="10" width="30" height="30" />
                  <rect x="60" y="10" width="30" height="30" />
                  <rect x="10" y="60" width="30" height="30" />
                  <rect x="50" y="50" width="10" height="10" />
                  <rect x="70" y="70" width="20" height="20" />
               </svg>
            </div>
            <span className={styles.appText}>Scan to download the app</span>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.disclaimer}>
            By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
          </p>
          
          <div className={styles.socialRow}>
             {/* Dummy social icons - you could swap with actual SVGs or FontAwesome */}
             <span>💬</span>
             <span>🌐</span>
             <span>📷</span>
             <span>▶️</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
