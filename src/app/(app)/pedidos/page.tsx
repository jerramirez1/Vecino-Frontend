import { obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { obtenerMisPedidos } from "@/services/pedido.service";
import { obtenerToken } from "@/lib/auth/token";
import { PedidosClient } from "./pedidos-client";

export default async function PedidosPage() {
  const supabase = await createSupabaseServerClient();
  const usuario = await obtenerUsuarioParaRuta(supabase, "usuario");
  const token = await obtenerToken(supabase);

  if (usuario.rol === "vendedor") {
    return null;
  }

  const pedidosResponse = await obtenerMisPedidos(token);
  const pedidos = pedidosResponse.success ? pedidosResponse.data : [];

  return <PedidosClient pedidos={pedidos} />;
}
