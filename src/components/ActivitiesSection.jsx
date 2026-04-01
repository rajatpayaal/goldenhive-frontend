import React from 'react';
import Link from 'next/link';
import styles from './ActivitiesSection.module.css';

export function ActivitiesSection({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className="container">
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>Featured Activities</h2>
          <p className={styles.sectionSubTitle}>Discover hand-picked adventures and spiritual journeys in Rishikesh</p>
        </div>
        
        <div className={styles.carousel}>
          {activities.map((activity) => (
            <Link 
               href={`/activity/${activity.basic?.slug || activity._id}`} 
               key={activity._id} 
               className={styles.card}
            >
              <div className={styles.imageOverflow}>
                <div 
                  className={styles.imageBox} 
                  style={{ backgroundImage: `url(${activity.hero?.primaryImage || '/placeholder.jpg'})` }}
                >
                  {activity.basic?.discount > 0 && (
                    <div className={styles.badge}>{activity.basic?.discount}% OFF</div>
                  )}
                </div>
              </div>
              <div className={styles.content}>
                 <div className={styles.meta}>
                   <span className={styles.duration}>⏱ {activity.basic?.duration || 'Flexible'} hrs</span>
                   <span className={styles.location}>📍 {activity.basic?.location || 'Rishikesh'}</span>
                 </div>
                 <h3 className={styles.name}>{activity.basic?.name}</h3>
                 <p className={styles.tagline}>{activity.basic?.tagline}</p>
                 <div className={styles.footer}>
                    <div className={styles.priceContainer}>
                       {activity.basic?.discount > 0 && (
                          <span className={styles.oldPrice}>₹{activity.basic?.price}</span>
                       )}
                       <span className={styles.price}>₹{activity.basic?.finalPrice || activity.basic?.price || 'TBA'}</span>
                    </div>
                    <span className={styles.actionBtn}>View Details &rarr;</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
