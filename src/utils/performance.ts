export const trackPerformance = () => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.startTime,
          domLoad: navigation.domContentLoadedEventEnd - navigation.startTime,
          fullLoad: navigation.loadEventEnd - navigation.startTime,
          url: window.location.pathname,
          timestamp: Date.now()
        };
        
        const event = {
          type: 'performance',
          name: 'page_load_performance',
          url: window.location.pathname,
          data: metrics,
          timestamp: Date.now()
        };
        
        // Use a keepalive fetch to send analytics data
        fetch('/api/v1/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: [event] }),
          keepalive: true
        }).catch(() => {
          // Silent catch for analytics failure
        });
      }
    }, 0);
  });
};
