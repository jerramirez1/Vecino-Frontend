export const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "12345678";

export const usuariosE2E = {
  consumidor: {
    email: "e2e-test@example.com",
    password: E2E_TEST_PASSWORD,
  },
  consumidorPerfil: {
    email: "e2e-consumidor@example.com",
    password: E2E_TEST_PASSWORD,
  },
  vendedor: {
    email: "e2e-vendedor@example.com",
    password: E2E_TEST_PASSWORD,
  },
} as const;

export async function iniciarSesion(
  page: import("@playwright/test").Page,
  email: string,
  password: string = E2E_TEST_PASSWORD,
) {
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electronico").fill(email);
  await page.getByLabel("Contrasena").fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes("iniciar-sesion"), { timeout: 15_000 }),
    page.getByRole("button", { name: "Iniciar sesion" }).click(),
  ]);
}
