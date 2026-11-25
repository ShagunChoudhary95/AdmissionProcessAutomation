import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';
import Course from './models/Course.js';
import Branch from './models/Branch.js';
import MeritRule from './models/MeritRule.js';

export async function seedData() {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  console.log('Seeding users, courses, branches, and merit rules...');
  const passwordHash = await bcrypt.hash('demo1234', 12);

  const demoUsers = [
    { name: 'Priya Sharma', email: 'student@demo.com', phone: '9876543210', role: 'student', passwordHash },
    { name: 'Dr. A. K. Verma (Admin)', email: 'admin@demo.com', phone: '9876500001', role: 'admin', passwordHash },
    { name: 'R. Kulkarni (Officer)', email: 'officer@demo.com', phone: '9876500002', role: 'officer', passwordHash },
  ];

  for (const u of demoUsers) {
    const user = await User.findOneAndUpdate(
      { email: u.email },
      { $setOnInsert: u },
      { upsert: true, new: true }
    );
    if (u.role === 'student') {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        { $setOnInsert: { userId: user._id, personal: { phone: u.phone } } },
        { upsert: true }
      );
    }
  }

  const catalog = [
    {
      name: 'B.Tech',
      branches: [
        { name: 'Computer Science', minMarks: 60, totalSeats: 60, fees: { tuition: 145000, registration: 5000, total: 150000 }, qualificationRequired: '12th', requiredSubjects: ['Physics', 'Mathematics'] },
        { name: 'AI & Data Science', minMarks: 65, totalSeats: 60, fees: { tuition: 150000, registration: 5000, total: 155000 }, qualificationRequired: '12th', requiredSubjects: ['Physics', 'Mathematics'] },
        { name: 'Cyber Security', minMarks: 60, totalSeats: 45, fees: { tuition: 150000, registration: 5000, total: 155000 }, qualificationRequired: '12th', requiredSubjects: ['Physics', 'Mathematics'] },
        { name: 'Information Technology', minMarks: 55, totalSeats: 60, fees: { tuition: 143000, registration: 5000, total: 148000 }, qualificationRequired: '12th', requiredSubjects: ['Physics', 'Mathematics'] },
        { name: 'Electronics & Communication', minMarks: 55, totalSeats: 60, fees: { tuition: 140000, registration: 5000, total: 145000 }, qualificationRequired: '12th', requiredSubjects: ['Physics', 'Mathematics'] },
      ],
    },
    {
      name: 'M.Tech',
      branches: [
        { name: 'Computer Science', minMarks: 55, totalSeats: 30, fees: { tuition: 115000, registration: 5000, total: 120000 }, qualificationRequired: 'Graduation' },
        { name: 'AI/ML', minMarks: 60, totalSeats: 30, fees: { tuition: 120000, registration: 5000, total: 125000 }, qualificationRequired: 'Graduation' },
        { name: 'Data Science', minMarks: 60, totalSeats: 30, fees: { tuition: 120000, registration: 5000, total: 125000 }, qualificationRequired: 'Graduation' },
      ],
    },
    {
      name: 'MBA',
      branches: [
        { name: 'Finance', minMarks: 50, totalSeats: 60, fees: { tuition: 175000, registration: 5000, total: 180000 }, qualificationRequired: 'Graduation' },
        { name: 'Marketing', minMarks: 50, totalSeats: 60, fees: { tuition: 170000, registration: 5000, total: 175000 }, qualificationRequired: 'Graduation' },
        { name: 'Business Analytics', minMarks: 55, totalSeats: 45, fees: { tuition: 180000, registration: 5000, total: 185000 }, qualificationRequired: 'Graduation' },
      ],
    },
    {
      name: 'MCA',
      branches: [
        { name: 'General', minMarks: 50, totalSeats: 60, fees: { tuition: 95000, registration: 5000, total: 100000 }, qualificationRequired: 'Graduation' },
        { name: 'AI', minMarks: 55, totalSeats: 45, fees: { tuition: 100000, registration: 5000, total: 105000 }, qualificationRequired: 'Graduation' },
        { name: 'Data Science', minMarks: 55, totalSeats: 45, fees: { tuition: 100000, registration: 5000, total: 105000 }, qualificationRequired: 'Graduation' },
      ],
    },
    {
      name: 'BCA',
      branches: [
        { name: 'General Computer Applications', minMarks: 45, totalSeats: 60, fees: { tuition: 85000, registration: 5000, total: 90000 }, qualificationRequired: '12th' },
        { name: 'Full Stack Development', minMarks: 50, totalSeats: 45, fees: { tuition: 90000, registration: 5000, total: 95000 }, qualificationRequired: '12th' },
      ],
    },
  ];

  for (const c of catalog) {
    const course = await Course.findOneAndUpdate(
      { name: c.name },
      { $setOnInsert: { name: c.name, isActive: true } },
      { upsert: true, new: true }
    );

    for (const b of c.branches) {
      await Branch.findOneAndUpdate(
        { courseId: course._id, name: b.name },
        { $setOnInsert: { ...b, courseId: course._id } },
        { upsert: true }
      );
    }

    await MeritRule.findOneAndUpdate(
      { courseId: course._id, branchId: null },
      {
        $setOnInsert: {
          courseId: course._id,
          branchId: null,
          description: c.name === 'B.Tech' || c.name === 'BCA'
            ? '80% 12th Marks + 20% 10th Marks'
            : '60% Graduation Marks + 40% Entrance Exam',
          formula: c.name === 'B.Tech' || c.name === 'BCA'
            ? [
                { component: '12th Marks', source: '12th_percentage', weight: 0.8 },
                { component: '10th Marks', source: '10th_percentage', weight: 0.2 },
              ]
            : [
                { component: 'Graduation Marks', source: 'graduation_percentage', weight: 0.6 },
                { component: 'Entrance Exam', source: 'entrance_score', weight: 0.4 },
              ],
        },
      },
      { upsert: true }
    );
  }

  console.log('Seed complete.');
}

// Allow running directly: node seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  connectDB()
    .then(seedData)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
