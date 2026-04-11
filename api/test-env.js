// Simple test endpoint to check if environment variables are set
export default async function handler(req, res) {
  const checks = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    JWT_SECRET: !!process.env.JWT_SECRET,
  };

  return res.status(200).json({
    message: 'Environment variable check',
    variables: checks,
    note: 'true = variable is set, false = variable is missing'
  });
}
