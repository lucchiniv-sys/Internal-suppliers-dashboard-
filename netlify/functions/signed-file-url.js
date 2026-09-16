// Sustainable Suppliers Dashboard — generates a short-lived signed URL for an
// existing uploaded file (EcoVadis PDF or questionnaire Excel), so a logged-in
// team member can view it. The shared "submissions" Storage bucket has no
// policy granting authenticated users direct read access, so this goes
// through the service role key server-side — but only after verifying the
// caller's own Supabase Auth session is valid. Without that check, anyone
// who found this endpoint could read any supplier's file without logging in.

const { createClient } = require('@supabase/supabase-js');

const SIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutes

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
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

  let filePath;
  try {
    const body = JSON.parse(event.body || '{}');
    filePath = body.file_path;
  } catch (err) {
    return respond(400, { error: 'Invalid request body.' });
  }
  if (!filePath || typeof filePath !== 'string') {
    return respond(400, { error: 'Missing file_path.' });
  }

  const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabaseAdmin.storage
    .from('submissions')
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error('Failed to create signed URL:', error);
    return respond(500, { error: 'Could not generate a link for this file.' });
  }

  return respond(200, { url: data.signedUrl });
};

function respond(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}
