import { useEffect, useState } from 'react';
import { ScrollAnimation } from './ScrollAnimation';
import { Zap, Clock, TrendingUp, CheckCircle } from 'lucide-react';

interface MetricsStats {
  integrationsThisWeek: number;
  hoursSavedThisMonth: number;
  totalIntegrations: number;
  totalHoursSaved: number;
}

export function SocialProof() {
  const [metrics, setMetrics] = useState<MetricsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/metrics/public');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return null;
  }

  const stats = [
    {
      icon: TrendingUp,
      value: metrics.integrationsThisWeek,
      label: 'Integrations This Week',
      color: '#9ACD32',
    },
    {
      icon: Clock,
      value: `${metrics.hoursSavedThisMonth}h`,
      label: 'Hours Saved This Month',
      color: '#FF69B4',
    },
    {
      icon: Zap,
      value: metrics.totalIntegrations,
      label: 'Total Integrations',
      color: '#006D77',
    },
    {
      icon: CheckCircle,
      value: `${metrics.totalHoursSaved}h`,
      label: 'Total Hours Saved',
      color: '#9ACD32',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl text-white mb-3">Trusted by Developers</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              See how AutoIntegrate is helping developers save time and ship faster.
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-all">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
