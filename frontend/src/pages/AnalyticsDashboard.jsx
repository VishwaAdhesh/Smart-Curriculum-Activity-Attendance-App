import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  // Sample courses
  const courses = [
    { _id: 'all', name: 'All Courses' },
    { _id: '1', name: 'Data Structures - CS301' },
    { _id: '2', name: 'Database Management - CS302' },
    { _id: '3', name: 'Web Development - CS303' },
  ];

  // Sample data for charts
  const attendanceByDay = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Present',
        data: [45, 42, 48, 44, 46, 20],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Absent',
        data: [5, 8, 2, 6, 4, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'Late',
        data: [2, 3, 1, 2, 3, 1],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
      },
    ],
  };

  const attendanceTrend = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: [92, 88, 95, 90, 87, 94],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const studentPerformance = {
    labels: ['Excellent (>90%)', 'Good (75-90%)', 'Needs Improvement (<75%)'],
    datasets: [
      {
        data: [35, 45, 20],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const courseComparison = {
    labels: ['CS301', 'CS302', 'CS303', 'CS304'],
    datasets: [
      {
        label: 'Attendance %',
        data: [92, 88, 95, 85],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const lineOptions = {
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
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Detailed attendance and performance analytics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input w-48"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-32"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="btn btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Average Attendance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">92.4%</p>
          <p className="text-xs text-success-600 mt-2">↑ 2.3% from last period</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">156</p>
          <p className="text-xs text-gray-500 mt-2">This semester</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Students Below Threshold</p>
          <p className="text-3xl font-bold text-danger-600 mt-1">8</p>
          <p className="text-xs text-gray-500 mt-2">Below 75% attendance</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Perfect Attendance</p>
          <p className="text-3xl font-bold text-success-600 mt-1">23</p>
          <p className="text-xs text-gray-500 mt-2">100% attendance</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Overview</h3>
          <div className="h-72">
            <Bar data={attendanceByDay} options={barOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <div className="h-72">
            <Line data={attendanceTrend} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Distribution</h3>
          <div className="h-64">
            <Doughnut data={studentPerformance} options={doughnutOptions} />
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Attendance</h3>
          <div className="h-64">
            <Bar 
              data={courseComparison} 
              options={{
                ...barOptions,
                scales: {
                  x: { stacked: false },
                  y: { 
                    stacked: false,
                    max: 100,
                    ticks: {
                      callback: (value) => value + '%'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Table - Low Attendance Students */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Students Requiring Attention</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Roll No.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Course</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Attendance %</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rollNo: 'CS045', name: 'John Doe', course: 'CS301', attendance: 62 },
                { rollNo: 'CS052', name: 'Jane Smith', course: 'CS302', attendance: 68 },
                { rollNo: 'CS078', name: 'Bob Wilson', course: 'CS303', attendance: 71 },
                { rollNo: 'CS091', name: 'Alice Brown', course: 'CS301', attendance: 73 },
              ].map((student, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{student.rollNo}</td>
                  <td className="py-3 px-4 text-gray-900">{student.name}</td>
                  <td className="py-3 px-4 text-gray-500">{student.course}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-danger-500 h-2 rounded-full" 
                          style={{ width: `${student.attendance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-xs font-medium">
                      Low
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Send Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

