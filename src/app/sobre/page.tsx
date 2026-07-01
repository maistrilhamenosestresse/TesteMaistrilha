"use client";

import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Heart, Users, Map, Leaf, ChevronDown } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="bg-[#0F1722] text-white min-h-screen overflow-x-hidden font-sans selection:bg-[#F17B37] selection:text-white pb-20 relative">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center min-h-[70vh] text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F17B37]/10 via-[#0F1722]/80 to-[#0F1722] z-0" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h2 className="text-[#F17B37] font-bold tracking-[0.3em] uppercase text-sm mb-6 drop-shadow-lg">A Nossa Essência</h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl">
            Como tudo <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F17B37] to-amber-500">começou</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            O Mais Trilha Menos Estresse nasceu da vontade de conectar pessoas incríveis através da natureza. 
            Não somos apenas uma agência de turismo, somos uma verdadeira família de trilheiros apaixonados por aventura, superação e bem-estar.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1 }}
          className="absolute bottom-10 z-10 animate-bounce text-gray-500"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src="/FotosEvideos/Nivea/IMG_0521.JPG" 
                alt="Nossa história" 
                className="w-full h-[500px] object-cover rounded-[2rem] shadow-2xl shadow-[#F17B37]/20 border border-white/10"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-lg text-gray-300"
            >
              <h2 className="text-4xl font-black text-white mb-8">Muito mais que trilhas</h2>
              <p>
                Nossa missão sempre foi clara: proporcionar momentos inesquecíveis longe do caos da cidade. 
                Acreditamos no poder curativo da natureza e em como caminhar ao ar livre pode transformar vidas, reduzindo a ansiedade e trazendo mais clareza mental.
              </p>
              <p>
                Cada expedição é cuidadosamente planejada para garantir segurança, diversão e, acima de tudo, acolhimento. 
                Ninguém fica para trás. Quando você viaja com o Mais Trilha, você ganha amigos para a vida toda.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Paixão", desc: "Amamos o que fazemos e a natureza que nos cerca." },
              { icon: Users, title: "Comunidade", desc: "Uma família unida por aventuras e boas risadas." },
              { icon: Map, title: "Exploração", desc: "Roteiros exclusivos e destinos surpreendentes." },
              { icon: Leaf, title: "Ecoturismo", desc: "Respeito total ao meio ambiente em cada passo." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 bg-[#F17B37]/20 rounded-2xl flex items-center justify-center text-[#F17B37] mb-6">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
