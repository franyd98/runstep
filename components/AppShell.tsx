"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/Logo";

const navItems = [
  { href: "/dashboard", icon: "⚡", label: "Inicio" },
  { href: "/plan",      icon: "📅", label: "Plan" },
  { href: "/historial", icon: "📋", label: "Historial" },
  { href: "/progreso",  icon: "📈", label: "Progreso" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 min-w-64 bg-[#111111] border-r border-[#222] flex-col sticky top-0 h-screen">
        <div className="flex items-center px-4 h-20 border-b border-[#222]">
          <Logo size={24} />
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1 mt-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                path === item.href
                  ? "bg-[#CAFF00] text-black font-bold"
                  : "text-[#666] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#222]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-[#555] hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-[#111111] border-b border-[#222] sticky top-0 z-10">
          <Logo size={20} />
          <button onClick={logout} className="text-[#555] text-sm">🚪</button>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222] z-20">
          <div className="flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${
                  path === item.href ? "text-[#CAFF00]" : "text-[#555]"
                }`}
              >
                <span className={`text-xl transition-transform ${path === item.href ? "scale-110" : ""}`}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
