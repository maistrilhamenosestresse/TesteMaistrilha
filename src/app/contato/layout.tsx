import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fale Conosco - Mais Trilha Menos Estresse',
  description: 'Tem dúvidas ou quer falar com a gente? Entre em contato pelo WhatsApp, siga-nos no Instagram e venha fazer parte da nossa comunidade.',
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
