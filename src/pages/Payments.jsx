import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  IndianRupee, 
  Layers,
  Calendar
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getPayments } from '../services/api';
import { exportToCSV } from '../utils/csvExport';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Inspector modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPaymentData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getPayments({
        status: statusFilter,
        type: typeFilter,
        search: searchTerm,
        page,
        limit: 15,
      });
      setPayments(data?.payments || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [statusFilter, typeFilter, searchTerm, page]);

  // Export CSV for each & every payment record
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const fullData = await getPayments({
        status: statusFilter,
        type: typeFilter,
        search: searchTerm,
        exportAll: true,
      });

      const exportColumns = [
        { key: 'txnid', label: 'Transaction ID' },
        { key: 'mihpayid', label: 'Gateway PayU ID' },
        { key: 'amount', label: 'Amount (INR)' },
        { key: 'type', label: 'Payment Type' },
        { key: 'status', label: 'Status' },
        { key: 'votesGenerated', label: 'Votes Generated' },
        { key: 'contestantId.fullName', label: 'Contestant Name' },
        { key: 'contestantId.applicationId', label: 'Application ID' },
        { key: 'userId.email', label: 'User Email' },
        { key: 'userId.mobile', label: 'User Mobile' },
        { key: 'paymentMode', label: 'Payment Mode' },
        { key: 'bankReferenceNumber', label: 'Bank Ref Number' },
        { key: 'ipAddress', label: 'IP Address' },
        { key: 'createdAt', label: 'Transaction Timestamp' },
      ];

      exportToCSV(fullData.payments, exportColumns, 'BorderBound_Payment_Records');
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Payment Records & Audit"
        subtitle={`Tracking ${total} Total Payment Transactions`}
        onRefresh={fetchPaymentData}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Controls Toolbar: Search, Filters & Export CSV */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by TxnID, PayU ID, Contestant, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Filter Type */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="registration">Registration Fee</option>
                <option value="voting">Voting Purchase</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="created">Created</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'Generating Excel CSV...' : 'Export CSV (Excel)'}</span>
            </button>
          </div>
        </div>

        {/* Payments Data Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Txn ID / PayU Ref</th>
                  <th className="p-4">Contestant / User</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Votes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">
                      No payment records match the current filters.
                    </td>
                  </tr>
                ) : (
                  payments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono">
                        <div className="font-bold text-indigo-400">{pay.txnid}</div>
                        {pay.mihpayid && <div className="text-[10px] text-slate-500">PayU: {pay.mihpayid}</div>}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {pay.contestantId?.fullName || pay.userId?.fullName || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          App: {pay.contestantId?.applicationId || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pay.type === 'registration'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {pay.type}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-white text-sm">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="p-4 font-bold text-indigo-300">
                        {pay.votesGenerated || 0}
                      </td>
                      <td className="p-4">
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
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(pay.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(pay)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                          title="Inspect Payment Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Payment Inspector Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Payment Transaction Inspector`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Amount & Status Banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Paid Amount</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedPayment.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            {/* Transaction Key Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Merchant Txn ID</span>
                <span className="font-mono text-indigo-400 font-bold">{selectedPayment.txnid}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Gateway Ref (PayU ID)</span>
                <span className="font-mono text-slate-200">{selectedPayment.mihpayid || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Mode</span>
                <span className="text-slate-200">{selectedPayment.paymentMode || 'UPI / NetBanking / Card'}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Bank Reference No.</span>
                <span className="font-mono text-slate-200">{selectedPayment.bankReferenceNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Contestant / User Linked Profile */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Associated Contestant</span>
              <p className="font-bold text-white text-sm">
                {selectedPayment.contestantId?.fullName || selectedPayment.userId?.fullName || 'N/A'}
              </p>
              <p className="text-slate-400">
                Application ID: {selectedPayment.contestantId?.applicationId || 'N/A'}
              </p>
              <p className="text-indigo-400">
                Email: {selectedPayment.userId?.email || selectedPayment.contestantId?.email || 'N/A'}
              </p>
            </div>

            {/* Technical Metadata */}
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
              <p><span className="text-slate-500">IP Address:</span> {selectedPayment.ipAddress || '127.0.0.1'}</p>
              <p><span className="text-slate-500">User Agent:</span> {selectedPayment.userAgent || 'Mozilla/5.0'}</p>
              <p><span className="text-slate-500">Created At:</span> {new Date(selectedPayment.createdAt).toISOString()}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
