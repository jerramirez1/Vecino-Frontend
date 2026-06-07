import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env.test") });
dotenv.config({ path: path.join(rootDir, ".env.local"), override: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !anonKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.test");
  process.exit(1);
}

const password = process.env.E2E_TEST_PASSWORD ?? "12345678";

const usuariosPrueba = [
  {
    email: "e2e-test@example.com",
    nombre_completo: "Test Consumidor",
    rol: "usuario",
    metadata: { nombre_completo: "Test Consumidor", rol: "usuario", tipo_cuenta: "comprador" },
  },
  {
    email: "e2e-consumidor@example.com",
    nombre_completo: "Consumidor Demo",
    rol: "usuario",
    metadata: { nombre_completo: "Consumidor Demo", rol: "usuario", tipo_cuenta: "comprador" },
  },
  {
    email: "e2e-vendedor@example.com",
    nombre_completo: "Vendedor Demo",
    rol: "vendedor",
    metadata: { nombre_completo: "Vendedor Demo", rol: "vendedor", tipo_cuenta: "vendedor" },
  },
];

function crearAdmin() {
  if (!serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function crearClienteAnon() {
  return createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function buscarUsuarioPorEmail(admin, email) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email === email) ?? null;
}

async function sincronizarPerfil(admin, authUser, { nombre_completo, email, rol }) {
  const { error } = await admin.from("usuarios").upsert(
    {
      id: authUser.id,
      nombre_completo,
      email,
      rol,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.warn(`Aviso: no se pudo sincronizar public.usuarios para ${email}: ${error.message}`);
  } else {
    console.log(`Sincronizado en public.usuarios: ${email} (${rol})`);
  }
}

async function sincronizarPerfilSql(client, userId, { nombre_completo, email, rol }) {
  await client.query(
    `INSERT INTO public.usuarios (id, nombre_completo, email, rol)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
     SET nombre_completo = EXCLUDED.nombre_completo,
         email = EXCLUDED.email,
         rol = EXCLUDED.rol`,
    [userId, nombre_completo, email, rol],
  );
  console.log(`Sincronizado en public.usuarios: ${email} (${rol})`);
}

async function asegurarUsuarioConAdmin(admin, usuario) {
  const { email, nombre_completo, rol, metadata } = usuario;
  let authUser = await buscarUsuarioPorEmail(admin, email);

  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      throw new Error(`No se pudo crear ${email}: ${error.message}`);
    }

    authUser = data.user;
    console.log(`Creado en Auth: ${email}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      throw new Error(`No se pudo actualizar ${email}: ${error.message}`);
    }

    console.log(`Actualizado en Auth: ${email}`);
  }

  await sincronizarPerfil(admin, authUser, { nombre_completo, email, rol });
}

async function asegurarUsuarioConSql(client, usuario) {
  const { email, nombre_completo, rol, metadata } = usuario;

  const existente = await client.query("SELECT id FROM auth.users WHERE email = $1 LIMIT 1", [email]);
  const metadataJson = JSON.stringify(metadata);

  let userId;

  if (existente.rowCount > 0) {
    userId = existente.rows[0].id;
    await client.query(
      `UPDATE auth.users
       SET encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
           raw_user_meta_data = $3::jsonb,
           updated_at = NOW()
       WHERE id = $1`,
      [userId, password, metadataJson],
    );
    console.log(`Actualizado en Auth (SQL): ${email}`);
  } else {
    const insertado = await client.query(
      `WITH nuevo AS (
         INSERT INTO auth.users (
           instance_id, id, aud, role, email, encrypted_password,
           email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
           created_at, updated_at
         ) VALUES (
           '00000000-0000-0000-0000-000000000000',
           gen_random_uuid(),
           'authenticated',
           'authenticated',
           $1,
           crypt($2, gen_salt('bf')),
           NOW(),
           '{"provider":"email","providers":["email"]}',
           $3::jsonb,
           NOW(),
           NOW()
         )
         RETURNING id, email
       )
       INSERT INTO auth.identities (
         id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
       )
       SELECT
         gen_random_uuid(),
         nuevo.id,
         jsonb_build_object('sub', nuevo.id::text, 'email', nuevo.email),
         'email',
         NOW(),
         NOW(),
         NOW()
       FROM nuevo
       RETURNING user_id`,
      [email, password, metadataJson],
    );

    userId = insertado.rows[0].user_id;
    console.log(`Creado en Auth (SQL): ${email}`);
  }

  try {
    await sincronizarPerfilSql(client, userId, { nombre_completo, email, rol });
  } catch (error) {
    console.warn(`Aviso: no se pudo sincronizar public.usuarios para ${email}: ${error.message}`);
  }
}

async function asegurarUsuarioConSignUp(usuario) {
  const { email, metadata } = usuario;
  const cliente = crearClienteAnon();

  const { data: loginData, error: loginError } = await cliente.auth.signInWithPassword({
    email,
    password,
  });

  if (!loginError && loginData.session) {
    console.log(`Ya existe y puede iniciar sesion: ${email}`);
    return;
  }

  const { data, error } = await cliente.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      console.log(`Ya registrado (confirmar correo o usar service role): ${email}`);
      return;
    }

    throw new Error(`No se pudo registrar ${email}: ${error.message}`);
  }

  if (data.session) {
    console.log(`Registrado con sesion inmediata: ${email}`);
    return;
  }

  console.warn(
    `Registrado ${email} pero requiere confirmacion de correo. ` +
      "Agrega SUPABASE_SERVICE_ROLE_KEY o DATABASE_URL y vuelve a ejecutar db:setup:test.",
  );
}

async function main() {
  console.log(`Conectando a Supabase: ${supabaseUrl}`);

  const admin = crearAdmin();

  if (admin) {
    for (const usuario of usuariosPrueba) {
      await asegurarUsuarioConAdmin(admin, usuario);
    }
    console.log("Usuarios de prueba listos (Admin API).");
    return;
  }

  if (databaseUrl) {
    console.log("Usando DATABASE_URL para crear usuarios confirmados.");
    const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
      for (const usuario of usuariosPrueba) {
        await asegurarUsuarioConSql(client, usuario);
      }
      console.log("Usuarios de prueba listos (SQL).");
    } finally {
      await client.end();
    }
    return;
  }

  console.warn("Sin SUPABASE_SERVICE_ROLE_KEY ni DATABASE_URL: usando signUp (limitado por rate limit / confirmacion).");
  for (const usuario of usuariosPrueba) {
    await asegurarUsuarioConSignUp(usuario);
  }

  console.log("Proceso de usuarios de prueba finalizado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
