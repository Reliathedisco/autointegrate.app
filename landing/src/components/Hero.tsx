import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF69B4]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#006D77]/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#9ACD32]" />
            <span className="text-sm text-gray-300">Automated API integrations that just work</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
          >
            Build integrations in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-[#9ACD32]">
              minutes
            </span>
            {' '}— not weeks
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Automated API integrations that generate code, commit changes, and open pull requests — all from one dashboard.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="/sandbox" className="group px-8 py-4 bg-[#9ACD32] text-[#0A0A0A] rounded-lg hover:bg-[#88bb20] transition-all flex items-center gap-2">
              Generate your first PR
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/sandbox?demo=true" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
              <span>🎮</span>
              Try Demo Mode
            </a>
          </motion.div>
          
          <p className="mt-6 text-sm text-gray-500">
            One click → a ready-to-merge PR
          </p>
        </div>
        
        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#FF69B4]" />
              <div className="w-3 h-3 rounded-full bg-[#9ACD32]" />
              <div className="w-3 h-3 rounded-full bg-[#006D77]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="w-12 h-12 bg-[#9ACD32]/20 rounded-lg mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#9ACD32] rounded" />
                </div>
                <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-2 bg-white/5 rounded w-full mb-1" />
                <div className="h-2 bg-white/5 rounded w-4/5" />
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="w-12 h-12 bg-[#FF69B4]/20 rounded-lg mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#FF69B4] rounded" />
                </div>
                <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-2 bg-white/5 rounded w-full mb-1" />
                <div className="h-2 bg-white/5 rounded w-4/5" />
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="w-12 h-12 bg-[#006D77]/20 rounded-lg mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#006D77] rounded" />
                </div>
                <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-2 bg-white/5 rounded w-full mb-1" />
                <div className="h-2 bg-white/5 rounded w-4/5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
