import { Clock3, MapPin, Store, PlusCircle } from "lucide-react";
import Link from "next/link";
import { PanelShell } from "@/components/dashboard/panel-shell";
import { obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function Horario({ dia, abierto = true }: { dia: string; abierto?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${abierto ? "bg-vecino-surface-soft" : "bg-zinc-200"}`}>
      <div className="flex items-center gap-3">
        <span className={`inline-block h-6 w-11 rounded-full ${abierto ? "bg-emerald-700" : "bg-zinc-300"}`} />
        <span className={`text-[1.95rem] font-semibold leading-tight ${abierto ? "text-vecino-text" : "text-vecino-text-muted"}`}>{dia}</span>
      </div>
      <span className="text-sm font-semibold text-vecino-text-muted">{abierto ? "07:00 AM - 08:00 PM" : "CERRADO"}</span>
    </div>
  );
}

export default async function VendedorPage() {
  const supabase = await createSupabaseServerClient();
  const usuario = await obtenerUsuarioParaRuta(supabase, "vendedor");

  return (
    <PanelShell rol="vendedor" titulo="Perfil del Negocio" vistaActiva="vendedor">
      <div className="flex justify-end mb-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/vendedor/negocio/crear" className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
            <PlusCircle size={20} />
            Crear negocio
          </Link>
          <Link href="/vendedor/productos/publicar" className="flex items-center gap-2 rounded-xl border border-vecino-border bg-white px-5 py-3 font-semibold text-vecino-brand transition hover:bg-vecino-surface-soft">
            <PlusCircle size={20} />
            Publicar producto
          </Link>
        </div>
      </div>
     
      <div className="grid gap-6 2xl:grid-cols-[1.4fr_0.8fr]">
        <section className="vecino-card p-6 sm:p-8">
          <p className="text-base text-vecino-text-muted">Configuracion Activa</p>
          <h3 className="text-[2.05rem] font-semibold leading-tight sm:text-[2.25rem]">{usuario.nombre_completo}</h3>

          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border-2 border-dashed border-vecino-border p-4">
              <div className="h-[220px] rounded-xl bg-[linear-gradient(130deg,#747ea2,#617198)]" />
              <button className="vecino-card mx-auto -mt-14 block px-6 py-4 text-[1.05rem] font-semibold text-vecino-text">Cambiar foto de portada</button>
            </div>
            <div className="vecino-card flex flex-col items-center justify-center gap-4 p-5">
              <div className="flex h-30 w-30 items-center justify-center rounded-full bg-orange-500 text-white">
                <Store size={40} />
              </div>
              <button className="rounded-full bg-vecino-surface-soft px-5 py-2 text-sm font-semibold text-vecino-brand">Subir logo</button>
            </div>
          </div>
        </section>

        <section className="vecino-card p-6 sm:p-8">
          <h3 className="mb-5 flex items-center gap-3 text-[1.8rem] font-semibold leading-tight text-vecino-brand sm:text-[2rem]">
            <Clock3 size={24} />
            Horarios de atencion
          </h3>
          <div className="space-y-3">
            <Horario dia="Lunes" />
            <Horario dia="Martes" />
            <Horario dia="Miercoles" />
            <Horario dia="Jueves" abierto={false} />
            <Horario dia="Viernes" />
            <Horario dia="Sabado" />
            <Horario dia="Domingo" />
          </div>
        </section>

        <section className="vecino-card p-6 sm:p-8">
          <h3 className="mb-5 text-[1.85rem] font-semibold leading-tight text-vecino-brand sm:text-[2rem]">Informacion Basica</h3>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-base font-semibold text-vecino-text-muted">Nombre del negocio</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.85rem] leading-tight">{usuario.nombre_completo}</div>
            </div>
            <div>
              <p className="mb-2 text-base font-semibold text-vecino-text-muted">Categoria</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.85rem] leading-tight">Comercio local</div>
            </div>
            <div>
              <p className="mb-2 text-base font-semibold text-vecino-text-muted">Descripcion</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-4 text-[1.1rem] leading-7">
                Negocio verificado en Vecino. Administra catalogo, pedidos y reputacion desde este panel.
              </div>
            </div>
          </div>
        </section>

        <section className="vecino-card p-6 sm:p-8">
          <h3 className="mb-5 flex items-center gap-3 text-[1.85rem] font-semibold leading-tight text-vecino-brand sm:text-[2rem]">
            <MapPin size={24} />
            Localizacion
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-base font-semibold text-vecino-text-muted">Direccion</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem]">Calle 2 # 4 - 55</div>
            </div>
            <div>
              <p className="mb-2 text-base font-semibold text-vecino-text-muted">Barrio</p>
              <div className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-[1.1rem]">San Antonio</div>
            </div>
          </div>
          <div className="mt-5 h-[220px] rounded-2xl border border-vecino-border bg-[linear-gradient(140deg,#6aa7b0,#7bc3cc)]" />
        </section>
      </div>
    </PanelShell>
  );
}
