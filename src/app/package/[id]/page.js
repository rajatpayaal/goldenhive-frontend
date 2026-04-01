import { apiService } from "../../../services/api.service";
import Link from "next/link";
import styles from "./page.module.css";

async function resolvePackageId(slugOrId) {
  if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) return slugOrId;
  const allPackages = await apiService.getHomePackages();
  const matched = allPackages.find(p => p.basic?.slug === slugOrId);
  return matched ? matched._id : slugOrId;
}

export async function generateMetadata(context) {
  const { id } = await context.params;
  const resolvedId = await resolvePackageId(id);
  const pkg = await apiService.getPackageById(resolvedId);
  
  if (!pkg) {
    return { title: "Package Not Found" };
  }
  
  return {
    title: pkg.seo?.metaTitle || `${pkg.basic?.name} | GoldenHive`,
    description: pkg.seo?.metaDescription || pkg.basic?.tagline,
    keywords: pkg.seo?.keywords || [],
    openGraph: {
      title: pkg.seo?.metaTitle || pkg.basic?.name,
      description: pkg.seo?.metaDescription,
      images: pkg.hero?.primaryImage ? [{ url: pkg.hero.primaryImage }] : [],
    }
  };
}

export default async function PackageDetailsPage(context) {
  const { id } = await context.params;
  const resolvedId = await resolvePackageId(id);
  const pkg = await apiService.getPackageById(resolvedId);

  if (!pkg) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center", minHeight: "60vh" }}>
         <h2>Package not found or inactive.</h2>
         <Link href="/" style={{ color: "var(--river)", fontWeight: "600", marginTop: "20px", display: "inline-block" }}>
            Return to Home
         </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
       <div className={styles.hero} style={{ backgroundImage: `url(${pkg.hero?.primaryImage})`}}>
          <div className={styles.heroOverlay}>
             <div className="container">
                <Link href="/#packages" className={styles.backLink}>&larr; Back to Packages</Link>
                <div className={styles.badges}>
                   {pkg.basic?.durationDays} Days / {pkg.basic?.nights} Nights
                </div>
                <h1 className={styles.title}>{pkg.hero?.title || pkg.basic?.name}</h1>
                <p className={styles.subtitle}>{pkg.hero?.subtitle}</p>
             </div>
          </div>
       </div>

       <div className="container">
          <div className={styles.layout}>
             <div className={styles.leftPane}>
                
                <div className={styles.quickInfoSection}>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Pickup</span>
                      <span className={styles.infoValue}>{pkg.quickInfo?.pickup || 'Flexible'}</span>
                   </div>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Difficulty</span>
                      <span className={styles.infoValue}>{pkg.quickInfo?.difficulty || 'Moderate'}</span>
                   </div>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Stay</span>
                      <span className={styles.infoValue}>{pkg.quickInfo?.stay || 'Standard'}</span>
                   </div>
                   <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Meals</span>
                      <span className={styles.infoValue}>{pkg.quickInfo?.meals || 'Included'}</span>
                   </div>
                </div>

                <div className={styles.sectionCard}>
                   <h2>Overview</h2>
                   <p className={styles.descriptionText}>{pkg.overview?.long || pkg.overview?.short}</p>
                </div>

                {pkg.gallery?.length > 0 && (
                   <div className={styles.sectionCard}>
                      <h2>Gallery</h2>
                      <div className={styles.galleryGrid}>
                        {pkg.gallery.map((img, i) => (
                           <div key={i} className={styles.galleryItem} style={{ backgroundImage: `url(${img.url})`}}/>
                        ))}
                      </div>
                   </div>
                )}
                
                {pkg.hotelDetails?.length > 0 && (
                   <div className={styles.sectionCard}>
                      <h2>Accommodation Details</h2>
                      <ul className={styles.hotelList}>
                         {pkg.hotelDetails.map((hotel, idx) => (
                            <li key={idx}><strong>{hotel.location}:</strong> {hotel.type}</li>
                         ))}
                      </ul>
                   </div>
                )}
             </div>

             <div className={styles.rightPane}>
                <div className={styles.pricingCard}>
                   <h3 className={styles.cardHeader}>Book this Package</h3>
                   
                   <div className={styles.priceRow}>
                     {pkg.pricing?.discountPercent > 0 && (
                        <div className={styles.discountBadge}>Save {pkg.pricing.discountPercent}%</div>
                     )}
                     <div className={styles.priceValues}>
                        {pkg.pricing?.basePrice > 0 && pkg.pricing.discountPercent > 0 && (
                           <span className={styles.oldPrice}>₹{pkg.pricing.basePrice}</span>
                        )}
                        <span className={styles.finalPrice}>₹{pkg.pricing?.finalPrice || pkg.basic?.finalPrice}</span>
                        <span className={styles.perPerson}>/ person</span>
                     </div>
                   </div>

                   <p className={styles.taxesText}>
                      {pkg.pricing?.taxesIncluded ? "Includes all taxes and fees." : "Taxes not included."}
                   </p>

                   {pkg.availability?.seatsLeft > 0 && (
                      <p className={styles.seatsLeft}>🔥 Only <strong>{pkg.availability.seatsLeft}</strong> seats remaining!</p>
                   )}

                   <div className={styles.ctaGroup}>
                     <a href={`https://wa.me/${pkg.cta?.whatsapp?.replace('+', '')}`} className={styles.whatsappBtn} target="_blank" rel="noopener noreferrer">
                        Chat on WhatsApp
                     </a>
                     <a href={`tel:${pkg.cta?.call}`} className={styles.callBtn}>
                        Call Now
                     </a>
                   </div>
                   
                   <div className={styles.policies}>
                      <p>✅ {pkg.policies?.cancellation}</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
