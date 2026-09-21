import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText, 
  UserCheck, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getApplications, reviewApplication } from '../services/api';
import { exportToCSV } from '../utils/csvExport';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Selected application for detail inspector modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionModalApp, setRejectionModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAppData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getApplications({
        status: statusFilter,
        search: searchTerm,
        page,
        limit: 15,
      });
      setApplications(data?.applications || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, [statusFilter, searchTerm, page]);

  // Export CSV Action
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const fullData = await getApplications({
        status: statusFilter,
        search: searchTerm,
        exportAll: true,
      });

      const exportColumns = [
        { key: 'applicationId', label: 'Application ID' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'status', label: 'Status' },
        { key: 'registrationFeePaid', label: 'Fee Paid' },
        { key: 'registrationFeeAmount', label: 'Fee Amount (INR)' },
        { key: 'totalValidVotes', label: 'Votes Count' },
        { key: 'createdAt', label: 'Applied At' },
      ];

      exportToCSV(fullData.applications, exportColumns, 'BorderBound_Contestant_Applications');
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleApprove = async (appId) => {
    if (!window.confirm('Are you sure you want to APPROVE this contestant application and publish them LIVE?')) return;
    setSubmittingAction(true);
    try {
      await reviewApplication(appId, { action: 'approve' });
      alert('Application approved successfully!');
      if (selectedApp) setSelectedApp(null);
      fetchAppData();
    } catch (err) {
      alert('Approval failed: ' + (err.message || err));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return alert('Please enter a rejection reason.');
    setSubmittingAction(true);
    try {
      await reviewApplication(rejectionModalApp._id, {
        action: 'reject',
        rejectionReason,
      });
      alert('Application rejected.');
      setRejectionModalApp(null);
      setRejectionReason('');
      if (selectedApp) setSelectedApp(null);
      fetchAppData();
    } catch (err) {
      alert('Rejection failed: ' + (err.message || err));
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Contestant Applications"
        subtitle={`Managing ${total} Applications Recorded`}
        onRefresh={fetchAppData}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Controls Toolbar: Search, Status Filter, Export CSV */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Name, App ID, Email, Mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved / Live</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
                <option value="pending_payment">Pending Payment</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'Generating CSV...' : 'Export CSV (Excel)'}</span>
            </button>
          </div>
        </div>

        {/* Applications Data Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">App ID</th>
                  <th className="p-4">Applicant Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Fee Status</th>
                  <th className="p-4">Review Status</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No contestant applications match the criteria.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-400">{app.applicationId}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{app.fullName}</div>
                        <div className="text-[11px] text-slate-400">{app.mobile} • {app.email}</div>
                      </td>
                      <td className="p-4 text-slate-300">{app.city}, {app.state}</td>
                      <td className="p-4">
                        {app.registrationFeePaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Paid (₹{app.registrationFeeAmount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            app.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : app.status === 'pending_review'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                          title="View Application Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleApprove(app._id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectionModalApp(app)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg shadow-sm"
                            >
                              Reject
                            </button>
                          </>
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

      {/* Application Detail Inspector Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Inspector: ${selectedApp.applicationId}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Header profile summary */}
            <div className="flex items-center gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              {selectedApp.profilePhotoUrl ? (
                <img
                  src={selectedApp.profilePhotoUrl}
                  alt={selectedApp.fullName}
                  className="w-16 h-16 rounded-xl object-cover border border-indigo-500/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
                  {selectedApp.fullName?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{selectedApp.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {selectedApp.age} Years • {selectedApp.gender} • {selectedApp.occupation || 'N/A'}
                </p>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">{selectedApp.email} | {selectedApp.mobile}</p>
              </div>
            </div>

            {/* Address & Emergency Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Location</span>
                <p className="text-slate-200">{selectedApp.permanentAddress || 'N/A'}</p>
                <p className="text-slate-400">{selectedApp.city}, {selectedApp.state}</p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Emergency Contact</span>
                <p className="text-slate-200 font-semibold">{selectedApp.emergencyContact?.name || 'N/A'}</p>
                <p className="text-slate-400">Relation: {selectedApp.emergencyContact?.relation || 'N/A'}</p>
                <p className="text-indigo-400">{selectedApp.emergencyContact?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Bio */}
            {selectedApp.bio && (
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Contestant Bio</span>
                <p className="text-xs text-slate-300 italic">"{selectedApp.bio}"</p>
              </div>
            )}

            {/* Uploaded Documents */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Uploaded Verification Documents</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  selectedApp.documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-medium text-slate-200 uppercase">{doc.docType.replace('_', ' ')}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 col-span-2">No documents attached.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            {selectedApp.status === 'pending_review' && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRejectionModalApp(selectedApp)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleApprove(selectedApp._id)}
                  disabled={submittingAction}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Approve Application
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Rejection Reason Input Modal */}
      {rejectionModalApp && (
        <Modal
          isOpen={!!rejectionModalApp}
          onClose={() => setRejectionModalApp(null)}
          title={`Reject Application: ${rejectionModalApp.applicationId}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Provide a reason for rejection. This will be recorded for audit purposes.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Rejection Reason *
              </label>
              <textarea
                required
                rows="4"
                placeholder="e.g. Incomplete ID document proof provided."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectionModalApp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Applications;
