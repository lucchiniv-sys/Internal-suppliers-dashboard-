// Sustainable Suppliers Dashboard — Manage Users screen data source.
// Lists every invited Supabase Auth account (there is no profiles table; the
// account list itself only exists in auth.users, which is only readable
// server-side with the service role key) together with each one's role from
// public.user_roles, or null when none has been assigned yet. Gated so it
// only ever returns data to a caller whose own user_roles row says
// administrator — verified here, never trusted from the browser.

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return respond(405, { error: 'Method not allowed.' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase is not fully configured.');
    return respond(500, { error: 'This function is not configured.' });
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return respond(401, { error: 'Missing or invalid authorization.' });
  }
  const token = authHeader.slice('Bearer '.length);

  const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
  if (userErr || !userData || !userData.user) {
    return respond(401, { error: 'Invalid or expired session — please sign in again.' });
  }

  const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // The role check is done with the admin client against the real table,
  // never trusted from a header or the browser.
  const { data: callerRole, error: roleErr } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (roleErr) {
    console.error('Failed to read caller role:', roleErr);
    return respond(500, { error: 'Could not verify your access.' });
  }
  if (!callerRole || callerRole.role !== 'administrator') {
    return respond(403, { error: 'Only an Administrator can view this.' });
  }

  const { data: usersPage, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) {
    console.error('Failed to list users:', listErr);
    return respond(500, { error: 'Could not load the user list.' });
  }

  const { data: roleRows, error: rolesErr } = await supabaseAdmin
    .from('user_roles')
    .select('user_id, role');
  if (rolesErr) {
    console.error('Failed to load roles:', rolesErr);
    return respond(500, { error: 'Could not load role assignments.' });
  }

  const roleByUserId = {};
  (roleRows || []).forEach(function (r) { roleByUserId[r.user_id] = r.role; });

  const users = (usersPage.users || []).map(function (u) {
    return {
      id: u.id,
      email: u.email,
      role: roleByUserId[u.id] || null
    };
  });

  return respond(200, { users: users });
};

function respond(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}
