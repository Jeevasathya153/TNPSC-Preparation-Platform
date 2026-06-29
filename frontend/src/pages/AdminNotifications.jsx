import { useState } from 'react';
import api from '../services/api';
import Toast from '../components/common/Toast';

const AdminNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [examForm, setExamForm] = useState({
    examName: '',
    examDate: '',
    applicationDeadline: ''
  });

  const [deadlineForm, setDeadlineForm] = useState({
    examName: '',
    deadline: ''
  });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Admin - Broadcast Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send exam announcements and deadline reminders to all users
          </p>
        </div>

        {/* Exam Announcement Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            📢 Broadcast Exam Announcement
          </h2>
          <form onSubmit={handleBroadcastExam}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={examForm.examName}
                  onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., TNPSC Group 4 Exam 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Date
                </label>
                <input
                  type="text"
                  value={examForm.examDate}
                  onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., March 15-20, 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="text"
                  value={examForm.applicationDeadline}
                  onChange={(e) => setExamForm({ ...examForm, applicationDeadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., January 31, 2025"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Broadcasting...' : 'Broadcast to All Users'}
              </button>
            </div>
          </form>
        </div>

        {/* Deadline Reminder Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            ⏰ Broadcast Deadline Reminder
          </h2>
          <form onSubmit={handleBroadcastDeadline}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={deadlineForm.examName}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, examName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., TNPSC Group 4 Exam 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deadline
                </label>
                <input
                  type="text"
                  value={deadlineForm.deadline}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., January 31, 2025"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Broadcasting...' : 'Broadcast to All Users'}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mt-6 text-white">
          <h3 className="text-xl font-bold mb-3">ℹ️ Information</h3>
          <ul className="space-y-2 text-sm">
            <li>• New users automatically receive default exam notifications upon registration</li>
            <li>• Use these forms to broadcast new announcements to all existing users</li>
            <li>• Notifications will appear in all users' notification pages</li>
            <li>• All notifications are timestamped and can be marked as read or deleted by users</li>
          </ul>
        </div>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default AdminNotifications;
