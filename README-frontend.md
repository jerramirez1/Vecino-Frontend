# Vecino - Frontend

Interfaz web del sistema **Vecino**, una plataforma de marketplace hiperlocal para conectar comerciantes, emprendedores y compradores dentro de una misma zona geografica.

## Tabla de contenido

- [Descripcion general](#descripcion-general)
- [Stack tecnico](#stack-tecnico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Instalacion](#instalacion)
- [Variables de entorno](#variables-de-entorno)
- [Ejecucion](#ejecucion)
- [Pruebas E2E (Playwright)](#pruebas-e2e-playwright)
- [Autenticacion con Supabase](#autenticacion-con-supabase)
- [Interfaces y flujos implementados](#interfaces-y-flujos-implementados)
- [Guia de diseno visual](#guia-de-diseno-visual)
- [Referencias de mockups](#referencias-de-mockups)

## Descripcion general

Este frontend esta construido con **Next.js 16** (App Router) y **Tailwind CSS v4**. El modulo inicial desarrollado es autenticacion:

- Inicio de sesion
- Registro de usuario
- Recuperacion de contrasena
- Actualizacion de contrasena por enlace de recuperacion

El sistema usa **Supabase Auth** para manejar cuentas y sesiones, y una tabla `public.usuarios` para almacenar el registro de usuarios y su rol.

## Stack tecnico

| Tecnologia | Version | Uso |
|---|---|---|
| Next.js | 16.x | Framework principal |
| React | 19.x | Capa de UI |
| Tailwind CSS | 4.x | Sistema de estilos |
| Supabase | SDK v2 | Auth + acceso a Postgres |
| TypeScript | 5.x | Tipado estatico |
| PostgreSQL | Supabase | Base de datos |

## Arquitectura del proyecto

```txt
Software-Vecino-Frontend/
|
|- mockups/                         # Referencias visuales del proyecto
|- src/
|  |- app/
|  |  |- (auth)/
|  |  |  |- iniciar-sesion/page.tsx
|  |  |  |- registro/page.tsx
|  |  |  |- recuperar-contrasena/page.tsx
|  |  |  |- actualizar-contrasena/page.tsx
|  |  |- (app)/
|  |  |  |- perfil/page.tsx
|  |  |  |- vendedor/page.tsx
|  |  |  |- panel/page.tsx             # Redireccion por rol
|  |  |- auth/confirm/route.ts      # Confirmacion y recuperacion de email
|  |  |- layout.tsx
|  |  |- page.tsx
|  |  |- globals.css
|  |- components/auth/              # Componentes reutilizables de auth
|  |- lib/supabase/                 # Clientes browser/server/proxy
|  |- proxy.ts                      # Proxy global (antes middleware)
|- .env.test.example
|- e2e/                            # Pruebas E2E con Playwright
|- playwright.config.ts
|- README-frontend.md
```

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

## Ejecucion

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Produccion local
npm run start
```

## Pruebas E2E (Playwright)

Tests de punta a punta con **Playwright** y **Supabase real**. Playwright arranca el servidor de desarrollo automaticamente; no hace falta correr `npm run dev` en otra terminal.

### Configuracion inicial (una sola vez)

```bash
# 1. Copiar plantilla y completar credenciales de Supabase
cp .env.test.example .env.test
# Editar .env.test: URL, publishable key y service_role (Dashboard > API)

# 2. Instalar navegador y crear usuarios de prueba en Supabase
npm run test:e2e:setup
```

### Ejecucion manual

```bash
# Correr los 3 tests (headless)
npm run test:e2e

# Modo interactivo (depurar paso a paso)
npm run test:e2e:ui

# Ver reporte HTML del ultimo run
npm run test:e2e:report
```

### Usuarios de prueba

Creados por `npm run db:setup:test` (tambien se ejecuta automaticamente antes de cada run):

| Email | Rol | Test |
|---|---|---|
| `e2e-test@example.com` | consumidor | E2E-01 |
| `e2e-consumidor@example.com` | consumidor | E2E-03 |
| `e2e-vendedor@example.com` | vendedor | E2E-02 |

Contrasena: valor de `E2E_TEST_PASSWORD` en `.env.test` (por defecto `12345678`).

### Estructura

```txt
e2e/
  auth.spec.ts       # Registro y login
  compra.spec.ts     # Perfil consumidor
  productos.spec.ts  # Panel vendedor
  fixtures.ts        # Credenciales y helper de login
  global-setup.mjs   # Seed de usuarios antes de los tests
playwright.config.ts
.env.test            # Variables E2E (no commitear)
.env.test.example    # Plantilla documentada
```

### Notas

- Si ya tienes `npm run dev` corriendo en el puerto 3000, Playwright lo reutiliza.
- Para re-crear usuarios manualmente: `npm run db:setup:test`
- Reportes y capturas de fallos van a `playwright-report/` y `test-results/` (ignorados por git).

## Autenticacion con Supabase

Flujos implementados:

1. **Registro** (`/registro`)
   - Crea usuario en Supabase Auth.
   - Guarda metadatos `nombre_completo` y `rol`.
   - Soporta confirmacion por correo si esta habilitada.

2. **Login** (`/iniciar-sesion`)
   - Inicio de sesion por email/contrasena.
   - Redireccion automatica por rol (`/perfil` o `/vendedor`).

3. **Recuperacion de contrasena** (`/recuperar-contrasena`)
   - Envia correo de recuperacion.
   - Redirige a `/auth/confirm` y luego a `/actualizar-contrasena`.

4. **Actualizacion de contrasena** (`/actualizar-contrasena`)
   - Permite definir nueva contrasena tras validar token de recovery.

5. **Rutas protegidas** (`/perfil` y `/vendedor`)
   - Exigen sesion activa.
   - Aplican control de acceso por rol.
   - Incluyen cierre de sesion.

## Interfaces y flujos implementados

### Interfaces implementadas

- `/registro`: alta de cuenta con seleccion de rol (`usuario` o `vendedor`).
- `/iniciar-sesion`: autenticacion por correo y contrasena.
- `/recuperar-contrasena`: envio de enlace de recuperacion.
- `/actualizar-contrasena`: actualizacion de contrasena con token valido.
- `/panel`: redireccion automatica por rol despues de autenticar.
- `/perfil`: vista protegida para rol `usuario`.
- `/vendedor`: vista protegida para rol `vendedor`.

### Flujo principal del usuario

1. El usuario se registra o inicia sesion.
2. El sistema autentica con Supabase Auth.
3. Se identifica el rol del usuario.
4. El sistema redirige a `/perfil` o `/vendedor`.
5. El usuario puede cerrar sesion desde su panel.

### Contrato de API consumido

Cuando el backend local esta disponible, la documentacion OpenAPI/Swagger se consulta en:

- `http://localhost:4000/api-docs`
- `http://localhost:4000/api-docs.json`

## Base de datos

La definicion de esquema SQL y scripts de aprovisionamiento de base de datos se mantiene en el repositorio de backend para conservar separacion clara entre frontend y backend.

## Guia de diseno visual

Esta seccion define el sistema visual base para mantener consistencia en toda la plataforma.

### 1) Direccion visual

- Estilo: calido, cercano, comunitario.
- Look and feel: superficies suaves, fondos crema y acento naranja tierra.
- Interfaz: tarjetas redondeadas, formularios claros, CTA prominente con gradiente.

### 2) Paleta de color (tokens)

Definidos en `src/app/globals.css`:

- `--vecino-bg`: `#f6f2ee` (fondo base)
- `--vecino-bg-accent`: `#eaf3ea` (acento suave de fondo)
- `--vecino-surface`: `#f4f4f4` (tarjetas)
- `--vecino-surface-soft`: `#f0ede9` (inputs y bloques secundarios)
- `--vecino-text`: `#2f2f2f` (texto principal)
- `--vecino-text-muted`: `#6f6b67` (texto secundario)
- `--vecino-brand`: `#af4a10` (marca)
- `--vecino-brand-strong`: `#9c3f0c` (inicio de gradiente CTA)
- `--vecino-brand-soft`: `#e29a70` (fin de gradiente CTA)
- `--vecino-border`: `#ddd8d3` (bordes)
- `--vecino-success`: `#b8e8c6` (estado positivo)
- `--vecino-error`: `#ba2d2d` (estado de error)

### 3) Tipografia

- Display / titulos: `Sora`
- Texto UI / formularios: `Nunito Sans`

Reglas:

- Titulo principal (auth): 48px aprox en desktop, 32px en mobile.
- Subtitulo: 18px con color muted.
- Labels de formulario: 16px semibold.
- Inputs y botones: 18px.

### 4) Componentes base

- `AuthSurface`: contenedor principal de formularios (tarjeta central).
- `AuthInput`: input con label, icono y estado de error.
- `AuthPrimaryButton`: CTA principal con gradiente y estado loading.

### 5) Interaccion y estados

- Focus visible en inputs (borde brand).
- Hover de botones con `brightness` suave.
- Estados de error con color `vecino-error`.
- Disabled con opacidad reducida y cursor bloqueado.

### 6) Responsive

- Mobile first.
- Formularios centrados y legibles en ancho reducido.
- Grids de registro colapsan de 2 columnas a 1 columna en pantallas pequenas.

## Referencias de mockups

- `mockups/login.png`
- `mockups/registro.png`
- `mockups/recuperacion-contraseña.png`

Estas referencias se usan como base para color, estructura y tono visual del modulo de autenticacion.
