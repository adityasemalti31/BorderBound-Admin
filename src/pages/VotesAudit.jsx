import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Download, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  AlertTriangle 
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getVoteAuditLogs, invalidateVotes } from '../services/api';
import { exportToCSV } from '../utils/csvExport';

const VotesAudit = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Invalidation state
  const [selectedLog, setSelectedLog] = useState(null);
  const [invalidationReason, setInvalidationReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchVoteLogs = async () => {
    setIsRefreshing(true);
    try {
      const data = await getVoteAuditLogs({
        status: statusFilter,
        voterIp: ipFilter,
        page,
        limit: 15,
      });
      setLogs(data?.transactions || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch vote audit logs:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVoteLogs();
  }, [statusFilter, ipFilter, page]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const fullData = await getVoteAuditLogs({
        status: statusFilter,
        voterIp: ipFilter,
        exportAll: true,
      });

      const exportColumns = [
        { key: '_id', label: 'Vote Txn ID' },
        { key: 'contestantId.fullName', label: 'Contestant Name' },
        { key: 'contestantId.applicationId', label: 'Application ID' },
        { key: 'voterUserId.fullName', label: 'Voter Name' },
        { key: 'voterUserId.mobile', label: 'Voter Mobile' },
        { key: 'votesCount', label: 'Votes Count' },
        { key: 'status', label: 'Status' },
        { key: 'voterIp', label: 'Voter IP' },
        { key: 'invalidatedReason', label: 'Invalidation Reason' },
        { key: 'createdAt', label: 'Vote Timestamp' },
      ];

      exportToCSV(fullData.transactions, exportColumns, 'BorderBound_Vote_Audit_Logs');
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleInvalidateTxn = async (e) => {
    e.preventDefault();
    if (!invalidationReason.trim()) return alert('Please enter invalidation reason.');
    setSubmittingAction(true);
    try {
      await invalidateVotes({
        transactionId: selectedLog._id,
        reason: invalidationReason,
      });
      alert('Vote transaction invalidated and votes deducted from contestant profile.');
      setSelectedLog(null);
      setInvalidationReason('');
      fetchVoteLogs();
    } catch (err) {
      alert('Failed to invalidate vote: ' + (err.message || err));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleInvalidateIp = async (ip) => {
    const reason = window.prompt(`Enter reason for bulk invalidating ALL votes from IP: ${ip}`);
    if (!reason) return;

    setSubmittingAction(true);
    try {
      const res = await invalidateVotes({ voterIp: ip, reason });
      alert(res.message || `Invalidated votes from IP ${ip}`);
      fetchVoteLogs();
    } catch (err) {
      alert('Failed to invalidate IP votes: ' + (err.message || err));
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Vote Audit & Anti-Fraud Logs"
        subtitle={`Monitoring ${total} Voting Transactions`}
        onRefresh={fetchVoteLogs}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Controls Toolbar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by Voter IP Address (e.g. 192.168.1.1)..."
                value={ipFilter}
                onChange={(e) => setIpFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="valid">Valid Votes</option>
                <option value="invalidated">Invalidated / Fraud</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'Exporting...' : 'Export CSV (Excel)'}</span>
            </button>
          </div>
        </div>

        {/* Votes Data Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Txn ID</th>
                  <th className="p-4">Contestant</th>
                  <th className="p-4">Voter Profile</th>
                  <th className="p-4">Votes</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No vote logs recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-400">{log._id.slice(-8)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{log.contestantId?.fullName || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">App: {log.contestantId?.applicationId || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-200">{log.voterUserId?.fullName || 'Anonymous / Guest'}</div>
                        <div className="text-[11px] text-slate-500">{log.voterUserId?.mobile || log.voterUserId?.email}</div>
                      </td>
                      <td className="p-4 font-extrabold text-indigo-300 text-sm">{log.votesCount}</td>
                      <td className="p-4 font-mono text-slate-400">{log.voterIp || '127.0.0.1'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            log.status === 'valid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {log.status === 'valid' && (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" /> Invalidate
                          </button>
                        )}
                        {log.voterIp && log.status === 'valid' && (
                          <button
                            onClick={() => handleInvalidateIp(log.voterIp)}
                            className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg transition-colors"
                            title="Block all votes from this IP"
                          >
                            Ban IP
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Invalidate Vote Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Invalidate Vote Transaction: ${selectedLog._id.slice(-8)}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleInvalidateTxn} className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Invalidating will deduct {selectedLog.votesCount} vote(s) from contestant profile ranks.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Reason for Invalidation *
              </label>
              <textarea
                required
                rows="3"
                placeholder="e.g. Botnet automated vote inflation."
                value={invalidationReason}
                onChange={(e) => setInvalidationReason(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30"
              >
                Confirm Invalidation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default VotesAudit;
