// Serves the Supabase URL and anon key to the browser at runtime, so neither
// value has to be committed to the repo. The anon key is public-by-design and
// protected by RLS — this function only keeps it out of git.

exports.handler = async function () {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Supabase is not configured.' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    })
  };
};
