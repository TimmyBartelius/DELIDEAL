using System;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;

namespace MyAppBackend
{
    public class RateLimiter
    {
        private readonly int _maxAttempts;
        private readonly TimeSpan _window;
        private readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> _attempts = new();

        public RateLimiter(int maxAttempts, TimeSpan window)
        {
            _maxAttempts = maxAttempts;
            _window = window;
        }

        public bool IsLimited(string key)
        {
            var now = DateTime.UtcNow;
            var entry = _attempts.GetOrAdd(key, _ => (0, now));
            if (now - entry.WindowStart > _window)
            {
                _attempts[key] = (1, now);
                return false;
            }
            if (entry.Count + 1 > _maxAttempts)
            {
                return true;
            }
            _attempts[key] = (entry.Count + 1, entry.WindowStart);
            return false;
        }
    }
}
