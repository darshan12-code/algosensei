// server/lib/rateLimiter.js
// Fix #3: The old Map grew forever — entries were never deleted after expiry.
// Added a cleanup interval that runs every minute and prunes stale entries.

const userCalls          = new Map();
const MAX_CALLS_PER_MINUTE = 15;

// Prune expired entries every 60 s so the Map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of userCalls) {
    if (now > entry.resetAt) userCalls.delete(key);
  }
}, 60_000);

const rateLimit = (req, res, next) => {
  const userId = req.user?._id?.toString() ?? req.user?.id?.toString();
  if (!userId) return next(); // unauthenticated — let verifyToken handle it

  const now = Date.now();
  let entry = userCalls.get(userId);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 60_000 };
    userCalls.set(userId, entry);
  }

  entry.count++;

  if (entry.count > MAX_CALLS_PER_MINUTE) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return res.status(429).json({
      error:      `Rate limit exceeded. Try again in ${retryAfter}s.`,
      retryAfter,
    });
  }

  next();
};

export default rateLimit;