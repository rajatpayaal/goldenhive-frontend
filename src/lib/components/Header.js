"use client";

export default function Header({ onLoginClick, onRegisterClick }) {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <div className="brand">RishiYatra</div>
        <nav className="main-nav">
          <a href="#char-dham">Char Dham</a>
          <a href="#activities">Rishikesh Activities</a>
          <a href="#stay">Stay</a>
          <a href="#contact">Contact Us</a>
        </nav>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={onLoginClick}>
            Login
          </button>
          <button className="btn btn-outline" onClick={onRegisterClick}>
            Register
          </button>
        </div>
      </div>
    </header>
  );
}
