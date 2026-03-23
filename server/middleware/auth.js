// server/middleware/auth.js
import jwt from 'jsonwebtoken';
// After verifying token, block writes for demo user on sensitive routes
export const blockDemo = (req, res, next) => {
  if (req.user?.isDemo) {
    return res.status(403).json({ error: 'Not available in demo mode' });
  }
  next();
};
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach only what the token carries — no DB round-trip
    req.user = { _id: decoded.id, id: decoded.id, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default verifyToken;