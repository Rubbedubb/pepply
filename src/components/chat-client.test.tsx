import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatClient } from "@/components/chat-client";

describe("ChatClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the selected mode and recent demo conversation context", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversationId: "28c81d10-c690-46b7-9cbd-c33a89ef5f92",
          message: "Vi kan börja med den del som tar mest energi.",
          safetyLevel: "none",
          aiMode: "advanced",
          source: "cloudflare-workers-ai",
          quotaReached: false,
          suggestEnding: false,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversationId: "28c81d10-c690-46b7-9cbd-c33a89ef5f92",
          message: "Gör bara den första uppgiften och låt resten vänta.",
          safetyLevel: "none",
          aiMode: "advanced",
          source: "cloudflare-workers-ai",
          quotaReached: false,
          suggestEnding: false,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<ChatClient />);
    fireEvent.click(screen.getByRole("button", { name: /Avancerat/ }));

    const input = screen.getByPlaceholderText("Skriv kort vad som tar plats…");
    fireEvent.change(input, { target: { value: "Jag fastnar i matten." } });
    fireEvent.click(screen.getByRole("button", { name: "Skicka" }));
    await screen.findByText("Vi kan börja med den del som tar mest energi.");

    fireEvent.change(input, { target: { value: "Hur gör jag det mindre?" } });
    fireEvent.click(screen.getByRole("button", { name: "Skicka" }));
    await screen.findByText(
      "Gör bara den första uppgiften och låt resten vänta.",
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const secondRequest = JSON.parse(
      String((fetchMock.mock.calls[1][1] as RequestInit).body),
    );
    expect(secondRequest.aiMode).toBe("advanced");
    expect(secondRequest.recentMessages).toEqual([
      { role: "user", content: "Jag fastnar i matten." },
      {
        role: "assistant",
        content: "Vi kan börja med den del som tar mest energi.",
      },
    ]);
  });
});
