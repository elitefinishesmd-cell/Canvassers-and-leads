const { supabase } = require('../supabase');

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: user, error } = await supabase
    .from('app_users')
    .select('id, name, role, is_active')
    .eq('id', req.session.userId)
    .single();

  if (error || !user || !user.is_active) {
    req.session.destroy(() => {});
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

module.exports = { requireAuth, requireRole };
