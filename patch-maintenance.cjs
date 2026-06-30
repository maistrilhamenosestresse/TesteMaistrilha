const fs = require('fs');

const maintenanceUI = `
  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-[#0F1722] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#F17B37] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#25D366] rounded-full blur-[150px] opacity-10 pointer-events-none" />
        <h1 className="text-4xl md:text-6xl font-black text-[#F17B37] mb-6">Em Manutenção 🚧</h1>
        <p className="text-gray-300 max-w-lg mb-8 text-lg md:text-xl">
          Nossa equipe está atualizando a agenda com novas aventuras incríveis! 
          Por favor, volte em alguns instantes.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
            <a href="/" className="bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-4 rounded-2xl font-bold transition">
              Voltar ao Início
            </a>
            <a href="/carrinho" className="bg-[#F17B37] hover:bg-orange-600 px-8 py-4 rounded-2xl font-bold transition shadow-[0_0_20px_rgba(241,123,55,0.4)]">
              Ver meu Carrinho
            </a>
        </div>
      </div>
    );
  }
`;

function patchAgendaList() {
  let content = fs.readFileSync('src/app/agenda/page.tsx', 'utf8');
  
  // Add state
  content = content.replace(/const \[agendas, setAgendas\] = useState<any\[\]>\(\[\]\);/, 'const [agendas, setAgendas] = useState<any[]>([]);\n  const [isMaintenance, setIsMaintenance] = useState(false);');

  // Add settings fetch inside fetchAgendas
  const fetchSettings = `
      const { data: resSettings } = await supabase.from('settings').select('*').single();
      if (resSettings && resSettings.maintenance_mode) {
        setIsMaintenance(true);
        setIsLoading(false);
        return;
      }
      
      const { data, error }
  `;
  content = content.replace(/const \{ data, error \}/, fetchSettings.trim());

  // Add UI logic
  content = content.replace(/return \(\s*<div className="min-h-screen/, maintenanceUI.trim() + '\n\n  return (\n    <div className="min-h-screen');

  fs.writeFileSync('src/app/agenda/page.tsx', content);
  console.log('Patched agenda/page.tsx');
}

function patchAgendaDetails() {
  let content = fs.readFileSync('src/app/agenda/[id]/page.tsx', 'utf8');
  
  // Add state
  content = content.replace(/const \[agenda, setAgenda\] = useState<any>\(null\);/, 'const [agenda, setAgenda] = useState<any>(null);\n  const [isMaintenance, setIsMaintenance] = useState(false);');

  // Add settings fetch inside fetchAgenda
  const fetchSettings = `
        const { data: resSettings } = await supabase.from('settings').select('*').single();
        if (resSettings && resSettings.maintenance_mode) {
          setIsMaintenance(true);
          setIsLoading(false);
          return;
        }

        const { data, error }
  `;
  content = content.replace(/const \{ data, error \}/, fetchSettings.trim());

  // Add UI logic
  content = content.replace(/if \(isLoading\) return/, maintenanceUI.trim() + '\n\n  if (isLoading) return');

  fs.writeFileSync('src/app/agenda/[id]/page.tsx', content);
  console.log('Patched agenda/[id]/page.tsx');
}

patchAgendaList();
patchAgendaDetails();
