import { redirect } from "next/navigation";
import { esBypassAuth, obtenerUsuarioMock, obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  if (esBypassAuth()) {
    const usuario = obtenerUsuarioMock("vendedor");
    redirect(usuario.rol === "vendedor" ? "/vendedor" : "/perfil");
  }

  const usuario = await obtenerUsuarioParaRuta(supabase, "vendedor");
  redirect(usuario.rol === "vendedor" ? "/vendedor" : "/perfil");

  redirect("/iniciar-sesion");
}
