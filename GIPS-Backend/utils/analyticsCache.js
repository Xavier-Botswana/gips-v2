/**
 * Simple in-memory cache with TTL support
 * Similar to Materialized Views - stores computed results with expiration
 */

const appLogger = require('./appLogger');
const isDev = process.env.NODE_ENV === 'development';

class AnalyticsCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalKeys: 0,
    };
    
    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Generate cache key from request parameters
   * @param {string} endpoint - API endpoint name (e.g., 'by-faculty')
   * @param {Object} query - Query parameters
   * @returns {string} Cache key
   */
  static generateKey(endpoint, query) {
    // Sort keys to ensure consistent hashing
    const sortedQuery = Object.keys(query || {})
      .sort()
      .reduce((acc, key) => {
        if (query[key] !== undefined && query[key] !== '') {
          acc[key] = query[key];
        }
        return acc;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedQuery)}`;
  }

  /**
   * Get cached data or compute and store
   * @param {string} key - Cache key
   * @param {Function} computeFn - Async function to compute data if not cached
   * @param {number} ttlMinutes - Time to live in minutes
   * @returns {Object} { data, cached: boolean, computedAt: Date }
   */
  async get(key, computeFn, ttlMinutes = 15) {
    const cached = this.cache.get(key);
    
    if (cached && cached.expiresAt > Date.now()) {
      this.stats.hits += 1;
      return {
        data: cached.data,
        cached: true,
        computedAt: cached.computedAt,
        expiresAt: cached.expiresAt,
      };
    }
    
    // Cache miss - compute fresh data
    this.stats.misses += 1;
    const data = await computeFn();
    
    const now = Date.now();
    const expiresAt = now + (ttlMinutes * 60 * 1000);
    
    this.cache.set(key, {
      data,
      computedAt: now,
      expiresAt,
    });
    
    this.stats.totalKeys = this.cache.size;
    
    return {
      data,
      cached: false,
      computedAt: now,
      expiresAt,
    };
  }

  /**
   * Invalidate specific cache entry or pattern
   * @param {string|RegExp} pattern - Key or pattern to invalidate
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
    this.stats.totalKeys = this.cache.size;
  }

  /**
   * Invalidate all analytics caches
   */
  invalidateAll() {
    this.cache.clear();
    this.stats.totalKeys = 0;
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        cleaned += 1;
      }
    }
    
    this.stats.totalKeys = this.cache.size;
    
    if (cleaned > 0 && isDev) {
      // Only log in development mode
      appLogger.debug(`[AnalyticsCache] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    };
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
const analyticsCache = new AnalyticsCache();

module.exports = analyticsCache;
