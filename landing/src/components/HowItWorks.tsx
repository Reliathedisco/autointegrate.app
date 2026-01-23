import { Code2, FolderGit2, GitPullRequest } from 'lucide-react';
import { ScrollAnimation } from './ScrollAnimation';

export function HowItWorks() {
  const steps = [
    {
      icon: Code2,
      color: '#9ACD32',
      title: 'Code generation',
      description: 'Generates framework-aware integration code'
    },
    {
      icon: FolderGit2,
      color: '#FF69B4',
      title: 'File scaffolding',
      description: 'Creates proper file structure + config'
    },
    {
      icon: GitPullRequest,
      color: '#006D77',
      title: 'Auto PR',
      description: 'Commits changes and opens pull request'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-white mb-4">
            AutoIntegrate handles every repetitive task
          </h2>
          <p className="text-xl text-gray-400">
            involved in adding integrations to a repo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <div className="relative">
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors">
                    <div 
                      className="w-14 h-14 rounded-lg mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    <h3 className="text-xl text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                  )}
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
        
        <ScrollAnimation delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              'Boilerplate config',
              'Environment variables',
              'API routes',
              'SDK setup',
              'Webhooks',
              'Test templates',
              'GitHub branches',
              'Pull requests',
              'File + folder structure'
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-300 text-center hover:bg-white/10 transition-colors"
              >
                {item}
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}