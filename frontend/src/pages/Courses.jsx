import { useState, useEffect } from 'react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample course data
  const sampleCourses = [
    {
      _id: '1',
      name: 'Data Structures',
      code: 'CS301',
      description: 'Learn fundamental data structures like arrays, linked lists, trees, and graphs',
      department: 'Computer Science',
      credits: 4,
      teacher: { name: 'Dr. John Smith' },
      students: 45,
      schedule: 'Mon, Wed - 10:00 AM'
    },
    {
      _id: '2',
      name: 'Database Management',
      code: 'CS302',
      description: 'Learn database design, SQL, and data management concepts',
      department: 'Computer Science',
      credits: 3,
      teacher: { name: 'Prof. Sarah Johnson' },
      students: 38,
      schedule: 'Tue, Thu - 2:00 PM'
    },
    {
      _id: '3',
      name: 'Web Development',
      code: 'CS303',
      description: 'Learn modern web development with HTML, CSS, JavaScript, and React',
      department: 'Computer Science',
      credits: 4,
      teacher: { name: 'Dr. Mike Wilson' },
      students: 42,
      schedule: 'Mon, Wed, Fri - 11:00 AM'
    },
    {
      _id: '4',
      name: 'Computer Networks',
      code: 'CS304',
      description: 'Learn networking concepts, protocols, and network programming',
      department: 'Computer Science',
      credits: 3,
      teacher: { name: 'Prof. Lisa Brown' },
      students: 35,
      schedule: 'Tue, Thu - 4:00 PM'
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setCourses(sampleCourses);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">Browse and manage your courses</p>
        </div>
        <button className="btn btn-primary">
          + Add Course
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">{course.code.charAt(0)}</span>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {course.credits} Credits
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{course.code}</p>
            
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {course.description}
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {course.teacher.name}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {course.students} students
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.schedule}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn btn-secondary flex-1 text-sm">
                View Details
              </button>
              <button className="btn btn-primary flex-1 text-sm">
                View Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No courses found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default Courses;

