import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LineChart = ({ points = [0] }) => {
  const w = 700;
  const h = 220;
  
  // If no data or all zeros, show placeholder
  if (!points || points.length === 0 || points.every(p => p === 0)) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">Take quizzes to see your progress graph</p>
      </div>
    );
  }
  
  const max = Math.max(...points, 100); // Ensure at least 100 for scaling
  const stepX = points.length > 1 ? w / (points.length - 1) : w / 2;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX},${h - (p / max) * h}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={i * stepX} cy={h - (p / max) * h} r="4" fill="#0ea5e9" />
      ))}
    </svg>
  );
};

const MyProgress = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [topicData, setTopicData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user, location]); // Re-fetch when navigating to progress page

  const handleDownloadProgress = () => {
    const userName = user?.name || user?.email || 'Student';
    const avgScore = progressData?.averageScore ? Math.round(progressData.averageScore) : 0;
    const totalTests = progressData?.totalQuizzes || 0;
    const date = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Colors
    const primaryColor = [22, 101, 52]; // Green
    const darkColor = [31, 41, 55];
    const grayColor = [107, 114, 128];
    
    // Header background
    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TNPSC Exam Prep', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Progress Report', pageWidth / 2, 32, { align: 'center' });
    
    // Student info section
    let yPos = 60;
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(userName, 50, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(date, 140, yPos);
    
    // Divider line
    yPos += 10;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    // Overall Stats Section
    yPos += 15;
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F');
    
    // Average Score
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.text('Average Score', 45, yPos + 12);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${avgScore}%`, 45, yPos + 27);
    
    // Tests Taken
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Tests Taken', pageWidth / 2 + 25, yPos + 12);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalTests}`, pageWidth / 2 + 25, yPos + 27);
    
    // Topic-wise Progress Section
    yPos += 50;
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Topic-wise Progress', 20, yPos);
    
    yPos += 10;
    
    if (topicData.length > 0) {
      // Table header
      doc.setFillColor(22, 101, 52);
      doc.rect(20, yPos, pageWidth - 40, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Topic', 25, yPos + 7);
      doc.text('Tests', 100, yPos + 7);
      doc.text('Score', 130, yPos + 7);
      doc.text('Status', 160, yPos + 7);
      
      yPos += 10;
      
      // Table rows
      topicData.forEach((topic, index) => {
        const isEven = index % 2 === 0;
        if (isEven) {
          doc.setFillColor(249, 250, 251);
          doc.rect(20, yPos, pageWidth - 40, 10, 'F');
        }
        
        doc.setTextColor(...darkColor);
        doc.setFont('helvetica', 'normal');
        doc.text(topic.name.substring(0, 25), 25, yPos + 7);
        doc.text(`${topic.tests}`, 100, yPos + 7);
        doc.text(`${topic.percent}%`, 130, yPos + 7);
        
        // Status with color
        if (topic.percent >= 60) {
          doc.setTextColor(22, 163, 74); // Green
          doc.text('Pass', 160, yPos + 7);
        } else {
          doc.setTextColor(220, 38, 38); // Red
          doc.text('Needs Work', 160, yPos + 7);
        }
        
        yPos += 10;
      });
    } else {
      doc.setTextColor(...grayColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('No topic data available yet. Take quizzes to see your progress!', 20, yPos + 10);
      yPos += 20;
    }
    
    // Footer
    yPos = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by TNPSC Exam Prep App', pageWidth / 2, yPos, { align: 'center' });
    doc.text('Keep learning and practicing!', pageWidth / 2, yPos + 5, { align: 'center' });
    
    // Save PDF
    doc.save(`TNPSC_Progress_Report_${date.replace(/,?\s+/g, '_')}.pdf`);
  };

  // Re-fetch data when window/tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchProgressData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchProgressData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const userId = user._id || user.id;
      console.log('=== MyProgress: Fetching progress for user:', userId);
      console.log('=== MyProgress: User object:', JSON.stringify(user, null, 2));
      
      // Fetch overall progress
      const progressResponse = await apiClient.get(`/progress/user/${userId}`);
      console.log('=== MyProgress: Progress API response:', progressResponse.data);
      setProgressData(progressResponse.data);
      
      // Fetch quiz history for chart
      try {
        const historyResponse = await apiClient.get(`/results/user/${userId}`);
        console.log('=== MyProgress: Quiz history response:', historyResponse.data);
        console.log('=== MyProgress: Quiz history length:', historyResponse.data?.length || 0);
        
        // Transform results into chart data points
        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          const sortedResults = historyResponse.data
            .sort((a, b) => new Date(a.completedAt || a.createdAt) - new Date(b.completedAt || b.createdAt))
            .slice(-10); // Take last 10 results
          
          const scores = sortedResults.map(result => {
            const score = result.score || 0;
            const total = result.totalQuestions || 1;
            return Math.round((score / total) * 100);
          });
          
          setChartData(scores.length > 0 ? scores : [0]);
        } else {
          setChartData([0]);
        }
      } catch (historyError) {
        console.error('Error fetching quiz history:', historyError);
        // Fallback to sample data if history fetch fails
        setChartData([0]);
      }
      
      // Fetch topic-wise progress
      const topicResponse = await apiClient.get(`/progress/user/${userId}/topic-wise`);
      console.log('Topic data:', topicResponse.data);
      
      // Transform topic data
      if (topicResponse.data && topicResponse.data.topicWise) {
        const topics = Object.entries(topicResponse.data.topicWise).map(([name, data]) => ({
          id: name,
          name: name,
          tests: data.testCount || 0,
          percent: Math.round(data.percentage || 0)
        }));
        setTopicData(topics);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setChartData([0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 pt-16 pb-24 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track performance over time</p>
            </div>
            <button
              onClick={handleDownloadProgress}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="Download progress as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {progressData?.averageScore ? Math.round(progressData.averageScore) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tests Taken</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {progressData?.totalQuizzes || 0}
                    </p>
                  </div>
                </div>
                <LineChart points={chartData} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Topic wise</h2>
                </div>

                {topicData.length > 0 ? (
                  <div className="space-y-3">
                    {topicData.map(topic => (
                      <div key={topic.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{topic.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{topic.tests} test{topic.tests !== 1 ? 's' : ''} taken</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${topic.percent >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                              {topic.percent}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${topic.percent >= 60 ? 'bg-green-600' : 'bg-red-600'}`}
                            style={{ width: `${topic.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-slate-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No topic data available yet. Take some quizzes to see your progress!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MyProgress;
