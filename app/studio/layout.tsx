import { StudioLayoutWrapper } from "@/components/studio/studio-layout-wrapper";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <StudioLayoutWrapper user={user}>
      {children}
    </StudioLayoutWrapper>
  );
}
