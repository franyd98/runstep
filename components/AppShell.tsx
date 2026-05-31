"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/plan",      icon: "📅", label: "Mi Plan" },
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 min-w-56 bg-[#141420] border-r border-[#2a2a42] flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#2a2a42]">
          <span className="text-2xl">🏃</span>
          <span className="font-bold text-lg text-white">RunStep</span>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                path === item.href
                  ? "bg-[#FF4D00]/15 text-[#FF4D00] font-semibold"
                  : "text-[#8b90b0] hover:bg-[#1e1e30] hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#2a2a42]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#8b90b0] hover:bg-[#1e1e30] hover:text-white transition-all"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
