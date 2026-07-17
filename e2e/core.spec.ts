import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("pepply-cookie-choice", "necessary");
  });
});

test("landing page explains the one-minute ritual", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Avsluta dagen lite lugnare/i })).toBeVisible();
  await expect(page.getByText("Ingen oändlig feed", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Prova demoläget" })).toHaveAttribute("href", "/hem");
});

test("user can complete the core evening ritual", async ({ page }) => {
  await page.goto("/hem");
  await page.getByRole("link", { name: /Börja min minut/ }).click();
  await expect(page).toHaveURL(/\/ritual$/);
  await page.getByRole("button", { name: "Trött" }).click();
  await page.getByRole("button", { name: "Visa mitt meddelande" }).click();
  await expect(page.getByText("Ditt meddelande i kväll")).toBeVisible();
  await expect(page.getByText("Det räcker för i kväll", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Spara" })).toBeVisible();
});

test("onboarding can be completed in demo mode", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByLabel("Tilltalsnamn").fill("Ruben");
  await page.getByRole("button", { name: /Fortsätt/ }).click();
  await page.getByRole("button", { name: /Studier/i }).click();
  await page.getByRole("button", { name: /Fortsätt/ }).click();
  await page.getByRole("button", { name: /Rak och ärlig/i }).click();
  await page.getByRole("button", { name: /Fortsätt/ }).click();
  await page.getByRole("button", { name: /Gör Pepply klart/ }).click();
  await expect(page).toHaveURL(/\/hem$/);
});

test("chat deliberately stops after bounded use", async ({ page }) => {
  await page.goto("/ai-chatt");
  await page.getByRole("button", { name: "Hjälp mig sortera dagen" }).click();
  await expect(page.getByText(/Vad är den enda del|Det låter som/i)).toBeVisible();
  await expect(page.getByText("AI kan ha fel", { exact: false })).toBeVisible();
});
