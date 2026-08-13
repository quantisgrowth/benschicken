import { useEffect } from "react";
import type { SiteTexts } from "@/lib/site-content";
import { setTrackingConfig } from "@/lib/tracking";

export function TrackingScripts({ texts }: { texts?: Partial<SiteTexts> }) {
  const metaPixelId = texts?.metaPixelId?.trim();
  const googleAnalyticsId = texts?.googleAnalyticsId?.trim();
  const googleTagManagerId = texts?.googleTagManagerId?.trim();
  const googleAdsId = texts?.googleAdsId?.trim();
  const googleAdsConversionLabel = texts?.googleAdsConversionLabel?.trim();
  const customHeadScripts = texts?.customHeadScripts?.trim();

  useEffect(() => {
    // Registra IDs na memória global do tracking
    setTrackingConfig({
      metaPixelId,
      googleAnalyticsId,
      googleTagManagerId,
      googleAdsId,
      googleAdsConversionLabel,
    });

    if (typeof window === "undefined") return;

    // 1. Meta Pixel
    if (metaPixelId && !document.getElementById("meta-pixel-script")) {
      const script = document.createElement("script");
      script.id = "meta-pixel-script";
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement("noscript");
      noscript.id = "meta-pixel-noscript";
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" />`;
      document.body.appendChild(noscript);
    }

    // 2. Google Tag Manager (GTM)
    if (googleTagManagerId && !document.getElementById("gtm-script")) {
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${googleTagManagerId}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement("noscript");
      noscript.id = "gtm-noscript";
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.appendChild(noscript);
    }

    // 3. Google Analytics 4 (GA4) / Google Ads (gtag.js)
    const primaryGtagId = googleAnalyticsId || googleAdsId;
    if (primaryGtagId && !document.getElementById("google-gtag-script")) {
      // Cria a tag base gtag.js
      const scriptSrc = document.createElement("script");
      scriptSrc.id = "google-gtag-script";
      scriptSrc.async = true;
      scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`;
      document.head.appendChild(scriptSrc);

      const scriptInline = document.createElement("script");
      scriptInline.id = "google-gtag-init";
      let inlineCode = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      `;
      if (googleAnalyticsId) {
        inlineCode += `\n gtag('config', '${googleAnalyticsId}', { send_page_view: true });`;
      }
      if (googleAdsId && googleAdsId !== googleAnalyticsId) {
        inlineCode += `\n gtag('config', '${googleAdsId}');`;
      }
      scriptInline.innerHTML = inlineCode;
      document.head.appendChild(scriptInline);
    }

    // 4. Custom Scripts (se houver)
    if (customHeadScripts && !document.getElementById("custom-head-scripts-container")) {
      const container = document.createElement("div");
      container.id = "custom-head-scripts-container";
      container.style.display = "none";
      // Executa scripts adicionais
      try {
        const range = document.createRange();
        range.selectNode(document.head);
        const fragment = range.createContextualFragment(customHeadScripts);
        document.head.appendChild(fragment);
      } catch (err) {
        console.warn("[Tracking] Falha ao injetar custom scripts:", err);
      }
    }
  }, [
    metaPixelId,
    googleAnalyticsId,
    googleTagManagerId,
    googleAdsId,
    googleAdsConversionLabel,
    customHeadScripts,
  ]);

  return null;
}
