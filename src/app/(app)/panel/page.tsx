import { redirect } from "next/navigation";
import { obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PanelPage() {
  const supabase = await createSupabaseServerClient();
  const usuario = await obtenerUsuarioParaRuta(supabase, "vendedor");
  redirect(usuario.rol === "vendedor" ? "/vendedor" : "/perfil");
}
