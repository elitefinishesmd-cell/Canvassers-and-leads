const jwt = require('jsonwebtoken');
const { supabase } = require('../supabase');

const JWT_SECRET = process.env.SESSION_SECRET || 'elite-finishes-dev-secret';

function getToken(req) {
  // Check cookie first, then Authorization header
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = cookie.split(';').find(c => c.trim().startsWith('ef_token='));
    if (match) return match.split('=')[1].trim();
  }
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function setTokenCookie(res, token) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `ef_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

function clearTokenCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `ef_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

async function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: user, error } = await supabase
    .from('app_users')
    .select('id, name, role, is_active')
    .eq('id', payload.userId)
    .single();

  if (error || !user || !user.is_active) {
    return res.status(401).json({ error: 'Account not active' });
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, signToken, setTokenCookie, clearTokenCookie };
