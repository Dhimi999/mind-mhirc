import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const WebVitals = () => {
  useEffect(() => {
    // Import web-vitals dynamically to avoid blocking
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      // Send to analytics (you can replace this with your preferred analytics service)
      const sendToAnalytics = (metric: any) => {
        // Example: Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
          });
        }
        
        // Console log for development
        console.log(`${metric.name}: ${metric.value}`);
      };

      onCLS(sendToAnalytics);
      onINP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    });
  }, []);

  return null;
};

export default WebVitals;