import { Logo } from "@/components/layout/logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-black bg-grid bg-radial-flame px-4 py-16">
      <Logo className="absolute left-6 top-6" />
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-card-bg p-8 shadow-2xl shadow-black/50">
        <h1 className="font-heading text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 border-t border-border-subtle pt-5 text-center text-sm text-muted">{footer}</div>
      </div>
    </div>
  );
}
