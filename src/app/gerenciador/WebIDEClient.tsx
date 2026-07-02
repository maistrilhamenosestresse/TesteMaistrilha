"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Editor from "@monaco-editor/react";
import { Folder, FileCode, Image as ImageIcon, Send, Loader2, ChevronRight, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Arquivos Mockados para demonstração inicial
const mockFiles = [
  { id: "1", name: "src", type: "folder", children: [
    { id: "2", name: "app", type: "folder", children: [
      { id: "3", name: "page.tsx", type: "file", extension: "tsx", content: "export default function Home() {\n  return <div>Bem-vindo ao site Mais Trilha!</div>;\n}" },
      { id: "4", name: "globals.css", type: "file", extension: "css", content: "body {\n  background-color: #0f172a;\n  color: white;\n}" }
    ]}
  ]},
  { id: "5", name: "public", type: "folder", children: [
    { id: "6", name: "logo.png", type: "image", extension: "png", url: "/FotosEvideos/logo/55C232D4-8B60-45C4-82BC-4B25960F8B60%20Copy.JPG" },
    { id: "7", name: "banner-home.jpg", type: "image", extension: "jpg", url: "https://via.placeholder.com/800x400.png?text=Banner+Site" }
  ]},
  { id: "8", name: "package.json", type: "file", extension: "json", content: '{\n  "name": "maistrilha",\n  "version": "1.0.0"\n}' }
];

export default function WebIDEPage() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "1": true, "2": true, "5": true });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Aqui será feita a conversão do arquivo para Base64 e atualização no state
    if (acceptedFiles.length > 0) {
      alert(`Arquivo ${acceptedFiles[0].name} recebido via Drag & Drop!`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true, // Habilita o clique apenas em áreas específicas se necessário
  });

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders[node.id];
      const isSelected = selectedFile?.id === node.id;

      if (node.type === "folder") {
        return (
          <div key={node.id}>
            <div 
              className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] transition-colors ${isSelected ? 'bg-[#37373d]' : ''}`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => toggleFolder(node.id)}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
              <Folder className="h-4 w-4 text-[#dcb67a]" />
              <span className="text-sm">{node.name}</span>
            </div>
            {isExpanded && node.children && renderTree(node.children, level + 1)}
          </div>
        );
      }

      return (
        <div 
          key={node.id}
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] transition-colors ${isSelected ? 'bg-[#37373d]' : ''}`}
          style={{ paddingLeft: `${(level * 12) + 24}px` }}
          onClick={() => setSelectedFile(node)}
        >
          {node.type === 'image' ? <ImageIcon className="h-4 w-4 text-green-400" /> : <FileCode className="h-4 w-4 text-blue-400" />}
          <span className="text-sm">{node.name}</span>
        </div>
      );
    });
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeployStatus('building');
    
    // Mock de processo de deploy na Vercel via GitHub API
    setTimeout(() => {
      setDeployStatus('success');
      setTimeout(() => {
        setIsDeploying(false);
        setDeployStatus('idle');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="flex h-full w-full relative" {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Overlay Drag and Drop Visual */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#1e1e1e]/90 backdrop-blur-sm border-4 border-dashed border-blue-500 flex flex-col items-center justify-center rounded-lg m-4"
          >
            <ImageIcon className="h-20 w-20 text-blue-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white">Solte a imagem aqui para enviar!</h2>
            <p className="text-gray-400 mt-2">Ela será salva automaticamente na pasta public.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR - FILE EXPLORER */}
      <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
        <div className="uppercase text-[10px] font-bold text-gray-400 px-4 py-3 tracking-widest border-b border-[#3c3c3c]">
          Explorador
        </div>
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {renderTree(mockFiles)}
        </div>
      </div>

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Editor Tabs / Status Bar */}
        <div className="h-10 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-[#3c3c3c] shrink-0">
          <div className="flex items-center gap-2">
            {selectedFile && (
              <div className="bg-[#1e1e1e] border-t-2 border-blue-500 text-sm px-4 h-10 flex items-center gap-2">
                {selectedFile.type === 'image' ? <ImageIcon className="h-4 w-4 text-green-400" /> : <FileCode className="h-4 w-4 text-blue-400" />}
                {selectedFile.name}
              </div>
            )}
          </div>

          {/* Vercel Deploy Button */}
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`text-xs font-bold px-4 py-1.5 rounded-md flex items-center gap-2 transition-all shadow-sm ${
              deployStatus === 'building' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
              deployStatus === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
              deployStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
              'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
            }`}
          >
            {deployStatus === 'building' ? <Loader2 className="h-3 w-3 animate-spin" /> : 
             deployStatus === 'success' ? <CheckCircle2 className="h-3 w-3" /> :
             deployStatus === 'error' ? <AlertCircle className="h-3 w-3" /> :
             <Send className="h-3 w-3" />}
            {deployStatus === 'building' ? 'Enviando para Vercel...' : 
             deployStatus === 'success' ? 'Site Atualizado!' :
             deployStatus === 'error' ? 'Erro no Deploy' :
             'Atualizar Site'}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {!selectedFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
              <h2 className="text-xl font-medium">Selecione um arquivo para editar</h2>
              <p className="text-sm mt-2">Dica: Você pode arrastar imagens para esta janela.</p>
            </div>
          ) : selectedFile.type === 'file' ? (
            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedFile.extension === 'tsx' ? 'typescript' : selectedFile.extension === 'css' ? 'css' : 'json'}
              value={selectedFile.content}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                padding: { top: 16 }
              }}
            />
          ) : (
            /* Modo Low-Code (Visualização de Imagem e Troca Fácil) */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto">
              <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl p-8 max-w-2xl w-full text-center shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">{selectedFile.name}</h3>
                <p className="text-gray-400 text-sm mb-6">Modo Visual (Low-Code). Arraste uma nova imagem por cima para substituir.</p>
                
                <div className="rounded-lg overflow-hidden border border-[#3c3c3c] bg-black/50 p-4 mb-6 flex justify-center">
                  <img src={selectedFile.url} alt={selectedFile.name} className="max-h-[300px] object-contain rounded-md" />
                </div>

                <div className="flex gap-4 justify-center">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm">
                    Fazer Upload de Nova Imagem
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
