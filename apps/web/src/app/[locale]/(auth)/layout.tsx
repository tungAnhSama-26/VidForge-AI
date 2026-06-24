import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Nếu đã đăng nhập, redirect về dashboard
  if (session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
