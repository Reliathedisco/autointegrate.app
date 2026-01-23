import { Zap, Trophy, Rocket, Code, Users } from 'lucide-react';
import { ScrollAnimation } from './ScrollAnimation';

export function UseCases() {
  const useCases = [
    { icon: Zap, text: 'Rapid prototyping', color: '#9ACD32' },
    { icon: Trophy, text: 'Hackathons', color: '#FF69B4' },
    { icon: Rocket, text: 'SaaS startups', color: '#006D77' },
    { icon: Code, text: 'API-first products', color: '#9ACD32' },
    { icon: Users, text: 'Agencies with multiple clients', color: '#FF69B4' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-white mb-4">Perfect For</h2>
          </div>
        </ScrollAnimation>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <div 
                  className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-all hover:-translate-y-1"
                >
                  <div 
                    className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${useCase.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: useCase.color }} />
                  </div>
                  <p className="text-white">{useCase.text}</p>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
        
        {/* Final CTA */}
        <ScrollAnimation delay={0.5}>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#0F0F0F] border border-white/10 rounded-2xl p-12 md:p-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF69B4]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9ACD32]/10 rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
                Start integrating instantly
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Stop wasting time on repetitive integration code. Let AutoIntegrate handle it.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-8 py-4 bg-[#9ACD32] text-[#0A0A0A] rounded-lg hover:bg-[#88bb20] transition-colors">
                  Generate your first PR
                </button>
                <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}