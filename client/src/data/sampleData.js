// Sample data for Phase 1-4 frontend dev
// Replace with live API calls in Phase 5

export const sampleApplications = [
  {
    _id: '1',
    applicationNumber: 'ADM2026-7K9P42',
    studentName: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    course: 'B.Tech',
    branch: 'Computer Science',
    status: 'Under Admin Review',
    submittedAt: '2026-11-20T10:30:00Z',
    meritScore: 87.5,
    meritRank: 12,
    eligibilityStatus: 'eligible',
  },
  {
    _id: '2',
    applicationNumber: 'ADM2026-9M2X81',
    studentName: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    course: 'M.Tech',
    branch: 'AI/ML',
    status: 'Document Verification Pending',
    submittedAt: '2026-11-18T09:15:00Z',
    meritScore: 91.2,
    meritRank: 5,
    eligibilityStatus: 'eligible',
  },
  {
    _id: '3',
    applicationNumber: 'ADM2026-3B5Q17',
    studentName: 'Anjali Patel',
    email: 'anjali.patel@email.com',
    course: 'MBA',
    branch: 'Finance',
    status: 'Admission Offered',
    submittedAt: '2026-11-15T14:00:00Z',
    meritScore: 78.3,
    meritRank: 24,
    eligibilityStatus: 'eligible',
  },
  {
    _id: '4',
    applicationNumber: 'ADM2026-6C8R55',
    studentName: 'Karan Mehta',
    email: 'karan.mehta@email.com',
    course: 'B.Tech',
    branch: 'Electronics & Communication',
    status: 'Not Eligible',
    submittedAt: '2026-11-14T11:45:00Z',
    meritScore: null,
    meritRank: null,
    eligibilityStatus: 'ineligible',
  },
  {
    _id: '5',
    applicationNumber: 'ADM2026-5H3T96',
    studentName: 'Sneha Nair',
    email: 'sneha.nair@email.com',
    course: 'MCA',
    branch: 'Data Science',
    status: 'Admission Confirmed',
    submittedAt: '2026-11-10T08:00:00Z',
    meritScore: 93.7,
    meritRank: 2,
    eligibilityStatus: 'eligible',
  },
];

export const sampleCourses = [
  {
    _id: 'c1',
    name: 'B.Tech',
    isActive: true,
    branches: [
      { _id: 'b1', name: 'Computer Science', totalSeats: 60, confirmedSeats: 12, fees: { total: 150000 }, minMarks: 60, isActive: true },
      { _id: 'b2', name: 'AI & Data Science', totalSeats: 60, confirmedSeats: 8, fees: { total: 155000 }, minMarks: 65, isActive: true },
      { _id: 'b3', name: 'Cyber Security', totalSeats: 45, confirmedSeats: 5, fees: { total: 155000 }, minMarks: 60, isActive: true },
      { _id: 'b4', name: 'Information Technology', totalSeats: 60, confirmedSeats: 10, fees: { total: 148000 }, minMarks: 55, isActive: true },
      { _id: 'b5', name: 'Electronics & Communication', totalSeats: 60, confirmedSeats: 7, fees: { total: 145000 }, minMarks: 55, isActive: true },
    ],
  },
  {
    _id: 'c2',
    name: 'M.Tech',
    isActive: true,
    branches: [
      { _id: 'b6', name: 'Computer Science', totalSeats: 30, confirmedSeats: 4, fees: { total: 120000 }, minMarks: 55, isActive: true },
      { _id: 'b7', name: 'AI/ML', totalSeats: 30, confirmedSeats: 6, fees: { total: 125000 }, minMarks: 60, isActive: true },
      { _id: 'b8', name: 'Data Science', totalSeats: 30, confirmedSeats: 3, fees: { total: 125000 }, minMarks: 60, isActive: true },
    ],
  },
  {
    _id: 'c3',
    name: 'MBA',
    isActive: true,
    branches: [
      { _id: 'b9', name: 'Finance', totalSeats: 60, confirmedSeats: 15, fees: { total: 180000 }, minMarks: 50, isActive: true },
      { _id: 'b10', name: 'Marketing', totalSeats: 60, confirmedSeats: 20, fees: { total: 175000 }, minMarks: 50, isActive: true },
      { _id: 'b11', name: 'Business Analytics', totalSeats: 45, confirmedSeats: 8, fees: { total: 185000 }, minMarks: 55, isActive: true },
    ],
  },
  {
    _id: 'c4',
    name: 'MCA',
    isActive: true,
    branches: [
      { _id: 'b12', name: 'General', totalSeats: 60, confirmedSeats: 10, fees: { total: 100000 }, minMarks: 50, isActive: true },
      { _id: 'b13', name: 'AI', totalSeats: 45, confirmedSeats: 6, fees: { total: 105000 }, minMarks: 55, isActive: true },
      { _id: 'b14', name: 'Data Science', totalSeats: 45, confirmedSeats: 7, fees: { total: 105000 }, minMarks: 55, isActive: true },
    ],
  },
  {
    _id: 'c5',
    name: 'BCA',
    isActive: true,
    branches: [
      { _id: 'b15', name: 'General Computer Applications', totalSeats: 60, confirmedSeats: 18, fees: { total: 90000 }, minMarks: 45, isActive: true },
      { _id: 'b16', name: 'Full Stack Development', totalSeats: 45, confirmedSeats: 12, fees: { total: 95000 }, minMarks: 50, isActive: true },
    ],
  },
];

export const sampleDocuments = [
  {
    _id: 'd1',
    documentType: '10th Marksheet',
    required: true,
    currentVersion: { filePath: null, uploadedAt: null, verificationStatus: 'Not Uploaded', remarks: null },
  },
  {
    _id: 'd2',
    documentType: '12th Marksheet',
    required: true,
    currentVersion: { filePath: 'marksheet_12.pdf', uploadedAt: '2026-11-21T10:00:00Z', verificationStatus: 'Pending Verification', remarks: null },
  },
  {
    _id: 'd3',
    documentType: 'Aadhar Card',
    required: true,
    currentVersion: { filePath: 'aadhar.pdf', uploadedAt: '2026-11-21T10:05:00Z', verificationStatus: 'Verified', remarks: null },
  },
  {
    _id: 'd4',
    documentType: 'Passport Photo',
    required: true,
    currentVersion: { filePath: 'photo.jpg', uploadedAt: '2026-11-21T10:10:00Z', verificationStatus: 'Re-upload Required', remarks: 'Photo is blurry. Please upload a clear, recent passport-size photograph.' },
  },
  {
    _id: 'd5',
    documentType: 'Category Certificate',
    required: false,
    currentVersion: { filePath: null, uploadedAt: null, verificationStatus: 'Not Uploaded', remarks: null },
  },
];

export const sampleNotifications = [
  { _id: 'n1', title: 'Application Submitted', message: 'Your application ADM2026-7K9P42 has been submitted successfully.', isRead: true, createdAt: '2026-11-20T10:31:00Z' },
  { _id: 'n2', title: 'Document Re-upload Required', message: 'Your Passport Photo has been rejected. Please upload a clear photograph.', isRead: false, createdAt: '2026-11-22T14:00:00Z' },
  { _id: 'n3', title: 'Aadhar Card Verified', message: 'Your Aadhar Card has been verified successfully.', isRead: false, createdAt: '2026-11-22T13:50:00Z' },
];

export const sampleAdminStats = {
  totalApplications: 248,
  pendingReview: 32,
  eligibleApplications: 189,
  ineligibleApplications: 24,
  documentsVerified: 87,
  admissionsConfirmed: 56,
  pendingDocVerification: 42,
};

export const sampleSeatData = [
  { course: 'B.Tech', branch: 'Computer Science', total: 60, reserved: 5, confirmed: 12, available: 43 },
  { course: 'B.Tech', branch: 'AI & Data Science', total: 60, reserved: 3, confirmed: 8, available: 49 },
  { course: 'M.Tech', branch: 'AI/ML', total: 30, reserved: 2, confirmed: 6, available: 22 },
  { course: 'MBA', branch: 'Finance', total: 60, reserved: 8, confirmed: 15, available: 37 },
  { course: 'MCA', branch: 'Data Science', total: 45, reserved: 4, confirmed: 7, available: 34 },
];

