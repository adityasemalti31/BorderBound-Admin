import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CreditCard, 
  Vote, 
  Clock, 
  IndianRupee, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles 
} from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { getDashboardStats, getApplications, getPayments } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, appsRes, paymentsRes] = await Promise.all([
        getDashboardStats(),
        getApplications({ page: 1, limit: 5 }),
        getPayments({ page: 1, limit: 5 }),
      ]);

      setStats(statsRes);
      setRecentApplications(appsRes?.applications || []);
      setRecentPayments(paymentsRes?.payments || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Admin Overview"
        subtitle="Live Metrics & Recent Activity Summary"
        onRefresh={loadDashboardData}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={stats?.totalApplications || 0}
            subtext={`${stats?.approvedApplications || 0} Approved / Live`}
            icon={FileText}
            color="indigo"
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.pendingApplications || 0}
            subtext="Requires Admin Verification"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Payment Revenue"
            value={formatCurrency(stats?.totalRevenue)}
            subtext={`${stats?.totalSuccessfulPayments || 0} Paid Transactions`}
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Total Votes Cast"
            value={stats?.totalVotesCast || 0}
            subtext="Verified Audience Votes"
            icon={Vote}
            color="cyan"
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quick Control Shortcuts</h3>
              <p className="text-xs text-slate-400">Access key admin features directly</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/applications?status=pending_review"
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <span>Review Pending Apps ({stats?.pendingApplications || 0})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/payments"
              className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <span>Export Payment Records</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Two Column Grid for Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Recent Applications</h3>
                <p className="text-xs text-slate-400">Latest contestant registrations</p>
              </div>
              <Link
                to="/applications"
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No applications recorded yet.</div>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white">{app.fullName}</p>
                      <p className="text-xs text-slate-400">App ID: {app.applicationId} • {app.city}, {app.state}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : app.status === 'pending_review'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Recent Payments</h3>
                <p className="text-xs text-slate-400">Latest gateway transactions</p>
              </div>
              <Link
                to="/payments"
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No payment records found yet.</div>
              ) : (
                recentPayments.map((pay) => (
                  <div
                    key={pay._id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{formatCurrency(pay.amount)}</span>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          {pay.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Txn: {pay.txnid}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          pay.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : pay.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
