import type { Metadata } from "next";
import { ChatClient } from "@/components/chat-client";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "AI-chatt" };

export default function ChatPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sekundär funktion"
        title="Sortera en sak i taget."
        description="Chatten hjälper dig reflektera eller hitta ett litet nästa steg. Den är avsiktligt begränsad och försöker inte ersätta en människa."
      />
      <ChatClient />
    </>
  );
}
