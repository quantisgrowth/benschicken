// Universal Marketing & Lead Tracking for Meta Pixel, Google Analytics 4, GTM and Google Ads

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    _trackingConfig?: {
      googleAdsId?: string;
      googleAdsConversionLabel?: string;
    };
  }
}

export type TrackingConfig = {
  metaPixelId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
};

export function setTrackingConfig(config: TrackingConfig) {
  if (typeof window === "undefined") return;
  window._trackingConfig = {
    googleAdsId: config.googleAdsId,
    googleAdsConversionLabel: config.googleAdsConversionLabel,
  };
}

/**
 * Dispatches event to Meta Pixel (Facebook/Instagram)
 */
export function trackMeta(eventName: string, params?: Record<string, any>, isCustom = false) {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    if (isCustom) {
      window.fbq("trackCustom", eventName, params);
    } else {
      window.fbq("track", eventName, params);
    }
  } catch (err) {
    console.debug("[Tracking] Meta Pixel error:", err);
  }
}

/**
 * Dispatches event to Google Analytics 4 / Google Ads / GTM dataLayer
 */
export function trackGoogle(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;

  // 1. Google Analytics / Google Ads gtag
  if (window.gtag) {
    try {
      window.gtag("event", eventName, params);
    } catch (err) {
      console.debug("[Tracking] gtag error:", err);
    }
  }

  // 2. Google Tag Manager dataLayer
  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    } catch (err) {
      console.debug("[Tracking] dataLayer error:", err);
    }
  }
}

/**
 * Dispatches Google Ads specific conversion event if configured
 */
export function trackGoogleAdsConversion(value?: number, currency = "BRL") {
  if (typeof window === "undefined" || !window.gtag || !window._trackingConfig) return;
  const { googleAdsId, googleAdsConversionLabel } = window._trackingConfig;

  if (googleAdsId && googleAdsConversionLabel) {
    const sendTo = `${googleAdsId}/${googleAdsConversionLabel}`;
    try {
      window.gtag("event", "conversion", {
        send_to: sendTo,
        value: value ?? 0,
        currency,
      });
    } catch (err) {
      console.debug("[Tracking] Google Ads conversion error:", err);
    }
  }
}

/**
 * Event: Lead Captured (Form Submission)
 */
export function trackLeadSubmission(data: {
  interest: string;
  investment?: number;
  city?: string;
  uf?: string;
  experience?: string;
}) {
  const params = {
    content_name: "Formulário de Expansão / Franquia",
    content_category: data.interest,
    value: data.investment ?? 200000,
    currency: "BRL",
    city: data.city,
    state: data.uf,
    experience: data.experience,
  };

  // Meta standard 'Lead' event
  trackMeta("Lead", params);

  // GA4 standard 'generate_lead' event
  trackGoogle("generate_lead", {
    lead_type: data.interest,
    value: data.investment ?? 200000,
    currency: "BRL",
    city: data.city,
    uf: data.uf,
  });

  // Google Ads conversion
  trackGoogleAdsConversion(data.investment);
}

/**
 * Event: Contact via WhatsApp
 */
export function trackWhatsAppClick(locationName: string) {
  const params = {
    channel: "WhatsApp",
    location: locationName,
    content_name: `Clique WhatsApp - ${locationName}`,
  };

  // Meta standard 'Contact' event
  trackMeta("Contact", params);

  // GA4 / GTM
  trackGoogle("contact_whatsapp", params);
}

/**
 * Event: Download Commercial Presentation
 */
export function trackPresentationDownload(method: "manual" | "automatic" = "manual") {
  const params = {
    file_name: "Apresentacao-Comercial-Bens-Chicken.pdf",
    content_name: "Apresentação Comercial PDF",
    download_method: method,
  };

  // Meta
  trackMeta("ViewContent", params);
  trackMeta("DownloadPresentation", params, true);

  // GA4
  trackGoogle("file_download", params);
}

/**
 * Event: Selection of Business Model (Licenciamento / Franquia)
 */
export function trackModelSelect(modelId: string) {
  const params = {
    content_type: "business_model",
    item_id: modelId,
    content_name: modelId === "licenciamento" ? "Licenciamento de Marca" : "Franquia Dark Kitchen",
  };

  trackMeta("SelectBusinessModel", params, true);
  trackGoogle("select_content", params);
}

/**
 * Event: Testimonial Video Watch
 */
export function trackVideoWatch(testimonialName: string, city?: string) {
  const params = {
    video_title: testimonialName,
    video_provider: "Custom",
    location: city,
  };

  trackMeta("WatchTestimonial", params, true);
  trackGoogle("video_start", params);
}

/**
 * Event: Form Started / Focused
 */
export function trackFormStart() {
  trackMeta("InitiateCheckout", { content_name: "Início do Formulário de Lead" });
  trackGoogle("begin_checkout", { step: 1 });
}
