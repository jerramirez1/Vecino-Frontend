import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export type RolUsuario = "usuario" | "vendedor";

export interface UsuarioSesion {
  id: string;
  nombre_completo: string;
  email: string | null;
  rol: RolUsuario;
}

type MetadatosUsuario = {
  nombre_completo?: string;
  rol?: string;
  tipo_cuenta?: string;
};

export function esBypassAuth() {
  return process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
}

export function normalizarRol(rol?: string | null): RolUsuario {
  if (rol === "vendedor") {
    return "vendedor";
  }

  return "usuario";
}

export function resolverRolDesdeMetadata(metadata?: MetadatosUsuario | null): RolUsuario {
  const crudo = (metadata?.rol ?? metadata?.tipo_cuenta ?? "usuario").toLowerCase();

  if (crudo === "vendedor") {
    return "vendedor";
  }

  if (crudo === "comprador") {
    return "usuario";
  }

  return normalizarRol(crudo);
}

export function obtenerUsuarioMock(rol: RolUsuario): UsuarioSesion {
  const nombre = rol === "vendedor" ? "Comerciante Demo" : "Vecino Demo";

  return {
    id: `mock-${rol}`,
    nombre_completo: nombre,
    email: `demo-${rol}@vecino.local`,
    rol,
  };
}

export async function obtenerUsuarioParaRuta(
  supabase: SupabaseClient,
  rolEsperado: RolUsuario,
): Promise<UsuarioSesion> {
  if (esBypassAuth()) {
    return obtenerUsuarioMock(rolEsperado);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/iniciar-sesion");
  }

  const usuario = await obtenerUsuarioActual(supabase, user.id, user.user_metadata);

  if (usuario.rol !== rolEsperado) {
    redirect(rolEsperado === "vendedor" ? "/perfil" : "/vendedor");
  }

  return usuario;
}

export async function obtenerUsuarioActual(
  supabase: SupabaseClient,
  userId: string,
  metadata?: MetadatosUsuario | null,
): Promise<UsuarioSesion> {
  const { data } = await supabase
    .from("usuarios")
    .select("id, nombre_completo, email, rol")
    .eq("id", userId)
    .maybeSingle();

  const nombreFallback = metadata?.nombre_completo ?? "Vecino";

  if (!data) {
    return {
      id: userId,
      nombre_completo: nombreFallback,
      email: null,
      rol: resolverRolDesdeMetadata(metadata),
    };
  }

  return {
    id: data.id as string,
    nombre_completo: (data.nombre_completo as string) ?? nombreFallback,
    email: (data.email as string | null) ?? null,
    rol: normalizarRol(data.rol as string),
  };
}
