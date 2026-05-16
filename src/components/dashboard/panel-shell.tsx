import {
  Bell,
  ClipboardList,
  Grid2X2,
  LifeBuoy,
  MapPin,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { RolUsuario } from "@/lib/auth/usuario";

type PanelShellProps = {
  rol: RolUsuario;
  titulo: string;
  vistaActiva: "perfil" | "catalogo" | "vendedor" | "negocios" | "productos";
  children: ReactNode;
};

type ItemMenu = {
  label: string;
  href: string;
  icon: ReactNode;
  activo: boolean;
};

function Item({ item }: { item: ItemMenu }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-base transition ${
        item.activo
          ? "bg-vecino-surface-soft font-semibold text-vecino-brand ring-1 ring-vecino-border"
          : "text-vecino-text-muted hover:bg-vecino-surface-soft"
      }`}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export function PanelShell({ rol, titulo, vistaActiva, children }: PanelShellProps) {
  const isVendedor = rol === "vendedor";

  const items: ItemMenu[] = isVendedor
    ? [
        {
          label: "Dashboard",
          href: "/vendedor",
          icon: <Grid2X2 size={20} />,
          activo: vistaActiva === "vendedor",
        },
        {
          label: "Negocios",
          href: "/vendedor/negocio/mis-negocios",
          icon: <ClipboardList size={20} />,
          activo: vistaActiva === "negocios",
        },
        {
          label: "Productos",
          href: "/vendedor/productos/mis-productos",
          icon: <MapPin size={20} />,
          activo: vistaActiva === "productos",
        },
      ]
    : [
        {
          label: "Mi Perfil",
          href: "/perfil",
          icon: <UserRound size={20} />,
          activo: vistaActiva === "perfil",
        },
        {
          label: "Catalogo",
          href: "/catalogo",
          icon: <Bell size={20} />,
          activo: vistaActiva === "catalogo",
        },
      ];

  return (
    <main className="min-h-screen bg-vecino-bg">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[254px_1fr]">
        <aside className="border-b border-vecino-border bg-[#f8f5f2] p-5 lg:border-b-0 lg:border-r">
          <Link href={isVendedor ? "/vendedor" : "/perfil"} className="block">
            <h1 className="font-display text-[2.15rem] font-semibold leading-none text-vecino-brand">{isVendedor ? "Vecino Merchant" : "Vecino"}</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-vecino-text-muted">
              {isVendedor ? "Business Panel" : "User Panel"}
            </p>
          </Link>

          <nav className="mt-8 space-y-2">
            {items.map((item) => (
              <Item key={item.label} item={item} />
            ))}
          </nav>

          <div className="mt-10 space-y-2 border-t border-vecino-border pt-6">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-base text-vecino-text-muted transition hover:bg-vecino-surface-soft"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-base text-vecino-text-muted transition hover:bg-vecino-surface-soft"
            >
              <LifeBuoy size={20} />
              <span>Support</span>
            </Link>
            <Link
              href="/auth/cerrar-sesion"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-vecino-border bg-vecino-surface-soft px-4 py-2.5 text-base font-semibold text-vecino-brand"
            >
              Cerrar sesion
            </Link>
          </div>
        </aside>

        <section>
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-vecino-border bg-[#f8f5f2] px-6 py-4 sm:px-8">
            <h2 className="font-display text-[1.9rem] font-semibold leading-none text-vecino-brand sm:text-[2.05rem]">{titulo}</h2>
            <div className="flex items-center gap-6 text-base">
              <Link href={isVendedor ? "/vendedor" : "/perfil"} className="text-vecino-text-muted">
                Profile
              </Link>
              <span className="border-b-2 border-vecino-brand pb-1 font-semibold text-vecino-brand">Notifications</span>
            </div>
          </header>

          <div className="p-5 sm:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
