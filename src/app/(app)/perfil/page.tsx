import { MapPin, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { PanelShell } from "@/components/dashboard/panel-shell";
import { obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createSupabaseServerClient();
  const usuario = await obtenerUsuarioParaRuta(supabase, "usuario");

  if (usuario.rol === "vendedor") {
    redirect("/vendedor");
  }

  return (
    <PanelShell rol="usuario" titulo="Perfil de Usuario" vistaActiva="perfil">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="vecino-card p-6 sm:p-8">
          <h3 className="mb-5 flex items-center gap-3 text-[1.6rem] font-semibold leading-none text-vecino-brand sm:text-[1.75rem]">
            <UserRound size={24} />
            Informacion Personal
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[1.05rem] font-semibold text-vecino-text-muted">Nombre completo</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem] leading-tight">{usuario.nombre_completo}</div>
            </div>
            <div>
              <p className="mb-1.5 text-[1.05rem] font-semibold text-vecino-text-muted">Correo electronico</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem] leading-tight">{usuario.email}</div>
            </div>
            <div>
              <p className="mb-1.5 text-[1.05rem] font-semibold text-vecino-text-muted">Rol en plataforma</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem] capitalize leading-tight">{usuario.rol}</div>
            </div>
            <div>
              <p className="mb-1.5 text-[1.05rem] font-semibold text-vecino-text-muted">Estado</p>
              <div className="rounded-xl bg-emerald-100 px-4 py-3 text-[1.1rem] leading-tight text-emerald-800">Activo</div>
            </div>
          </div>
        </section>

        <section className="vecino-card p-6 sm:p-8">
          <h3 className="mb-5 text-[1.6rem] font-semibold leading-none text-vecino-brand sm:text-[1.75rem]">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="rounded-xl bg-vecino-surface-soft px-4 py-3">
              <p className="text-[1.1rem] font-semibold leading-tight">Sesion iniciada correctamente</p>
              <p className="text-sm leading-6 text-vecino-text-muted">Tu cuenta esta protegida con autenticacion de Supabase.</p>
            </div>
            <div className="rounded-xl bg-vecino-surface-soft px-4 py-3">
              <p className="text-[1.1rem] font-semibold leading-tight">Perfil listo para completar</p>
              <p className="text-sm leading-6 text-vecino-text-muted">En siguientes modulos agregaremos direccion y preferencias.</p>
            </div>
          </div>
        </section>

        <section className="vecino-card p-6 sm:p-8 xl:col-span-2">
          <h3 className="mb-5 flex items-center gap-3 text-[1.6rem] font-semibold leading-none text-vecino-brand sm:text-[1.75rem]">
            <MapPin size={24} />
            Ubicacion de referencia
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[1.05rem] font-semibold text-vecino-text-muted">Direccion</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem] leading-tight">Calle 2 # 4 - 55</div>
            </div>
            <div>
              <p className="mb-1.5 text-[1.05rem] font-semibold text-vecino-text-muted">Barrio</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem] leading-tight">San Antonio</div>
            </div>
          </div>
          <div className="mt-5 h-[240px] rounded-2xl border border-vecino-border bg-[linear-gradient(140deg,#6aa7b0,#7bc3cc)]" />
        </section>
      </div>
    </PanelShell>
  );
}
