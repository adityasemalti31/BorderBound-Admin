import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck, IndianRupee, Layers, Lock } from 'lucide-react';
import Header from '../components/Header';
import API, { updateSystemConfig } from '../services/api';

const SystemConfig = () => {
  const [registrationFee, setRegistrationFee] = useState(500);
  const [pricePerVote, setPricePerVote] = useState(10);
  const [currentPhase, setCurrentPhase] = useState('registration');
  const [votingActive, setVotingActive] = useState(true);
  const [registrationActive, setRegistrationActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setIsRefreshing(true);
    try {
      const response = await API.get('/config/public');
      const cfg = response.data.data;
      if (cfg) {
        setRegistrationFee(cfg.registrationFee || 500);
        setPricePerVote(cfg.pricePerVote || 10);
        setCurrentPhase(cfg.currentPhase || 'registration');
        setVotingActive(cfg.votingActive ?? true);
        setRegistrationActive(cfg.registrationActive ?? true);
      }
    } catch (err) {
      console.error('Failed to load system config:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSystemConfig({
        registrationFee: Number(registrationFee),
        pricePerVote: Number(pricePerVote),
        currentPhase,
        votingActive,
        registrationActive,
      });
      alert('System configuration updated successfully!');
      fetchConfig();
    } catch (err) {
      alert('Failed to save configuration: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="System Settings & Pricing"
        subtitle="Manage Registration Fees, Voting Rates & Phase Controls"
        onRefresh={fetchConfig}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-6 max-w-4xl mx-auto">
        <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Global Pricing & Phase Controls</h2>
              <p className="text-xs text-slate-400">Configure parameters for THE BORDERBOUND portal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Registration Fee Amount (INR) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="number"
                  required
                  min="0"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Voting Pricing per Vote */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Price Per Vote (INR) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="number"
                  required
                  min="1"
                  value={pricePerVote}
                  onChange={(e) => setPricePerVote(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Competition Phase */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Active Competition Phase
            </label>
            <select
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
            >
              <option value="registration">Registration Phase Open</option>
              <option value="voting">Voting Phase Open</option>
              <option value="wildcard">Wildcard Phase Open</option>
              <option value="finalized">Competition Concluded & Finalized</option>
            </select>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <label className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-xs text-white block">Accept New Registrations</span>
                <span className="text-[10px] text-slate-400">Enable registration fee payment & form submit</span>
              </div>
              <input
                type="checkbox"
                checked={registrationActive}
                onChange={(e) => setRegistrationActive(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-xs text-white block">Accept Audience Votes</span>
                <span className="text-[10px] text-slate-400">Enable paid vote purchasing on website</span>
              </div>
              <input
                type="checkbox"
                checked={votingActive}
                onChange={(e) => setVotingActive(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving System Config...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SystemConfig;
