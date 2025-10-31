const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

function parseCookie(header) {
  const out = {};
  if (!header) return out;
  const parts = header.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = decodeURIComponent(part.slice(idx + 1).trim());
    if (k) out[k] = v;
  }
  return out;
}

// Require a valid short-lived OTP token in cookie (or Authorization: Bearer)
module.exports = function requireOtp(req, res, next) {
  try {
    let token = null;
    // Prefer cookie
    const cookies = parseCookie(req.headers.cookie || '');
    if (cookies && cookies.otp_token) token = cookies.otp_token;
    // Fallback to Authorization header
    if (!token) {
      const auth = req.headers.authorization || '';
      if (auth.startsWith('Bearer ')) token = auth.substring('Bearer '.length);
    }
    if (!token) {
      return res.status(401).json({ message: 'OTP verification required' });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.purpose !== 'otp') {
      return res.status(401).json({ message: 'OTP verification required' });
    }
    // If the route specifies a category, ensure it matches (if cookie has category)
    const requestedCategory = (req.params && req.params.category) || (req.query && req.query.category) || null;
    if (requestedCategory && payload.category && String(payload.category).toLowerCase() !== String(requestedCategory).toLowerCase()) {
      return res.status(401).json({ message: 'OTP verification required for this category' });
    }
    // Attach to req for downstream usage
    req.otp = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'OTP expired or invalid' });
  }
};
