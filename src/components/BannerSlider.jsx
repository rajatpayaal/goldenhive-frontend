"use client";
import React, { useState, useEffect } from "react";
import styles from "./BannerSlider.module.css";
import Link from "next/link";

export function BannerSlider({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className={styles.sliderContainer}>
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`${styles.slide} ${index === currentIndex ? styles.active : ""}`}
          style={{ backgroundImage: `url(${banner.imageUrl})` }}
        >
          <div className={styles.overlay}>
             <div className="container">
               <div className={styles.content}>
                 <h1 className={styles.title}>{banner.title}</h1>
                 <p className={styles.description}>{banner.description}</p>
                 {banner.redirectId && (
                   <Link 
                     href={`/${banner.redirectType?.toLowerCase() || 'tour'}/${banner.redirectId}`} 
                     className={styles.ctaButton}
                   >
                     Book Now
                   </Link>
                 )}
               </div>
             </div>
          </div>
        </div>
      ))}
      
      {banners.length > 1 && (
        <div className={styles.indicators}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ""}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
