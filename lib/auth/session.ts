import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function requireUserSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
