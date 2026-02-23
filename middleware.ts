export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/entries/:path*", "/projects/:path*", "/clients/:path*", "/reports/:path*", "/settings/:path*"]
};
