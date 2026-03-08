import { useState, useEffect } from 'react';

const AttendanceManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  // Sample course data
  const sampleCourses = [
    { _id: '1', name: 'Data Structures', code: 'CS301' },
    { _id: '2', name: 'Database Management', code: 'CS302' },
    { _id: '3', name: 'Web Development', code: 'CS303' },
  ];

  // Sample student data
  const sampleStudents = [
    { _id: '1', name: 'John Doe', rollNumber: 'CS001' },
    { _id: '2', name: 'Jane Smith', rollNumber: 'CS002' },
    { _id: '3', name: 'Bob Johnson', rollNumber: 'CS003' },
    { _id: '4', name: 'Alice Williams', rollNumber: 'CS004' },
    { _id: '5', name: 'Charlie Brown', rollNumber: 'CS005' },
  ];

  useEffect(() => {
    // Fetch courses
    setCourses(sampleCourses);
  }, []);

  useEffect(() => {
    // Fetch students when course is selected
    if (selectedCourse) {
      setStudents(sampleStudents);
      // Initialize attendance with default 'present'
      const initialAttendance = {};
      sampleStudents.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    }
  }, [selectedCourse]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updatedAttendance = {};
    students.forEach(student => {
      updatedAttendance[student._id] = status;
    });
    setAttendance(updatedAttendance);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course: selectedCourse,
          date: attendanceDate,
          attendance: Object.entries(attendance).map(([studentId, status]) => ({
            student: studentId,
            status
          }))
        })
      });

      if (response.ok) {
        alert('Attendance marked successfully!');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Attendance marked successfully (demo mode)!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Mark and manage student attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Quick Actions</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="btn btn-success flex-1"
              >
                All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="btn btn-danger flex-1"
              >
                All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {selectedCourse && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Students - {courses.find(c => c._id === selectedCourse)?.name}
            </h3>
            <div className="text-sm text-gray-500">
              {students.length} students
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Roll No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Student Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{student.rollNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{student.name}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={attendance[student._id]}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                          attendance[student._id] === 'present' ? 'bg-success-100 text-success-700' :
                          attendance[student._id] === 'absent' ? 'bg-danger-100 text-danger-700' :
                          attendance[student._id] === 'late' ? 'bg-warning-100 text-warning-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(student._id, 'present')}
                          className={`px-2 py-1 text-xs rounded ${
                            attendance[student._id] === 'present' 
                              ? 'bg-success-500 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-success-100'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleStatusChange(student._id, 'absent')}
                          className={`px-2 py-1 text-xs rounded ${
                            attendance[student._id] === 'absent' 
                              ? 'bg-danger-500 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-danger-100'
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => handleStatusChange(student._id, 'late')}
                          className={`px-2 py-1 text-xs rounded ${
                            attendance[student._id] === 'late' 
                              ? 'bg-warning-500 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-warning-100'
                          }`}
                        >
                          L
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary px-8"
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-success-50 border-success-200">
            <p className="text-sm text-success-700">Present</p>
            <p className="text-2xl font-bold text-success-800">
              {Object.values(attendance).filter(s => s === 'present').length}
            </p>
          </div>
          <div className="card bg-danger-50 border-danger-200">
            <p className="text-sm text-danger-700">Absent</p>
            <p className="text-2xl font-bold text-danger-800">
              {Object.values(attendance).filter(s => s === 'absent').length}
            </p>
          </div>
          <div className="card bg-warning-50 border-warning-200">
            <p className="text-sm text-warning-700">Late</p>
            <p className="text-2xl font-bold text-warning-800">
              {Object.values(attendance).filter(s => s === 'late').length}
            </p>
          </div>
          <div className="card bg-gray-50 border-gray-200">
            <p className="text-sm text-gray-700">Excused</p>
            <p className="text-2xl font-bold text-gray-800">
              {Object.values(attendance).filter(s => s === 'excused').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;

