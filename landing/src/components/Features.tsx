import { GitPullRequest, Package, Brain, Wrench, FlaskConical, MessageSquare, History } from 'lucide-react';
import { ScrollAnimation } from './ScrollAnimation';

export function Features() {
  const features = [
    {
      icon: GitPullRequest,
      color: '#9ACD32',
      title: 'Automated PR Generation',
      description: 'Writes files, commits them, and opens a pull request — no manual setup.'
    },
    {
      icon: Package,
      color: '#FF69B4',
      title: '23+ Integration Templates',
      description: 'Stripe, Clerk, Supabase, Resend, OpenAI & more — plug in and go.'
    },
    {
      icon: Brain,
      color: '#006D77',
      title: 'Framework-Aware Code',
      description: 'Built for Next.js App Router, Node.js & FastAPI.'
    },
    {
      icon: Wrench,
      color: '#9ACD32',
      title: 'Custom Templates',
      description: 'Bring your own boilerplate. AutoIntegrate handles repetition for you.'
    },
    {
      icon: FlaskConical,
      color: '#FF69B4',
      title: 'Sandbox Mode',
      description: 'Preview diffs & download patches before touching your repo.'
    },
    {
      icon: MessageSquare,
      color: '#006D77',
      title: 'Built-In AI Assistance',
      description: 'Ask about env vars, setup issues, or integration docs on the spot.'
    },
    {
      icon: History,
      color: '#9ACD32',
      title: 'Job History & Pipeline',
      description: 'Track integrations, PR status & logs — organized, not chaotic.'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-white mb-4">Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything repetitive — automated. You stay in flow.
            </p>
          </div>
        </ScrollAnimation>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollAnimation key={index} delay={index * 0.05}>
                <div 
                  className="group bg-[#1A1A1A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:-translate-y-1"
                >
                  <div 
                    className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}