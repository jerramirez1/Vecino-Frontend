import { test, expect } from "@playwright/test";
import { iniciarSesion, usuariosE2E } from "./fixtures";

test("E2E-01: Registro y login de consumidor", async ({ page }) => {
  await page.goto("/registro");
  await expect(page).toHaveURL(/registro/);

  await expect(page.getByRole("heading", { name: /Unete a la plaza digital/i })).toBeVisible();

  await page.goto("/iniciar-sesion");
  await expect(page).toHaveURL(/iniciar-sesion/);

  await iniciarSesion(page, usuariosE2E.consumidor.email, usuariosE2E.consumidor.password);

  await expect(page).not.toHaveURL(/iniciar-sesion/);
});
