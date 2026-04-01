"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LoginModal } from './LoginModal';

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="container nav-row">
          <div className="brand" style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px' }}>
            <Link href="/">GoldenHive</Link>
          </div>
          <nav className="main-nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/" style={{ padding: '8px 16px', background: 'var(--surface-color)', borderRadius: '999px', fontWeight: 600 }}>For you</Link>
            <Link href="#activities" style={{ padding: '8px 16px', fontWeight: 500 }}>Activities</Link>
            <Link href="#packages" style={{ padding: '8px 16px', fontWeight: 500 }}>Packages</Link>
          </nav>
          <div className="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <button 
                onClick={() => setIsLoginOpen(true)} 
                style={{ 
                  background: 'var(--surface-color)', 
                  border: 'none', 
                  padding: '8px 24px', 
                  borderRadius: '999px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  transition: 'background 0.2s'
                }}
              >
                Log In / Sign Up
             </button>
            <a 
              className="whatsapp-cta" 
              href="https://wa.me/919999999999" 
              aria-label="WhatsApp"
              style={{
                 background: 'var(--primary)',
                 color: 'white',
                 padding: '8px 20px',
                 borderRadius: '999px',
                 fontWeight: 600,
                 textDecoration: 'none'
              }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
