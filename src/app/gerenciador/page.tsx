import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import WebIDEClient from "./WebIDEClient";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import ClientLoginButton from "./ClientLoginButton";

export default async function GerenciadorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] h-full">
        <div className="bg-[#252526] p-10 rounded-2xl border border-[#3c3c3c] flex flex-col items-center max-w-md w-full shadow-2xl text-center">
          <div className="bg-[#1D2A3A] p-4 rounded-full mb-6">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Web IDE & CMS</h1>
          <p className="text-gray-400 mb-8 text-sm">
            Para gerenciar os arquivos, modificar o código ou trocar as imagens do site, você precisa entrar com sua conta do GitHub com permissão no repositório.
          </p>
          <ClientLoginButton />
        </div>
      </div>
    );
  }

  // Usuário autenticado, renderiza a interface do IDE
  const accessToken = (session as any).accessToken;
  return <WebIDEClient accessToken={accessToken} />;
}
