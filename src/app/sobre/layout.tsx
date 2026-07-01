import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós - Mais Trilha Menos Estresse',
  description: 'Conheça como tudo começou. A nossa essência, a nossa comunidade e o nosso amor por conectar pessoas através de trilhas e ecoturismo.',
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
