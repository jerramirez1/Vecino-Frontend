import { test, expect } from "@playwright/test";
import { iniciarSesion, usuariosE2E } from "./fixtures";

test("E2E-03: Consumidor ve perfil", async ({ page }) => {
  await iniciarSesion(page, usuariosE2E.consumidorPerfil.email, usuariosE2E.consumidorPerfil.password);

  await expect(page).not.toHaveURL(/iniciar-sesion/);

  await page.goto("/perfil");
  await expect(page).toHaveURL(/perfil/);
  await expect(page.getByRole("heading", { name: /Informacion Personal/i })).toBeVisible();
});
