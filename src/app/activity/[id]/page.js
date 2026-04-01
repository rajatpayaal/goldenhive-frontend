import { apiService } from "../../../services/api.service";
import Link from "next/link";
import styles from "./page.module.css";

async function resolveActivityId(slugOrId) {
  if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) return slugOrId;
  const allActivities = await apiService.getHomeActivities();
  const matched = allActivities.find(a => a.basic?.slug === slugOrId);
  return matched ? matched._id : slugOrId;
}

export async function generateMetadata(context) {
  const { id } = await context.params;
  const resolvedId = await resolveActivityId(id);
  const activity = await apiService.getActivityById(resolvedId);
  
  if (!activity) {
    return { title: "Activity Not Found" };
  }
  
  return {
    title: activity.seo?.metaTitle || `${activity.basic?.name} | GoldenHive`,
    description: activity.seo?.metaDescription || activity.basic?.tagline,
    keywords: activity.seo?.keywords || [],
    openGraph: {
      title: activity.seo?.metaTitle || activity.basic?.name,
      description: activity.seo?.metaDescription,
      images: activity.hero?.primaryImage ? [{ url: activity.hero.primaryImage }] : [],
    }
  };
}

export default async function ActivityDetailsPage(context) {
  const { id } = await context.params;
  const resolvedId = await resolveActivityId(id);
  const activity = await apiService.getActivityById(resolvedId);

  if (!activity) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center", minHeight: "60vh" }}>
         <h2>Activity not found or inactive.</h2>
         <Link href="/#activities" style={{ color: "var(--river)", fontWeight: "600", marginTop: "20px", display: "inline-block" }}>
            Return to Activities
         </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
       <div className={styles.hero} style={{ backgroundImage: `url(${activity.hero?.primaryImage})`}}>
          <div className={styles.heroOverlay}>
             <div className="container">
                <Link href="/#activities" className={styles.backLink}>&larr; Back to Activities</Link>
                <div className={styles.badges}>
                   ⏱ {activity.basic?.duration} Hrs &nbsp;&bull;&nbsp; 📍 {activity.basic?.location}
                </div>
                <h1 className={styles.title}>{activity.hero?.title || activity.basic?.name}</h1>
                <p className={styles.subtitle}>{activity.hero?.subtitle || activity.basic?.tagline}</p>
             </div>
          </div>
       </div>

       <div className="container">
          <div className={styles.layout}>
             <div className={styles.leftPane}>
                
                <div className={styles.quickInfoSection}>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Difficulty</span>
                      <span className={styles.infoValue}>{activity.quickInfo?.difficulty || 'N/A'}</span>
                   </div>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Age Limit</span>
                      <span className={styles.infoValue}>{activity.basic?.ageLimit ? `${activity.basic.ageLimit}+ Yrs` : 'All Ages'}</span>
                   </div>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Timing</span>
                      <span className={styles.infoValue}>{activity.quickInfo?.timing || 'Flexible'}</span>
                   </div>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Guide</span>
                      <span className={styles.infoValue}>{activity.quickInfo?.guide || 'Available'}</span>
                   </div>
                </div>

                <div className={styles.sectionCard}>
                   <h2>Overview</h2>
                   <p className={styles.descriptionText}>{activity.overview?.long || activity.overview?.short}</p>
                </div>

                {activity.gallery?.length > 0 && (
                   <div className={styles.sectionCard}>
                      <h2>Gallery</h2>
                      <div className={styles.galleryGrid}>
                        {activity.gallery.map((img, i) => (
                           <div key={i} className={styles.galleryItem} style={{ backgroundImage: `url(${img.url || img})`}}/>
                        ))}
                      </div>
                   </div>
                )}
             </div>

             <div className={styles.rightPane}>
                <div className={styles.pricingCard}>
                   <h3 className={styles.cardHeader}>Book Activity</h3>
                   
                   <div className={styles.priceRow}>
                     {activity.basic?.discount > 0 && (
                        <div className={styles.discountBadge}>Save {activity.basic.discount}%</div>
                     )}
                     <div className={styles.priceValues}>
                        {activity.basic?.discount > 0 && (
                           <span className={styles.oldPrice}>₹{activity.basic.price}</span>
                        )}
                        <span className={styles.finalPrice}>₹{activity.basic?.finalPrice || activity.basic?.price}</span>
                        <span className={styles.perPerson}>/ person</span>
                     </div>
                   </div>

                   <div className={styles.ctaGroup}>
                     <a href={`https://wa.me/${activity.cta?.whatsapp?.replace('+', '')}`} className={styles.whatsappBtn} target="_blank" rel="noopener noreferrer">
                        {activity.cta?.buttonText || 'Book on WhatsApp'}
                     </a>
                     <a href={`tel:${activity.cta?.call}`} className={styles.callBtn}>
                        Call Now
                     </a>
                   </div>
                   
                   <div className={styles.policies}>
                      <p>✅ {activity.policies?.cancellation || 'Flexible Cancellation'}</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
