/**
 * S3 URLs stored in the DB have %2F-encoded path separators.
 * Next.js Image optimization re-encodes %, producing %252F which S3 can't resolve.
 * Decoding once gives the correct URL for Next.js <Image> to optimize properly.
 */
export function decodeS3Url(url) {
  if (!url) return url;
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}
