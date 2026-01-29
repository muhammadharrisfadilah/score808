const CacheService = (function() {
    let cache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    function get(key) {
        const cached = cache.get(key);
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        if (isExpired) {
            cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    function set(key, data) {
        cache.set(key, { 
            data, 
            timestamp: Date.now() 
        });
    }

    function clear() {
        cache.clear();
    }

    function deleteKey(key) {
        cache.delete(key);
    }

    return {
        get,
        set,
        clear,
        delete: deleteKey
    };
})();