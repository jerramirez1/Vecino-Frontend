"use client";

import { CircleUserRound, Lock, Mail, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RolRegistro = "usuario" | "vendedor";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [rol, setRol] = useState<RolRegistro>("usuario");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegistro = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setExito("");
    setLoading(true);
    
    // Registro de usuario en Supabase Auth con metadatos personalizados
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirección tras confirmar el correo
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/panel`,
        data: {
          nombre_completo: nombre,
          rol,
          // Tipo de cuenta simplificado para lógica de negocio
          tipo_cuenta: rol === "vendedor" ? "vendedor" : "comprador",
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.status === 429) {
        setError("Demasiados intentos en poco tiempo. Espera un momento y vuelve a intentarlo.");
      } else {
        setError(signUpError.message || "No fue posible crear la cuenta. Intenta nuevamente.");
      }
      return;
    }

    if (data.user && !data.session) {
      setExito("Cuenta creada. Revisa tu correo para confirmar y activar tu acceso.");
      return;
    }

    router.replace("/panel");
    router.refresh();
  };

  return (
    <section className="w-full max-w-[840px] space-y-8">
      <header className="space-y-2 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-vecino-brand">Paso 1 de 2</p>
        <h1 className="text-5xl font-semibold text-vecino-text">Unete a la plaza digital</h1>
        <p className="text-lg text-vecino-text-muted">Selecciona como participar en Vecino. Puedes cambiarlo mas adelante.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRol("usuario")}
          className={`vecino-card group flex min-h-[250px] cursor-pointer flex-col items-center justify-center p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-vecino-brand-soft hover:ring-2 hover:ring-vecino-brand-soft/60 hover:shadow-[0_14px_28px_rgba(53,40,31,0.12)] ${
            rol === "usuario"
              ? "border-vecino-brand bg-[#fff7f2] shadow-[0_16px_30px_rgba(175,74,16,0.2)] ring-2 ring-vecino-brand"
              : "hover:border-vecino-brand-soft"
          }`}
        >
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-vecino-success text-vecino-text transition group-hover:scale-105">
            <CircleUserRound size={22} />
          </span>
          <h2 className="text-[2rem] font-semibold leading-tight">Quiero comprar</h2>
          <p className="mt-3 max-w-[320px] text-xl leading-8 text-vecino-text-muted">
            Explora tesoros locales, apoya a tus vecinos y descubre lo mejor de tu comunidad.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRol("vendedor")}
          className={`vecino-card group flex min-h-[250px] cursor-pointer flex-col items-center justify-center p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-vecino-brand-soft hover:ring-2 hover:ring-vecino-brand-soft/60 hover:shadow-[0_14px_28px_rgba(53,40,31,0.12)] ${
            rol === "vendedor"
              ? "border-vecino-brand bg-[#fff7f2] shadow-[0_16px_30px_rgba(175,74,16,0.2)] ring-2 ring-vecino-brand"
              : "hover:border-vecino-brand-soft"
          }`}
        >
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-vecino-text transition group-hover:scale-105">
            <Store size={22} />
          </span>
          <h2 className="text-[2rem] font-semibold leading-tight">Quiero vender</h2>
          <p className="mt-3 max-w-[320px] text-xl leading-8 text-vecino-text-muted">
            Abre tu escaparate digital, comparte tus productos y haz crecer tu negocio local.
          </p>
        </button>
      </div>

      <section className="vecino-card p-6 sm:p-8">
        <h2 className="mb-4 text-2xl font-semibold text-vecino-brand">Informacion basica</h2>
        <form className="space-y-5" onSubmit={handleRegistro}>
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthInput
              label="Nombre completo"
              type="text"
              placeholder="Ej. Ana Garcia"
              icon={<CircleUserRound size={20} />}
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
            />
            <AuthInput
              label="Correo electronico"
              type="email"
              placeholder="ana@vecino.com"
              icon={<Mail size={20} />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <p className="rounded-xl bg-vecino-surface-soft px-4 py-3 text-sm font-semibold text-vecino-text-muted">
            Rol seleccionado: <span className="capitalize text-vecino-brand">{rol}</span>
          </p>

          <AuthInput
            label="Contrasena"
            type="password"
            placeholder="Minimo 8 caracteres"
            icon={<Lock size={20} />}
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className="text-sm font-semibold text-vecino-error">{error}</p> : null}
          {exito ? <p className="text-sm font-semibold text-emerald-700">{exito}</p> : null}

          <AuthPrimaryButton type="submit" loading={loading}>
            Continuar registro
          </AuthPrimaryButton>

          <p className="text-center text-xs text-vecino-text-muted">
            Al continuar aceptas nuestros terminos de servicio y politica de privacidad.
          </p>
        </form>
      </section>

      <p className="text-center text-base text-vecino-text-muted">
        Ya tienes cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-bold text-vecino-brand">
          Inicia sesion
        </Link>
      </p>
    </section>
  );
}
