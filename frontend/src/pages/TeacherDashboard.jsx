import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/teachers/${user?.id}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.status === 'success') {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  // Sample data for demonstration
  const stats = {
    totalCourses: 5,
    totalStudents: 150,
    todayAttendance: 142,
    pendingActivities: 8
  };

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Attendance',
        data: [95, 92, 88, 96, 94, 85],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 80,
        max: 100,
        ticks: {
          callback: (value) => value + '%',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Teacher'}!</h1>
        <p className="mt-2 text-secondary-100">Manage your courses and track student attendance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">My Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Active courses this semester</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Enrolled across all courses</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayAttendance}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Students marked present today</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Activities</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingActivities}</p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Activities awaiting grading</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend (Last 6 Days)</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary flex items-center justify-center gap-2">
              <span>📝</span>
              Mark Attendance
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center gap-2">
              <span>➕</span>
              Create Activity
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center gap-2">
              <span>📊</span>
              View Analytics
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center gap-2">
              <span>✉️</span>
              Send Notification
            </button>
          </div>
        </div>
      </div>

      {/* Courses & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Data Structures', code: 'CS301', students: 45, sessions: 24 },
              { name: 'Database Management', code: 'CS302', students: 38, sessions: 20 },
              { name: 'Web Development', code: 'CS303', students: 42, sessions: 22 },
              { name: 'Computer Networks', code: 'CS304', students: 35, sessions: 18 },
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-medium">{course.code.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <p className="text-sm text-gray-500">{course.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{course.students} students</p>
                  <p className="text-xs text-gray-500">{course.sessions} sessions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Activities</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Quiz - Data Structures', type: 'Quiz', date: 'Tomorrow', course: 'CS301' },
              { title: 'Lab Assignment', type: 'Lab', date: 'Dec 20', course: 'CS302' },
              { title: 'Project Submission', type: 'Project', date: 'Dec 25', course: 'CS303' },
              { title: 'Mid-term Exam', type: 'Exam', date: 'Jan 5', course: 'CS304' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.course} • {activity.type}</p>
                </div>
                <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm">
                  {activity.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

