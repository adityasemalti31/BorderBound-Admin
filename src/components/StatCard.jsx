import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'indigo' }) => {
  const colorStyles = {
    indigo: {
      border: 'border-indigo-500/20',
      bgIcon: 'bg-indigo-500/10 text-indigo-400',
      glow: 'shadow-indigo-500/5',
    },
    emerald: {
      border: 'border-emerald-500/20',
      bgIcon: 'bg-emerald-500/10 text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    amber: {
      border: 'border-amber-500/20',
      bgIcon: 'bg-amber-500/10 text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    cyan: {
      border: 'border-cyan-500/20',
      bgIcon: 'bg-cyan-500/10 text-cyan-400',
      glow: 'shadow-cyan-500/5',
    },
    purple: {
      border: 'border-purple-500/20',
      bgIcon: 'bg-purple-500/10 text-purple-400',
      glow: 'shadow-purple-500/5',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      className={`bg-slate-900/70 backdrop-blur-xl border ${currentStyle.border} p-6 rounded-2xl shadow-xl ${currentStyle.glow} transition-all duration-300 hover:scale-[1.02] hover:border-slate-700`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${currentStyle.bgIcon} border border-white/5`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
