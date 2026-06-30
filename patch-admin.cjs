const fs = require('fs');

let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// 1. Add state
const stateReplacement = `
  const [agendas, setAgendas] = useState<any[]>([]);
  const [globalViews, setGlobalViews] = useState<number>(0);
  const [clients, setClients] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
`;
content = content.replace(/const \[agendas, setAgendas\] = useState<any\[\]>\(\[\]\);\s*const \[globalViews, setGlobalViews\] = useState<number>\(0\);\s*const \[clients, setClients\] = useState<any\[\]>\(\[\]\);\s*const \[isFetching, setIsFetching\] = useState\(true\);/, stateReplacement.trim());

// 2. Fetch settings in fetchAgendasAndCleanup
const fetchSettingsInjection = `
        const { data: resSettings } = await supabase.from('settings').select('*').single();
        if (resSettings) setIsMaintenance(resSettings.maintenance_mode);
        
        setAgendas(resAgendas || []);
`;
content = content.replace(/setAgendas\(resAgendas \|\| \[\]\);/, fetchSettingsInjection.trim());

// 3. Add toggle function above `const handleLogout`
const toggleMaintenanceFunction = `
  const handleToggleMaintenance = async () => {
    setIsTogglingMaintenance(true);
    try {
      const { error } = await supabase.from('settings').update({ maintenance_mode: !isMaintenance }).eq('id', 1);
      if (error) throw error;
      setIsMaintenance(!isMaintenance);
    } catch (err: any) {
      alert("Erro ao alterar modo de manutenção: " + err.message + "\\nLembre-se de rodar o script SQL no Supabase!");
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleLogout = async () => {
`;
content = content.replace(/const handleLogout = async \(\) => \{/, toggleMaintenanceFunction.trim());

// 4. Update the "Enviar Calendário" Banner area to include the Maintenance Button
const bannerReplacement = `
                {/* Banner de Enviar Calendário e Modo Manutenção */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#1D2A3A] to-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366] rounded-full blur-[60px] opacity-20" />
                    <h3 className="font-bold text-lg mb-1">Enviar Calendário</h3>
                    <p className="text-sm text-gray-300 mb-5 max-w-[80%]">Compartilhe as próximas aventuras.</p>
                    <a href={whatsappLink} target="_blank" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition">
                      <Send className="h-4 w-4" /> Enviar no Grupo
                    </a>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-20" />
                    <h3 className="font-bold text-lg mb-1">Controle do Site</h3>
                    <p className="text-sm text-white/80 mb-5 max-w-[80%]">{isMaintenance ? 'O site está pausado. Ninguém pode comprar.' : 'Pause o site para edição.'}</p>
                    <button 
                      onClick={handleToggleMaintenance} 
                      disabled={isTogglingMaintenance}
                      className={\`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition \${isMaintenance ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}\`}
                    >
                      {isTogglingMaintenance ? <Loader2 className="h-4 w-4 animate-spin" /> : (isMaintenance ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />)}
                      {isMaintenance ? 'Colocar Site Online' : 'Pausar Site'}
                    </button>
                  </div>
                </div>
`;
content = content.replace(/\{\/\* Banner de Enviar Calendário \*\/\}[\s\S]*?<\/div>\s*\{\/\* Lista de Trilhas \*\/\}/, bannerReplacement.trim() + '\n\n                {/* Lista de Trilhas */}');

fs.writeFileSync('src/app/admin/page.tsx', content);
console.log('Admin Page Patched.');
