/**
 * Native Google Maps Review Launcher & Deep Linking Helper
 * 
 * Provides:
 * - Mobile native Google Maps app deep linking via Android Intent URI
 * - Automatic Chrome / Mobile Browser fallback if Maps app is not installed
 * - iOS Universal Link handling to open Google Maps or Safari/Chrome
 * - Session-based return detection to greet customers with a celebratory success message
 *   after they post their review on Google.
 */

export interface GoogleMapsLaunchUrls {
  webUrl: string;
  androidIntentUrl: string;
  placeId: string | null;
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
}

const REVIEW_LAUNCH_KEY = "revasy_review_launched";

/**
 * Extracts a Google Place ID (e.g. ChIJ...) from a URL or explicit ID string.
 */
export function extractPlaceId(url?: string, explicitPlaceId?: string): string | null {
  if (explicitPlaceId && explicitPlaceId.trim()) {
    return explicitPlaceId.trim();
  }
  if (!url) return null;
  
  // 1. Direct ChIJ Place ID in string
  const chijMatch = url.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (chijMatch) return chijMatch[0];

  // 2. Query param placeid or place_id
  const queryMatch = url.match(/[?&]place(?:_)?id=([^&#]+)/i);
  if (queryMatch) return decodeURIComponent(queryMatch[1]);

  return null;
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Generates platform-specific launch URLs for Google Reviews:
 * - webUrl: Clean Google 1-click review URL (search.google.com/local/writereview?placeid=...)
 * - androidIntentUrl: Native Android intent for com.google.android.apps.maps with Chrome fallback
 */
export function getGoogleReviewTargetUrls(
  googleReviewUrl: string,
  placeId?: string
): GoogleMapsLaunchUrls {
  const extractedId = extractPlaceId(googleReviewUrl, placeId);
  const fallbackWebUrl = googleReviewUrl?.trim() || "https://search.google.com";

  // Standard clean review URL for web & universal links
  const webUrl = extractedId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(extractedId)}`
    : fallbackWebUrl;

  // Android Intent URI:
  // Launches Google Maps app directly to write review.
  // If Google Maps is not installed, Chrome automatically falls back to S.browser_fallback_url
  let androidIntentUrl = "";
  if (extractedId) {
    androidIntentUrl = `intent://search.google.com/local/writereview?placeid=${encodeURIComponent(
      extractedId
    )}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(
      webUrl
    )};end`;
  } else {
    const cleanUrl = webUrl.replace(/^https?:\/\//i, "");
    androidIntentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(
      webUrl
    )};end`;
  }

  const isMobile = isMobileDevice();
  const isAndroid = isAndroidDevice();
  const isIOS = isIOSDevice();

  return {
    webUrl,
    androidIntentUrl,
    placeId: extractedId,
    isMobile,
    isAndroid,
    isIOS,
  };
}

/**
 * Launches Google Maps for writing a review with native deep linking on mobile
 * and Chrome/browser fallback.
 */
export function launchGoogleMapsReview(options: {
  googleReviewUrl: string;
  placeId?: string;
  onOpened?: () => void;
}): { method: "intent" | "universal" | "window"; url: string } {
  const { webUrl, androidIntentUrl, isAndroid, isIOS } = getGoogleReviewTargetUrls(
    options.googleReviewUrl,
    options.placeId
  );

  // Store launch timestamp in sessionStorage so return detection can celebrate completion
  markReviewLaunched();

  if (options.onOpened) {
    options.onOpened();
  }

  if (typeof window === "undefined") {
    return { method: "window", url: webUrl };
  }

  if (isAndroid) {
    // Android Chrome: Native Maps Intent with Chrome fallback
    try {
      let hasBlurred = false;
      const onBlur = () => {
        hasBlurred = true;
        window.removeEventListener("blur", onBlur);
      };
      window.addEventListener("blur", onBlur);

      // Deep link to native Maps app
      window.location.href = androidIntentUrl;

      // Fallback timer: in case the specific mobile browser does not process intent URLs
      setTimeout(() => {
        window.removeEventListener("blur", onBlur);
        if (!hasBlurred && document.visibilityState === "visible") {
          window.open(webUrl, "_blank", "noopener,noreferrer");
        }
      }, 1200);

      return { method: "intent", url: androidIntentUrl };
    } catch {
      window.open(webUrl, "_blank", "noopener,noreferrer");
      return { method: "window", url: webUrl };
    }
  }

  if (isIOS) {
    // iOS Safari / Chrome: Universal link handles opening Google Maps app if installed,
    // otherwise opens Google write review page directly in browser
    try {
      window.location.href = webUrl;
      return { method: "universal", url: webUrl };
    } catch {
      window.open(webUrl, "_blank", "noopener,noreferrer");
      return { method: "window", url: webUrl };
    }
  }

  // Desktop or standard browser
  window.open(webUrl, "_blank", "noopener,noreferrer");
  return { method: "window", url: webUrl };
}

/**
 * Record that a review handoff was initiated.
 */
export function markReviewLaunched(): void {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(REVIEW_LAUNCH_KEY, Date.now().toString());
    } catch {
      // Ignore sessionStorage errors in restricted environments
    }
  }
}

/**
 * Checks if the user has returned from Google Maps/Chrome after posting their review.
 * Returns true if an active launch was in progress and elapsed time >= minElapsedMs.
 * Clears the stored flag when returning true so the celebration only triggers once.
 */
export function checkReviewReturn(minElapsedMs = 2500): boolean {
  if (typeof window === "undefined") return false;
  try {
    const item = window.sessionStorage.getItem(REVIEW_LAUNCH_KEY);
    if (!item) return false;
    const launchTime = parseInt(item, 10);
    const elapsed = Date.now() - launchTime;
    if (elapsed >= minElapsedMs) {
      window.sessionStorage.removeItem(REVIEW_LAUNCH_KEY);
      return true;
    }
  } catch {
    // Ignore sessionStorage errors
  }
  return false;
}

/**
 * Clears the stored review launch state.
 */
export function clearReviewLaunched(): void {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(REVIEW_LAUNCH_KEY);
    } catch {}
  }
}
