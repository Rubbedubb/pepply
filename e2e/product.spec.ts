import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("pepply-cookie-choice", "necessary");
  });
});

test("authentication pages expose safe account flows", async ({ page }) => {
  await page.goto("/skapa-konto");
  await expect(page.getByRole("heading", { name: /Gör Pepply till ditt/i })).toBeVisible();
  await expect(page.getByLabel("E-post")).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("Lösenord")).toHaveAttribute(
    "autocomplete",
    "new-password",
  );
});

test("a goal can be created and its first step completed", async ({ page }) => {
  await page.goto("/mal");
  await page.getByRole("button", { name: /Skapa ett nytt mål/i }).click();
  await page.getByLabel("Vad vill du göra?").fill("Läsa i tio minuter");
  await page.getByRole("button", { name: /Skapa mål/i }).click();
  const goal = page.getByRole("heading", { name: "Läsa i tio minuter" });
  await expect(goal).toBeVisible();
  const card = goal.locator(
    "xpath=ancestor::div[contains(@class,'rounded-')][1]",
  );
  await card.getByRole("button", { name: /Bestäm minsta möjliga första steg/i }).click();
  await expect(card.getByText("100%")).toBeVisible();
});

test("history and saved messages update after a ritual", async ({ page }) => {
  await page.goto("/ritual");
  await page.getByRole("button", { name: "Trött" }).click();
  await page.getByRole("button", { name: "Visa mitt meddelande" }).click();
  await page.getByRole("button", { name: "Spara" }).click();
  await page.goto("/historik");
  await expect(page.getByText("Meddelanden du vill behålla")).toBeVisible();
  await expect(page.getByText(/Du får vara trött/i)).toBeVisible();
});

test("community contributions always enter moderation", async ({ page }) => {
  await page.goto("/bidra");
  await page
    .getByLabel("Ditt peppmeddelande")
    .fill("Det som blev ofärdigt i dag får vänta tills du har mer kraft.");
  await page.getByText(/Jag bekräftar att jag har skrivit texten själv/i).click();
  await page.getByRole("button", { name: /Skicka för granskning/i }).click();
  await expect(page.getByRole("heading", { name: /Nu granskas texten/i })).toBeVisible();
});

test("a generated message can be reported", async ({ page }) => {
  await page.goto("/ritual");
  await page.getByRole("button", { name: "Okej" }).click();
  await page.getByRole("button", { name: "Visa mitt meddelande" }).click();
  await page.getByRole("button", { name: "Rapportera" }).click();
  await page.getByRole("button", { name: "Kändes inte relevant" }).click();
  await expect(page.getByRole("button", { name: "Rapporterat" })).toBeVisible();
});

test("premium is honest when checkout is not configured", async ({ page }) => {
  await page.goto("/premium");
  await page.getByRole("button", { name: /Välj Premium/i }).click();
  await expect(page.getByRole("status")).toContainText(/Demoläge:/i);
});

test("ads appear only after a non-crisis completed ritual", async ({ page }) => {
  await page.goto("/ritual");
  await page.getByRole("button", { name: "Lugn" }).click();
  await page.getByRole("button", { name: "Visa mitt meddelande" }).click();
  await expect(page.getByLabel("Annons från Bokhörnan")).toBeVisible();
});

test("account export returns a machine-readable response", async ({ request }) => {
  const response = await request.get("/api/account/export");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/json");
});

test("the primary flow is keyboard reachable", async ({ page }) => {
  await page.goto("/hem");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Hoppa till innehållet" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
