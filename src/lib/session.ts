import { auth } from "@/lib/auth-server";

type SessionUserWithId = {
  id?: string;
};

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const user = (session?.user ?? undefined) as SessionUserWithId | undefined;
  const userId = user?.id;
  if (!userId) throw new Error("unauthorized");
  return userId;
}
