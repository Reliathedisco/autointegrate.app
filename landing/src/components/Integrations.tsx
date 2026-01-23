import { ScrollAnimation } from './ScrollAnimation';

export function Integrations() {
  const integrations = [
    'Stripe', 'Clerk', 'Supabase', 'Resend', 'OpenAI',
    'Auth0', 'MongoDB', 'Prisma', 'SendGrid', 'Trigger.dev',
    'Inngest', 'Twilio', 'Firebase', 'Vercel', 'AWS',
    'PostgreSQL', 'Redis', 'Sentry', 'PostHog', 'Segment',
    'Algolia', 'Mailgun', 'Pusher'
  ];

  const frameworks = [
    { name: 'Next.js App Router', color: '#9ACD32' },
    { name: 'Node.js', color: '#FF69B4' },
    { name: 'Python FastAPI', color: '#006D77' }
  ];

  return (
    <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-white mb-4">
              23+ Integration Templates
            </h2>
            <p className="text-xl text-gray-400">
              Pre-built templates for the most popular services
            </p>
          </div>
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-16">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-center text-white hover:border-[#9ACD32] transition-colors cursor-pointer"
              >
                {integration}
              </div>
            ))}
          </div>
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.2}>
          <div className="text-center mb-8">
            <h3 className="text-2xl text-white mb-4">Framework Support</h3>
          </div>
        </ScrollAnimation>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frameworks.map((framework, index) => (
            <ScrollAnimation key={index} delay={0.3 + index * 0.1}>
              <div 
                className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors"
              >
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-4"
                  style={{ backgroundColor: `${framework.color}20` }}
                >
                  <div 
                    className="w-full h-full rounded-lg flex items-center justify-center"
                    style={{ color: framework.color }}
                  >
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: framework.color }} />
                  </div>
                </div>
                <h4 className="text-white">{framework.name}</h4>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}