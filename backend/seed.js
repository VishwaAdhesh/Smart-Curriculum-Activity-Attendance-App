
/**
 * Database Seed Script
 * Creates demo users for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Define schemas inline for seeding
const studentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    rollNumber: { type: String, unique: true },
    department: String,
    year: Number,
    semester: Number,
    role: String,
    isActive: Boolean
});

const teacherSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    employeeId: { type: String, unique: true },
    department: String,
    designation: String,
    role: String,
    isActive: Boolean
});

const courseSchema = new mongoose.Schema({
    name: String,
    code: String,
    department: String,
    credits: Number,
    year: Number,
    semester: Number,
    teacher: mongoose.Schema.Types.ObjectId
});

const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Course = mongoose.model('Course', courseSchema);

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shi_db');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Course.deleteMany({});
        console.log('Cleared existing data');

        // Create demo users
        const hashedPassword = await bcrypt.hash('demo123', 10);

        // Create Teachers
        const teacher1 = await Teacher.create({
            name: 'Dr. John Smith',
            email: 'teacher@shi.edu',
            password: hashedPassword,
            employeeId: 'EMP001',
            department: 'Computer Science',
            designation: 'Professor',
            role: 'teacher',
            isActive: true
        });

        const teacher2 = await Teacher.create({
            name: 'Mrs. Sarah Johnson',
            email: 'sarah@shi.edu',
            password: hashedPassword,
            employeeId: 'EMP002',
            department: 'Computer Science',
            designation: 'Assistant Professor',
            role: 'teacher',
            isActive: true
        });

        // Create Students
        const student1 = await Student.create({
            name: 'Alice Brown',
            email: 'student@shi.edu',
            password: hashedPassword,
            rollNumber: 'CS001',
            department: 'Computer Science',
            year: 3,
            semester: 5,
            role: 'student',
            isActive: true
        });

        const student2 = await Student.create({
            name: 'Bob Wilson',
            email: 'bob@shi.edu',
            password: hashedPassword,
            rollNumber: 'CS002',
            department: 'Computer Science',
            year: 3,
            semester: 5,
            role: 'student',
            isActive: true
        });

        const student3 = await Student.create({
            name: 'Charlie Davis',
            email: 'charlie@shi.edu',
            password: hashedPassword,
            rollNumber: 'CS003',
            department: 'Computer Science',
            year: 3,
            semester: 5,
            role: 'student',
            isActive: true
        });

        // Create Courses
        const course1 = await Course.create({
            name: 'Data Structures',
            code: 'CS301',
            department: 'Computer Science',
            credits: 4,
            year: 3,
            semester: 5,
            teacher: teacher1._id
        });

        const course2 = await Course.create({
            name: 'Database Management',
            code: 'CS302',
            department: 'Computer Science',
            credits: 3,
            year: 3,
            semester: 5,
            teacher: teacher2._id
        });

        const course3 = await Course.create({
            name: 'Web Technologies',
            code: 'CS303',
            department: 'Computer Science',
            credits: 3,
            year: 3,
            semester: 5,
            teacher: teacher1._id
        });

        console.log('\n✅ Seed data created successfully!\n');
        console.log('Demo Accounts:');
        console.log('--------------');
        console.log('Teacher: teacher@shi.edu / demo123');
        console.log('Teacher: sarah@shi.edu / demo123');
        console.log('Student: student@shi.edu / demo123');
        console.log('Student: bob@shi.edu / demo123');
        console.log('Student: charlie@shi.edu / demo123');
        console.log('\nAdmin: admin@shi.edu / demo123 (role: admin)');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();


