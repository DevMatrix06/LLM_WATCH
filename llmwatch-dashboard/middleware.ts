import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/admin(.*)',
  '/api/waitlist(.*)',
  '/api/analytics(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Clerk's recommended matcher for Next.js App Router (v5+)
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jfe|ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|otf|eot)).*)',
    '/(api|trpc)(.*)',
  ],
};
