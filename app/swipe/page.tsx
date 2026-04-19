import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SwipeDeck from "./SwipeDeck";

export default async function SwipePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return <SwipeDeck />;
}
