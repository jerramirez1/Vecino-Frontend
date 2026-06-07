import { test, expect } from "@playwright/test";
import { iniciarSesion, usuariosE2E } from "./fixtures";

test("E2E-02: Comerciante ve panel", async ({ page }) => {
  await iniciarSesion(page, usuariosE2E.vendedor.email, usuariosE2E.vendedor.password);

  await expect(page).not.toHaveURL(/iniciar-sesion/);

  await page.goto("/vendedor");
  await expect(page.getByRole("link", { name: "Crear negocio" })).toBeVisible();
});
