import { Check } from 'lucide-react';
import { ScrollAnimation } from './ScrollAnimation';

const APP_URL = 'https://autointegrate--reli2.replit.app';

export function Pricing() {
  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '14 days',
      description: 'Perfect for testing',
      features: [
        '3 integrations',
        'Sandbox mode',
        'Basic templates',
        'Community support'
      ],
      color: '#006D77',
      highlight: false
    },
    {
      name: 'Solo Developer',
      price: '$29',
      period: 'month',
      description: 'For individual builders',
      features: [
        '50 integrations/month',
        'All templates',
        'Custom templates',
        'AI assistance',
        'Priority support',
        'Job history'
      ],
      color: '#9ACD32',
      highlight: true
    },
    {
      name: 'Team',
      price: '$99',
      period: 'month',
      description: 'For growing teams',
      features: [
        '200 integrations/month',
        'All templates',
        'Custom templates',
        'AI assistance',
        'Team collaboration',
        'Advanced analytics',
        'Priority support'
      ],
      color: '#FF69B4',
      highlight: false
    },
    {
      name: 'Agency',
      price: '$299',
      period: 'month',
      description: 'Unlimited everything',
      features: [
        'Unlimited integrations',
        'All templates',
        'Custom templates',
        'White-label option',
        'Dedicated support',
        'SLA guarantee',
        'Custom frameworks'
      ],
      color: '#006D77',
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-white mb-4">Pricing</h2>
          <p className="text-xl text-gray-400">Choose what fits your workflow</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <ScrollAnimation key={index} delay={index * 0.1}>
              <div 
                className={`relative bg-[#1A1A1A] border rounded-2xl p-6 hover:-translate-y-2 transition-all ${
                  plan.highlight 
                    ? 'border-[#9ACD32] shadow-lg shadow-[#9ACD32]/20' 
                    : 'border-white/10'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#9ACD32] text-[#0A0A0A] rounded-full text-sm">
                    Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl text-white">{plan.price}</span>
                    <span className="text-gray-400 mb-1">/{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check 
                        className="w-5 h-5 flex-shrink-0 mt-0.5" 
                        style={{ color: plan.color }}
                      />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href={APP_URL}
                  className={`block w-full py-3 rounded-lg transition-colors text-center ${
                    plan.highlight
                      ? 'bg-[#9ACD32] text-[#0A0A0A] hover:bg-[#88bb20]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  Get Started
                </a>
              </div>
            </ScrollAnimation>
          ))}
        </div>
        
        <ScrollAnimation delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Need lifetime access?</p>
            <a 
              href={APP_URL}
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#FF69B4] to-[#9ACD32] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              View Lifetime Plan
            </a>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}