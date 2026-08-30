import { safeLogger } from './logger';

export interface AnalyticsEvent {
  id: string;
  name: 'product_view' | 'add_to_cart' | 'remove_from_cart' | 'checkout_start' | 'purchase_complete' | 'delivery_info_confirmed' | 'wishlist_toggle' | 'search_query';
  timestamp: number;
  metadata: Record<string, unknown>;
  userEmail?: string;
}

class AnalyticsEngine {
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  private getStorageKey(): string {
    return 'olma_marketplace_analytics';
  }

  public track(
    name: AnalyticsEvent['name'],
    metadata: Record<string, unknown> = {}
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const savedEvents = this.getEvents();
      
      const trimmed = savedEvents.slice(-499);
      
      const newEvent: AnalyticsEvent = {
        id: `evt_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
        name,
        timestamp: Date.now(),
        metadata,
        userEmail: typeof window !== 'undefined' ? (sessionStorage.getItem('currentUserEmail') || localStorage.getItem('currentUserEmail') || 'Visiteur Anonyme') : 'Visiteur Anonyme'
      };

      trimmed.push(newEvent);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(trimmed));
      
      // Add to queue for server sync
      this.eventQueue.push(newEvent);
      this.scheduleFlush();

      if (import.meta.env.DEV) {
        safeLogger.info(`[Olma Analytics Engine] Tracked "${name}"`);
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        safeLogger.error('Failed to log analytics event', { err: err instanceof Error ? err.message : "Erreur" });
      }
    }
  }

  private scheduleFlush() {
    if (this.flushTimeout) clearTimeout(this.flushTimeout);
    this.flushTimeout = setTimeout(() => this.flushEvents(), 3000);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      await fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        safeLogger.error("Failed to sync analytics events", { err: err instanceof Error ? err.message : "Erreur" });
      }
      // Revert events if failed? Simple fallback: don't revert for now.
    }
  }

  public getEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.getStorageKey());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getStorageKey(), JSON.stringify([]));
  }

  // Calculate dynamic analytics KPI summaries
  public getInsights() {
    const events = this.getEvents();
    
    let views = 0;
    let carts = 0;
    let purchases = 0;
    let totalRevenue = 0;
    
    const categoryHits: Record<string, number> = {};
    const productViews: Record<string, { name: string; count: number }> = {};
    const searchQueries: Record<string, number> = {};

    events.forEach(evt => {
      if (evt.name === 'product_view') {
        views++;
        const pId = typeof evt.metadata.productId === 'string' ? evt.metadata.productId : undefined;
        const pName = typeof evt.metadata.name === 'string' ? evt.metadata.name : undefined;
        if (pId) {
          if (!productViews[pId]) productViews[pId] = { name: pName || pId, count: 0 };
          productViews[pId].count++;
        }
        
        const cat = typeof evt.metadata.category === 'string' ? evt.metadata.category : undefined;
        if (cat) {
          categoryHits[cat] = (categoryHits[cat] || 0) + 1;
        }
      } else if (evt.name === 'add_to_cart') {
        carts++;
        const cat = typeof evt.metadata.category === 'string' ? evt.metadata.category : undefined;
        if (cat) {
          categoryHits[cat] = (categoryHits[cat] || 0) + 1.5; // slight extra weight for intent
        }
      } else if (evt.name === 'purchase_complete') {
        purchases++;
        const amount = typeof evt.metadata.totalAmount === 'number' ? evt.metadata.totalAmount : 0;
        totalRevenue += amount;
      } else if (evt.name === 'search_query') {
        const queryVal = typeof evt.metadata.query === 'string' ? evt.metadata.query : undefined;
        if (queryVal) {
          searchQueries[queryVal] = (searchQueries[queryVal] || 0) + 1;
        }
      }
    });

    const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(1) : '0';
    const addToCartRate = views > 0 ? ((carts / views) * 100).toFixed(1) : '0';

    return {
      totalViews: views,
      totalCarts: carts,
      totalPurchases: purchases,
      totalRevenue,
      conversionRate,
      addToCartRate,
      categoryHits: Object.entries(categoryHits).map(([name, weight]) => ({ name, value: Math.round(weight) })),
      productViews: Object.values(productViews).sort((a, b) => b.count - a.count).slice(0, 5),
      searchQueries: Object.entries(searchQueries).map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
