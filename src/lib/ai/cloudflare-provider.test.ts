import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { CloudflareAiProvider } from "@/lib/ai/cloudflare-provider";
import type { RitualInput } from "@/lib/types";

const ritualInput: RitualInput = {
  mood: "Trött",
  note: "Matten tog mycket energi.",
  question: "Vad tog mest energi i dag?",
  tone: "lugn och mjuk",
  length: "kort",
  areas: ["studier"],
};

describe("CloudflareAiProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the selected Workers AI model with a server authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            response:
              "Du behöver inte lösa resten i kväll. Låt matten vänta tills du har fått vila.",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new CloudflareAiProvider(
      "a".repeat(32),
      "server-secret-token",
      "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
    );
    const result = await provider.generateRitualMessage(ritualInput);

    expect(result.provider).toBe("cloudflare-workers-ai");
    expect(result.text).toContain("vila");
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://api.cloudflare.com/client/v4/accounts/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/ai/run/@cf/meta/llama-3.1-8b-instruct-fp8-fast",
    );
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer server-secret-token",
    );
    expect(init.cache).toBe("no-store");

    const body = JSON.parse(String(init.body));
    expect(body.max_tokens).toBe(160);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages.at(-1).content).toContain("Matten tog mycket energi");
  });

  it("throws on a depleted free allocation so the service can use fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            errors: [{ message: "Daily free allocation exhausted" }],
          }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const provider = new CloudflareAiProvider(
      "a".repeat(32),
      "server-secret-token",
      "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
    );

    await expect(provider.generateRitualMessage(ritualInput)).rejects.toThrow(
      "Daily free allocation exhausted",
    );
  });

  it("uses the advanced model and includes bounded chat history", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            response:
              "Det du beskriver hänger ihop med pressen från matten. Vilken del skulle bli lättare om du gjorde den mindre?",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new CloudflareAiProvider(
      "a".repeat(32),
      "server-secret-token",
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "advanced",
    );
    await provider.generateChatReply({
      message: "Hur gör jag det mindre?",
      turnCount: 2,
      recentMessages: [
        { role: "user", content: "Jag fastnar i matten." },
        {
          role: "assistant",
          content: "Vi kan börja med den del som tar mest energi.",
        },
      ],
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(
      "/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    );
    const body = JSON.parse(String(init.body));
    expect(body.messages).toEqual(
      expect.arrayContaining([
        { role: "user", content: "Jag fastnar i matten." },
        {
          role: "assistant",
          content: "Vi kan börja med den del som tar mest energi.",
        },
      ]),
    );
    expect(body.messages[0].content).toContain("Svarsläge: Avancerat");
    expect(body.messages.at(-1)).toEqual({
      role: "user",
      content: "Hur gör jag det mindre?",
    });
  });
});
