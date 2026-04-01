import React from 'react';
import Link from 'next/link';
import styles from './PackagesSection.module.css';

export function PackagesSection({ packages }) {
  if (!packages || packages.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className="container">
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>Exclusive Tour Packages</h2>
          <p className={styles.sectionSubTitle}>Unforgettable multi-day itineraries perfectly planned for you</p>
        </div>
        
        <div className={styles.carousel}>
          {packages.map((pkg) => (
            <Link 
               href={`/package/${pkg.basic?.slug || pkg._id}`} 
               key={pkg._id} 
               className={styles.card}
            >
              <div className={styles.imageOverflow}>
                <div 
                   className={styles.imageBox} 
                   style={{ backgroundImage: `url(${pkg.hero?.primaryImage || '/placeholder.jpg'})` }}
                />
                <div className={styles.durationBadge}>
                   {pkg.basic?.durationDays}D / {pkg.basic?.nights}N
                </div>
              </div>
              <div className={styles.content}>
                 <div className={styles.meta}>
                   <span className={styles.destination}>🏔 {pkg.basic?.destination || 'Uttarakhand'}</span>
                 </div>
                 <h3 className={styles.name}>{pkg.basic?.name}</h3>
                 <p className={styles.tagline}>{pkg.basic?.tagline || 'Experience the best of the Himalayas.'}</p>
                 
                 <div className={styles.footer}>
                    <div className={styles.priceContainer}>
                       {pkg.pricing?.discountPercent > 0 && (
                          <div className={styles.discountRow}>
                             <span className={styles.oldPrice}>₹{pkg.pricing.basePrice}</span>
                             <span className={styles.discountBadge}>Save {pkg.pricing.discountPercent}%</span>
                          </div>
                       )}
                       <div className={styles.priceRow}>
                         <span className={styles.price}>₹{pkg.pricing?.finalPrice || pkg.basic?.finalPrice || 'TBA'}</span>
                         <span className={styles.perPerson}>/ person</span>
                       </div>
                    </div>
                    <span className={styles.actionBtn}>Explore</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
