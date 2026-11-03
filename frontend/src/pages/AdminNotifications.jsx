import { useState, useEffect } from 'react';
import api from '../services/api';
import Toast from '../components/common/Toast';

const AdminNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [officialNotifs, setOfficialNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [examForm, setExamForm] = useState({
    examName: '',
    examDate: '',
    applicationDeadline: ''
  });

  const [deadlineForm, setDeadlineForm] = useState({
    examName: '',
    deadline: ''
  });

  useEffect(() => {
    fetchSyncStatus();
    fetchOfficialNotifs();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3500);
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await api.get('/notifications/sync-status');
      setSyncStatus(res.data);
    } catch (err) {
      console.warn('Could not fetch sync status:', err);
    }
  };

  const fetchOfficialNotifs = async () => {
    try {
      setLoadingNotifs(true);
      const res = await api.get('/notifications/official');
      setOfficialNotifs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching official notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      const res = await api.post('/notifications/sync');
      setSyncStatus(res.data);
      showToast(res.data.summary || 'Official TNPSC synchronization completed successfully!', 'success');
      await fetchOfficialNotifs();
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Synchronization failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleReviewToggle = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/review`);
      setOfficialNotifs(officialNotifs.map(n => n.id === id ? res.data : n));
      showToast('Notification marked as reviewed ✅', 'success');
    } catch (err) {
      console.error('Error marking as reviewed:', err);
      showToast('Failed to mark as reviewed', 'error');
    }
  };

  const handleBroadcastExam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/notifications/broadcast/exam-announcement', null, {
        params: {
          examName: examForm.examName,
          examDate: examForm.examDate,
          applicationDeadline: examForm.applicationDeadline
        }
      });

      showToast(response.data.message || 'Exam announcement broadcast successfully!', 'success');
      setExamForm({ examName: '', examDate: '', applicationDeadline: '' });
    } catch (error) {
      console.error('Error broadcasting exam announcement:', error);
      showToast('Failed to broadcast exam announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastDeadline = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/notifications/broadcast/deadline-reminder', null, {
        params: {
          examName: deadlineForm.examName,
          deadline: deadlineForm.deadline
        }
      });

      showToast(response.data.message || 'Deadline reminder broadcast successfully!', 'success');
      setDeadlineForm({ examName: '', deadline: '' });
    } catch (error) {
      console.error('Error broadcasting deadline reminder:', error);
      showToast('Failed to broadcast deadline reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
              <span>🏛️</span>
              <span>Admin - TNPSC Notification Center</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage automated official synchronization, verify announcements, and review duplicate prevention.
            </p>
          </div>

          <a
            href="/notifications"
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold transition"
          >
            ← View User Notifications
          </a>
        </div>

        {/* ================================================= */}
        {/* OFFICIAL SYNCHRONIZATION MANAGEMENT PANEL */}
        {/* ================================================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>🔄</span>
                <span>Automatic Official TNPSC Synchronization</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sources: https://apply.tnpscexams.in & https://www.tnpsc.gov.in (Scheduled every 30 minutes)
              </p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncLoading}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span className={syncLoading ? 'animate-spin' : ''}>🔄</span>
              <span>{syncLoading ? 'Synchronizing Live...' : 'Trigger Sync Now'}</span>
            </button>
          </div>

          {/* Sync Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-slate-900/60 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium block">Total Synced</span>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {officialNotifs.length}
              </span>
            </div>

            <div className="bg-emerald-50 dark:bg-slate-900/60 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">Last Inserted</span>
              <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                {syncStatus?.newInserted ?? 0}
              </span>
            </div>

            <div className="bg-purple-50 dark:bg-slate-900/60 p-4 rounded-xl border border-purple-200 dark:border-purple-900/40">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium block">Updated Records</span>
              <span className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                {syncStatus?.updatedCount ?? 0}
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-slate-900/60 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium block">Duplicates Prevented</span>
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                {syncStatus?.duplicatesSkipped ?? 0}
              </span>
            </div>
          </div>

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-xs space-y-1 mb-6">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status: </span>
                  <span className={`font-bold ${syncStatus.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {syncStatus.status || 'Active'}
                  </span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-gray-500 dark:text-gray-400">Trigger: </span>
                  <span className="font-semibold">{syncStatus.triggerType || 'SCHEDULE'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Last Synced: </span>
                  <span className="font-semibold">
                    {syncStatus.syncTime ? new Date(syncStatus.syncTime).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>

              {syncStatus.summary && (
                <p className="text-gray-600 dark:text-gray-400 pt-1 font-mono">{syncStatus.summary}</p>
              )}

              {syncStatus.errorMessages && syncStatus.errorMessages.length > 0 && (
                <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                  <span className="font-bold">Error Logs:</span>
                  <ul className="list-disc list-inside mt-1">
                    {syncStatus.errorMessages.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Official Announcements Verification Table */}
          <div>
            <h3 className="text-base font-bold mb-3 flex items-center justify-between">
              <span>Verified Official TNPSC Announcements ({officialNotifs.length})</span>
              <button
                onClick={fetchOfficialNotifs}
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Refresh List
              </button>
            </h3>

            {loadingNotifs ? (
              <p className="text-center py-6 text-sm text-gray-400">Loading official records...</p>
            ) : officialNotifs.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-400">
                No notifications synced yet. Click "Trigger Sync Now" to fetch from TNPSC.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-96 rounded-xl border border-gray-200 dark:border-slate-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-slate-700/60 uppercase font-semibold text-gray-600 dark:text-gray-300 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">№</th>
                      <th className="py-2.5 px-3">Title & Category</th>
                      <th className="py-2.5 px-3">Dates (Pub / End)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">PDF Links</th>
                      <th className="py-2.5 px-3">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {officialNotifs.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-slate-750">
                        <td className="py-2.5 px-3 font-bold">{n.notificationNumber || 'N/A'}</td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <p className="font-semibold line-clamp-1">{n.title}</p>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{n.category}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div>Pub: {n.publishedDate || 'N/A'}</div>
                          <div className="text-gray-500">End: {n.applicationEndDate || 'N/A'}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                            {n.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 space-x-1 whitespace-nowrap">
                          {n.officialPdfUrl ? (
                            <a
                              href={n.officialPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 underline font-semibold"
                            >
                              English PDF
                            </a>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                          {n.officialPdfUrlTamil && (
                            <a
                              href={n.officialPdfUrlTamil}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 underline ml-1"
                            >
                              Tamil
                            </a>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <button
                            onClick={() => handleReviewToggle(n.id)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                              n.reviewed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-gray-200 text-gray-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-700 dark:text-gray-300'
                            }`}
                          >
                            {n.reviewed ? 'Reviewed ✅' : 'Mark Reviewed'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* EXISTING MANUAL BROADCAST SECTION */}
        {/* ================================================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <span>📢</span>
            <span>Manual Admin Broadcast Announcements</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Broadcast emergency alerts or custom notifications to all student dashboards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Announcement Form */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30">
              <h3 className="font-bold text-sm mb-3">📢 Broadcast Custom Exam Notice</h3>
              <form onSubmit={handleBroadcastExam} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Exam Name</label>
                  <input
                    type="text"
                    value={examForm.examName}
                    onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. TNPSC Group 1 Preliminary 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Exam Date</label>
                  <input
                    type="text"
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. 15/12/2026"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Application Deadline</label>
                  <input
                    type="text"
                    value={examForm.applicationDeadline}
                    onChange={(e) => setExamForm({ ...examForm, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. 30/11/2026"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Broadcast Announcement'}
                </button>
              </form>
            </div>

            {/* Deadline Reminder Form */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30">
              <h3 className="font-bold text-sm mb-3">⏰ Broadcast Deadline Reminder</h3>
              <form onSubmit={handleBroadcastDeadline} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Exam Name</label>
                  <input
                    type="text"
                    value={deadlineForm.examName}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, examName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. TNPSC Group 4 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deadline Date</label>
                  <input
                    type="text"
                    value={deadlineForm.deadline}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. 05/11/2026"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition disabled:opacity-50 mt-8"
                >
                  {loading ? 'Sending...' : 'Broadcast Reminder'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default AdminNotifications;
