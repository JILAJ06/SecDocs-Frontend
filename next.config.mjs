// La web y la API se sirven bajo el MISMO origen: /api/* se reenvía al backend.
// Así la cookie de sesión es de primera parte (SameSite=Strict funciona) y no hace falta CORS.
// En producción (Vercel → Railway) basta con cambiar API_INTERNAL_URL.
const API = process.env.API_INTERNAL_URL || 'http://localhost:4000';
const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  // Next.js inyecta scripts inline para hidratar; en dev además necesita eval.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API}/api/:path*` }];
  },
  async headers() {
    const common = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ];
    return [
      { source: '/:path*', headers: common },
      // La página del receptor contiene el token en la URL: nunca se cachea.
      { source: '/s/:token*', headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }] },
    ];
  },
};

export default nextConfig;
