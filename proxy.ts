export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/swipe", "/library", "/me", "/leaderboard", "/profile/:path*"],
};
