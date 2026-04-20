/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
    NEXT_PUBLIC_FASTAPI_URL:
      process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL
  }
};

export default nextConfig;
