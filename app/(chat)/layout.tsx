import { ChatLayoutWrapper } from "@/components/chat-layout-wrapper";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { getUser } from "@/lib/supabase/server";
import Script from "next/script";

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <ChatLayoutWrapper user={user ?? undefined}>
          {children}
        </ChatLayoutWrapper>
      </DataStreamProvider>
    </>
  );
}
