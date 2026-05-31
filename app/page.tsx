"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_done")
        .eq("user_id", user.id)
        .single();

      if (!profile?.onboarding_done) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    };
    check();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl">🏃</span>
        <p className="text-[#8b90b0]">Cargando RunStep...</p>
      </div>
    </div>
  );
}
