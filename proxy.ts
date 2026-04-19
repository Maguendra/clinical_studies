export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/swipe", "/library", "/me", "/leaderboard", "/profile/:path*"],
};
