export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/rentals/:path*',
    '/moulds/:path*',
    '/users/:path*',
  ],
};

