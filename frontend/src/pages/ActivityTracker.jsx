import { useState, useEffect } from 'react';

const ActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Sample activity data
  const sampleActivities = [
    {
      _id: '1',
      title: 'Data Structures Quiz',
      description: 'Online quiz covering arrays, linked lists, and trees',
      type: 'Quiz',
      course: { name: 'Data Structures', code: 'CS301' },
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      maxMarks: 20,
      status: 'upcoming'
    },
    {
      _id: '2',
      title: 'Database Project',
      description: 'Design and implement a database system for a library management system',
      type: 'Project',
      course: { name: 'Database Management', code: 'CS302' },
      scheduledDate: new Date(Date.now() + 432000000).toISOString(),
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      maxMarks: 50,
      status: 'upcoming'
    },
    {
      _id: '3',
      title: 'Web Development Lab',
      description: 'Complete the HTML/CSS assignment',
      type: 'Lab',
      course: { name: 'Web Development', code: 'CS303' },
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      maxMarks: 10,
      status: 'active'
    },
    {
      _id: '4',
      title: 'Mid-term Examination',
      description: 'Written exam covering all topics till week 8',
      type: 'Exam',
      course: { name: 'Computer Networks', code: 'CS304' },
      scheduledDate: new Date(Date.now() + 1209600000).toISOString(),
      dueDate: null,
      maxMarks: 100,
      status: 'upcoming'
    },
    {
      _id: '5',
      title: 'Algorithm Assignment',
      description: 'Solve the given algorithmic problems',
      type: 'Assignment',
      course: { name: 'Data Structures', code: 'CS301' },
      scheduledDate: new Date(Date.now() - 172800000).toISOString(),
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      maxMarks: 30,
      status: 'completed'
    },
  ];

  useEffect(() => {
    setActivities(sampleActivities);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Quiz':
        return 'bg-purple-100 text-purple-700';
      case 'Project':
        return 'bg-primary-100 text-primary-700';
      case 'Lab':
        return 'bg-success-100 text-success-700';
      case 'Exam':
        return 'bg-danger-100 text-danger-700';
      case 'Assignment':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.status === filter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Tracker</h1>
          <p className="text-gray-500 mt-1">Track and manage curriculum activities</p>
        </div>
        <button className="btn btn-primary">
          + Create Activity
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'upcoming', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="grid gap-4">
        {filteredActivities.map((activity) => (
          <div key={activity._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                <p className="text-gray-500 mt-1">{activity.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>📚 {activity.course.code} - {activity.course.name}</span>
                  <span>📅 {formatDate(activity.scheduledDate)}</span>
                  {activity.dueDate && (
                    <span>⏰ Due: {formatDate(activity.dueDate)}</span>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-gray-900">{activity.maxMarks}</p>
                <p className="text-sm text-gray-500">marks</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="btn btn-secondary text-sm">
                View Details
              </button>
              {activity.status === 'active' && (
                <button className="btn btn-primary text-sm">
                  Submit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No activities found</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTracker;

