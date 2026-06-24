import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro de Seguro | Mais Trilha Menos Estresse',
  description: 'Preencha seus dados para o seguro aventura e assine o termo de responsabilidade da Mais Trilha Menos Estresse.',
  openGraph: {
    title: 'Cadastro de Seguro | Mais Trilha Menos Estresse',
    description: 'Preencha seus dados para o seguro aventura e assine o termo de responsabilidade da Mais Trilha Menos Estresse.',
    siteName: 'Mais Trilha Menos Estresse'
  }
};

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
