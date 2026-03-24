"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const gallery = [
  "https://images.unsplash.com/photo-1652005823797-4fa95df8333e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618778082290-7997118f3e6b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
];

const itinerary = [
  "Day 1: Arrival in Rishikesh, briefing and riverside stay.",
  "Day 2: River rafting + local temple walk + evening aarti.",
  "Day 3: Adventure choice (bungee/zipline) and departure.",
];

export default function HomePage() {
  const [modal, setModal] = useState(null);
  const [travelerType, setTravelerType] = useState("Single");
  const [success, setSuccess] = useState(false);

  const travelerMessage = useMemo(() => {
    if (travelerType === "Duo/Couple") return "Couple Discount + Private Tent/Room";
    if (travelerType === "Group") return "Get Group Quote (5-20 people)";
    return "Standard single traveler assistance";
  }, [travelerType]);

  return (
    <>
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
            <button className="btn btn-outline" onClick={() => setModal("login")}>
              Login
            </button>
            <button className="btn btn-outline" onClick={() => setModal("register")}>
              Register
            </button>
            <a className="whatsapp-cta" href="https://wa.me/919999999999" aria-label="WhatsApp">
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Rishikesh + Char Dham 2026</p>
          <h1>From Spiritual Peaks to River Rapids.</h1>
          <p className="hero-subhead">
            Book your complete Rishikesh and Char Dham experience. No upfront payment, just your journey, planned.
          </p>
          <form className="search-bar">
            <label>
              Service Type
              <select defaultValue="Char Dham">
                <option>Char Dham</option>
                <option>Rafting</option>
                <option>Camping</option>
                <option>Aarti</option>
              </select>
            </label>
            <label>
              Traveler Type
              <select defaultValue="Single">
                <option>Single</option>
                <option>Duo/Couple</option>
                <option>Group</option>
              </select>
            </label>
            <label>
              Dates
              <input type="date" />
            </label>
            <button type="button" className="btn btn-primary">
              Find Experiences
            </button>
          </form>
        </div>
      </section>

      <section id="activities" className="container categories">
        <article id="char-dham" className="category-card saffron">
          <h3>Char Dham Yatra</h3>
          <p>Elegant pilgrimage planning with saffron-gold themed comfort and trusted coordinators.</p>
        </article>
        <article className="category-card blue">
          <h3>Adventure Rishikesh</h3>
          <p>High-energy rafting, bungee, and cliff-jump itineraries designed with certified experts.</p>
        </article>
        <article id="stay" className="category-card green">
          <h3>Peace and Spirituality</h3>
          <p>Serene Ganga Aarti, yoga mornings and calm riverside stays for mindful escapes.</p>
        </article>
      </section>

      <section className="container" style={{ marginBottom: "32px", display: "flex", justifyContent: "center" }}>
        <Link href="/activity/ganga-rapids-aarti-trail" className="btn btn-primary">
          Open Full Activity Detail Page
        </Link>
      </section>

      <section className="container detail-layout">
        <div className="left-pane">
          <h2>Activity Detail: Ganga Rapids + Aarti Trail</h2>
          <div className="gallery-grid">
            {gallery.map((img) => (
              <div key={img} className="gallery-item" style={{ backgroundImage: `url(${img})` }} />
            ))}
          </div>
          <div className="overview-row">
            <span>Duration: 3 Days</span>
            <span>Difficulty: Moderate</span>
            <span>Group Size: 2-20</span>
          </div>
          <h3>Itinerary</h3>
          <ul className="timeline">
            {itinerary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3>Inclusions & Exclusions</h3>
          <div className="split-list">
            <ul>
              <li>Included: Certified river guide</li>
              <li>Included: Equipment and safety gear</li>
              <li>Included: Camp stay and meals</li>
            </ul>
            <ul>
              <li>Excluded: Personal insurance</li>
              <li>Excluded: On-call private taxi</li>
              <li>Excluded: Premium room upgrade</li>
            </ul>
          </div>
        </div>

        <aside className="right-pane">
          <div className="register-card">
            <h3>Interested in this Trip?</h3>
            <div className="toggle-row">
              {["Single", "Duo/Couple", "Group"].map((item) => (
                <button
                  key={item}
                  className={`chip ${travelerType === item ? "active" : ""}`}
                  onClick={() => setTravelerType(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="badge-line">{travelerMessage}</p>
            <input placeholder="Name" />
            <input placeholder="Phone Number (WhatsApp preferred)" />
            <input type="date" />
            {travelerType === "Group" && <input type="number" min="5" max="20" placeholder="Group Size (5-20)" />}
            <button className="btn btn-primary wide" onClick={() => setSuccess(true)}>
              {travelerType === "Group" ? "Get Group Quote" : "Request Free Itinerary"}
            </button>
            <button className="text-link" onClick={() => setSuccess(true)}>
              Continue as Guest
            </button>
          </div>
        </aside>
      </section>

      <footer id="contact" className="site-footer">
        <div className="container">Lead-first experience built for high-ticket tourism sales conversations.</div>
      </footer>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {modal === "login" ? (
              <>
                <h3>Login</h3>
                <button className="btn btn-primary wide">Login with Phone (OTP)</button>
                <button className="btn btn-outline wide">Continue with Google</button>
              </>
            ) : (
              <>
                <h3>Registration</h3>
                <input placeholder="Full Name" />
                <input placeholder="WhatsApp Number" />
                <input placeholder="City" />
                <button className="btn btn-primary wide">Continue</button>
              </>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="modal-backdrop" onClick={() => setSuccess(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Thank you!</h3>
            <p>Our Rishikesh Expert will contact you on WhatsApp within 2 hours.</p>
            <button className="btn btn-primary wide" onClick={() => setSuccess(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
