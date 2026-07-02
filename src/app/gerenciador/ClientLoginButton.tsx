"use client";

import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";

export default function ClientLoginButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="w-full bg-[#F17B37] hover:bg-[#e06925] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(241,123,55,0.3)] hover:scale-105"
    >
      <Lock className="h-5 w-5" />
      Entrar com GitHub
    </button>
  );
}
