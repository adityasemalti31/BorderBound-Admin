import React, { useEffect, useState } from 'react';
import { Trophy, Star, ShieldCheck, Lock, Sparkles, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { getFinalSelections, selectWildcards, certifyResults } from '../services/api';

const Selections = () => {
  const [top32, setTop32] = useState([]);
  const [wildcardEligible, setWildcardEligible] = useState([]);
  const [selectedWildcards, setSelectedWildcards] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSelections = async () => {
    setIsRefreshing(true);
    try {
      const data = await getFinalSelections();
      setTop32(data?.top32 || []);
      setWildcardEligible(data?.wildcardEligibleTop50 || []);

      // Pre-select wildcards if already chosen
      const preselected = (data?.wildcardEligibleTop50 || [])
        .filter((c) => c.isWildCardSelected)
        .map((c) => c.id);
      setSelectedWildcards(preselected);
    } catch (err) {
      console.error('Failed to load final selections:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSelections();
  }, []);

  const toggleWildcardSelect = (id) => {
    if (selectedWildcards.includes(id)) {
      setSelectedWildcards(selectedWildcards.filter((item) => item !== id));
    } else {
      if (selectedWildcards.length >= 4) {
        alert('You can select a maximum of 4 Wild Card contestants.');
        return;
      }
      setSelectedWildcards([...selectedWildcards, id]);
    }
  };

  const handleSaveWildcards = async () => {
    if (selectedWildcards.length !== 4) {
      return alert('Please select exactly 4 Wild Card contestants.');
    }
    setSubmitting(true);
    try {
      const res = await selectWildcards(selectedWildcards);
      alert(res.message || '4 Wild Card contestants selected successfully!');
      fetchSelections();
    } catch (err) {
      alert('Failed to select wildcards: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCertify = async () => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to OFFICIALLY CERTIFY and lock the competition final results?')) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await certifyResults();
      alert(res.message || 'Competition results officially certified!');
      fetchSelections();
    } catch (err) {
      alert('Certification failed: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Final Selections & Certification"
        subtitle="Manage Top 32, Select 4 Wildcards & Certify Official Results"
        onRefresh={fetchSelections}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Banner Certification Header */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                BORDERBOUND Official Final Certification
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Top 32 ranked contestants automatically qualify. Select 4 Wild Card contestants from Rank #33 to #50.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveWildcards}
              disabled={submitting || selectedWildcards.length !== 4}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-amber-300" />
              <span>Save 4 Wildcards ({selectedWildcards.length}/4)</span>
            </button>
            <button
              onClick={handleCertify}
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Certify & Lock Competition</span>
            </button>
          </div>
        </div>

        {/* Two Columns: Top 32 Table & Wildcard Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 32 Ranked Qualified List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Top 32 Qualified Contestants</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Direct Qualification
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {top32.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No contestants in Top 32 yet.</div>
              ) : (
                top32.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-500/30">
                        #{c.rank}
                      </span>
                      <div>
                        <p className="font-bold text-xs text-white">{c.fullName}</p>
                        <p className="text-[10px] text-slate-400">ID: {c.applicationId} • {c.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-indigo-300">{c.totalValidVotes} Votes</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wildcard Candidates (Rank #33 - #50) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                <span>Wildcard Eligible Pool (Rank #33 - #50)</span>
              </h3>
              <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Select 4
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {wildcardEligible.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No eligible candidates ranked #33-#50.</div>
              ) : (
                wildcardEligible.map((c) => {
                  const isSelected = selectedWildcards.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleWildcardSelect(c.id)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-950/50 border-purple-500 shadow-lg shadow-purple-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-extrabold text-xs flex items-center justify-center">
                          #{c.rank}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-white">{c.fullName}</p>
                          <p className="text-[10px] text-slate-400">ID: {c.applicationId} • {c.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-indigo-300">{c.totalValidVotes} Votes</span>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Star className="w-3 h-3 fill-current" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Selections;
