<<<<<<< HEAD
import { BannerSlider } from "../components/BannerSlider";
import { ActivitiesSection } from "../components/ActivitiesSection";
import { PackagesSection } from "../components/PackagesSection";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "./page.module.css";
import Link from "next/link";

import { apiService } from "../services/api.service";

export const metadata = {
  title: "GoldenHive | Tours, Activities & Packages",
  description: "Book affordable premium packages and exclusive experiences.",
  keywords: ["Kedarnath Yatra", "Rishikesh Rafting", "Char Dham", "Uttarakhand Tourism"],
  openGraph: {
    title: "Premium Travel Agency",
    description: "Experience divine journeys and activities.",
    url: "https://goldenhive-frontend.vercel.app", 
    siteName: "GoldenHive",
    images: [],
    locale: "en_IN",
    type: "website",
  },
};

export default async function HomePage() {
  const [banners, activities, packages] = await Promise.all([
    apiService.getHomeBanners(),
    apiService.getHomeActivities(),
    apiService.getHomePackages()
  ]);

  return (
    <>
      <Header />

      <main className={styles.main}>
        <BannerSlider banners={banners} />
        <div id="activities">
          <ActivitiesSection activities={activities} />
        </div>
        <div id="packages">
          <PackagesSection packages={packages} />
        </div>
      </main>

      <Footer />
=======
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const offerings = [
  {
    title: "Char Dham & Spiritual Circuits",
    description:
      "Thoughtfully planned yatras with transport, stays, darshan scheduling, and local support for a smoother pilgrimage.",
    meta: "Char Dham, Haridwar, Rishikesh, temple stays",
    tone: "saffron",
  },
  {
    title: "Adventure Escapes",
    description:
      "Rafting, trekking, camping, zipline, and outdoor experiences designed for couples, friends, and private groups.",
    meta: "Rafting, trekking, camping, team trips",
    tone: "blue",
  },
  {
    title: "Customized Uttarakhand Tours",
    description:
      "From weekend hill getaways to multi-city family holidays, every itinerary is tailored around pace, budget, and comfort.",
    meta: "Nainital, Mussoorie, Auli, private cabs",
    tone: "green",
  },
];

const highlights = [
  "Customized itineraries for families, couples, corporates, and yatra groups",
  "Transport, stays, activities, meals, and local coordination in one plan",
  "Adventure and spiritual journeys managed with equal care",
  "Pre-trip guidance plus on-ground support throughout the journey",
];

const process = [
  {
    step: "01",
    title: "Share your plan",
    description: "Tell us your destination, group type, dates, and travel style.",
  },
  {
    step: "02",
    title: "Get a custom itinerary",
    description: "We shape routes, stays, activities, and budgets around your trip goals.",
  },
  {
    step: "03",
    title: "Travel with support",
    description: "From departure to return, our team stays available for coordination and changes.",
  },
];

const sampleJourney = [
  "Day 1: Haridwar arrival, transfer, evening Ganga Aarti, and hotel check-in.",
  "Day 2: Rishikesh sightseeing, rafting or temple trail based on traveler preference.",
  "Day 3: Scenic Uttarakhand drive with curated stops, meals, and stay support.",
  "Day 4: Trek, local exploration, or darshan assistance with return planning.",
];

const supportPoints = [
  "Trip customization for budget, comfort, and travel pace",
  "Hotels, camps, cabs, and activity booking assistance",
  "WhatsApp-first support for quick planning and updates",
];

export default function HomePage() {
  const [modal, setModal] = useState(null);
  const [travelerType, setTravelerType] = useState("Solo");
  const [success, setSuccess] = useState(false);

  const travelerMessage = useMemo(() => {
    if (travelerType === "Couple") return "Romantic stays, private transfers, and slower-paced plans";
    if (travelerType === "Family") return "Kid-friendly routing, comfort stays, and flexible sightseeing";
    if (travelerType === "Group") return "Best for friend circles, corporate outings, and yatra groups";
    return "Smart planning for solo travelers looking for support and flexibility";
  }, [travelerType]);

  return (
    <>
      <header className="site-header">
        <div className="container nav-row">
          <a href="#top" className="brand-block">
            <Image
              src="/golden-hive-logo.svg"
              alt="Golden Hive Holidays logo"
              width={68}
              height={68}
              className="brand-logo"
              priority
            />
            <span>
              <span className="brand-kicker">Uttarakhand Travel Experts</span>
              <span className="brand">Golden Hive Holidays</span>
            </span>
          </a>

          <nav className="main-nav">
            <a href="#packages">Packages</a>
            <a href="#customize">Customize Trip</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => setModal("login")}>
              Login
            </button>
            <button className="btn btn-outline" onClick={() => setModal("register")}>
              Register
            </button>
            <a className="whatsapp-cta" href="https://wa.me/917505917525" aria-label="Chat on WhatsApp">
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="hero-logo-wrap">
                <Image
                  src="/golden-hive-logo.svg"
                  alt="Golden Hive Holidays"
                  width={122}
                  height={122}
                  className="hero-logo"
                  priority
                />
              </div>
              <p className="eyebrow">Customized Travel Packages | Adventure | Spiritual Tours</p>
              <h1>Golden Hive Holidays plans Uttarakhand journeys around your style, not a fixed template.</h1>
              <p className="hero-subhead">
                Char Dham yatras, rafting weekends, trekking escapes, family holidays, and complete trip planning with
                one reliable team.
              </p>

              <div className="hero-badges">
                <span>Tailor-made packages</span>
                <span>Adventure + spiritual travel</span>
                <span>End-to-end support</span>
              </div>

              <div className="hero-actions">
                <a className="btn btn-primary" href="#customize">
                  Plan My Trip
                </a>
                <Link href="/activity/ganga-rapids-aarti-trail" className="btn btn-outline btn-light">
                  View Sample Experience
                </Link>
              </div>
            </div>

            <div className="hero-panel">
              <div className="hero-panel-top">
                <p className="panel-label">Quick Trip Match</p>
                <h2>Tell us what kind of journey you want.</h2>
              </div>

              <form className="search-bar">
                <label>
                  Package Type
                  <select defaultValue="Char Dham Yatra">
                    <option>Char Dham Yatra</option>
                    <option>Uttarakhand Family Tour</option>
                    <option>Rafting & Camping</option>
                    <option>Trekking Adventure</option>
                  </select>
                </label>
                <label>
                  Traveler Type
                  <select value={travelerType} onChange={(event) => setTravelerType(event.target.value)}>
                    <option>Solo</option>
                    <option>Couple</option>
                    <option>Family</option>
                    <option>Group</option>
                  </select>
                </label>
                <label>
                  Travel Month
                  <input type="month" />
                </label>
                <button type="button" className="btn btn-primary" onClick={() => setSuccess(true)}>
                  Request Callback
                </button>
              </form>

              <p className="badge-line">{travelerMessage}</p>

              <div className="hero-stats">
                <div>
                  <strong>Char Dham</strong>
                  <span>planning support</span>
                </div>
                <div>
                  <strong>Adventure</strong>
                  <span>rafting, trekking, camping</span>
                </div>
                <div>
                  <strong>End-to-end</strong>
                  <span>booking and coordination</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container trust-strip">
          <p>Built for travelers who want one team to handle itinerary, booking coordination, activities, and support.</p>
        </section>

        <section id="packages" className="container section-block">
          <div className="section-heading">
            <p className="section-label">Featured Services</p>
            <h2>Packages and experiences that match the client brief clearly.</h2>
            <p>
              The homepage now leads with the three areas Golden Hive Holidays is strongest in: spiritual travel,
              adventure activities, and fully customized Uttarakhand trips.
            </p>
          </div>

          <div className="offer-grid">
            {offerings.map((item) => (
              <article key={item.title} className={`offer-card ${item.tone}`}>
                <p className="offer-meta">{item.meta}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href="#customize" className="card-link">
                  Customize this plan
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="container section-block about-grid">
          <div className="about-copy">
            <p className="section-label">About Golden Hive Holidays</p>
            <h2>A modern travel partner for both peaceful yatras and high-energy escapes.</h2>
            <p>
              Golden Hive Holidays focuses on personalized travel planning across Uttarakhand. Whether the traveler
              wants Char Dham assistance, a curated family vacation, or an activity-led trip with rafting and trekking,
              the experience is built around their comfort, timing, and budget.
            </p>

            <div className="feature-list">
              {highlights.map((item) => (
                <div key={item} className="feature-item">
                  <span className="feature-dot" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="about-panel">
            <p className="panel-label">What clients need to see quickly</p>
            <h3>Everything from inquiry to return travel is coordinated in one place.</h3>
            <div className="support-list">
              {supportPoints.map((item) => (
                <div key={item} className="support-pill">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="customize" className="container section-block customize-grid">
          <div className="journey-card">
            <p className="section-label">Trip Customization</p>
            <h2>Sample itinerary flow for a mixed spiritual + adventure trip.</h2>
            <ul className="timeline">
              {sampleJourney.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="register-card">
            <p className="panel-label">Free Consultation</p>
            <h3>Request a customized quote</h3>
            <div className="toggle-row">
              {["Solo", "Couple", "Family", "Group"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip ${travelerType === item ? "active" : ""}`}
                  onClick={() => setTravelerType(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="badge-line">{travelerMessage}</p>
            <input placeholder="Full Name" />
            <input placeholder="Phone Number / WhatsApp" />
            <input placeholder="Preferred Destination or Package" />
            <input type="date" />
            {travelerType === "Group" && <input type="number" min="5" max="40" placeholder="Group Size" />}
            <button className="btn btn-primary wide" onClick={() => setSuccess(true)}>
              Get My Custom Plan
            </button>
            <button className="text-link" onClick={() => setModal("register")}>
              Register for faster booking
            </button>
          </div>
        </section>

        <section className="container section-block process-section">
          <div className="section-heading narrow">
            <p className="section-label">How It Works</p>
            <h2>Simple planning flow for end-to-end trip support.</h2>
          </div>

          <div className="process-grid">
            {process.map((item) => (
              <article key={item.step} className="process-card">
                <span className="process-step">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="section-label">Contact</p>
            <div className="footer-brand">
              <Image
                src="/golden-hive-logo.svg"
                alt="Golden Hive Holidays logo"
                width={84}
                height={84}
                className="footer-logo"
              />
              <div>
                <h3>Golden Hive Holidays</h3>
                <p>Customized travel packages, adventure activities, and complete trip planning support.</p>
              </div>
            </div>
          </div>
          <div className="footer-contact">
            <a href="mailto:admin@goldenhiveholidays.in">admin@goldenhiveholidays.in</a>
            <a href="tel:7505917525">7505917525</a>
            <a href="https://wa.me/917505917525">WhatsApp planning support</a>
          </div>
        </div>
      </footer>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
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
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Thank you!</h3>
            <p>Our Golden Hive Holidays team will reach out shortly to shape your itinerary.</p>
            <button className="btn btn-primary wide" onClick={() => setSuccess(false)}>
              Close
            </button>
          </div>
        </div>
      )}
>>>>>>> d78f7d20e19cf20e41502ff195d18e01cdbb9e15
    </>
  );
}
