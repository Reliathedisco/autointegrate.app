import { ScrollAnimation } from './ScrollAnimation';

export function WhoItsFor() {
  const audiences = [
    { title: 'Developers', emoji: '👨‍💻' },
    { title: 'Indie Builders', emoji: '🚀' },
    { title: 'SaaS Founders', emoji: '💼' },
    { title: 'Agencies', emoji: '🏢' },
    { title: 'Teams with multiple repos', emoji: '👥' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-white mb-4">
              Who It&apos;s For
            </h2>
          </div>
        </ScrollAnimation>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {audiences.map((audience, index) => (
            <ScrollAnimation key={index} delay={index * 0.1}>
              <div 
                className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 text-center hover:border-[#FF69B4] transition-colors group"
              >
                <div className="text-4xl mb-3">{audience.emoji}</div>
                <h3 className="text-white group-hover:text-[#FF69B4] transition-colors">
                  {audience.title}
                </h3>
              </div>
            </ScrollAnimation>
          ))}
        </div>
        
        <ScrollAnimation delay={0.5}>
          <div className="mt-16 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-white/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl sm:text-3xl text-white mb-4 text-center">
              Why It Matters
            </h3>
            <p className="text-xl text-gray-400 text-center max-w-3xl mx-auto">
              Teams lose days (or weeks) rebuilding the same integration patterns.  
              AutoIntegrate removes repetitive boilerplate and keeps integrations consistent.
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}