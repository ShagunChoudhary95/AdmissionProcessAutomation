export const STATUS_CONFIG = {
  Draft: { label: 'Draft', color: 'gray' },
  Submitted: { label: 'Submitted', color: 'blue' },
  'Under Admin Review': { label: 'Under Review', color: 'amber' },
  'Correction Required': { label: 'Correction Required', color: 'orange' },
  'Eligibility Approved': { label: 'Eligibility Approved', color: 'teal' },
  'Not Eligible': { label: 'Not Eligible', color: 'red' },
  'Document Verification Pending': { label: 'Doc Verification Pending', color: 'purple' },
  'Documents Verified': { label: 'Documents Verified', color: 'teal' },
  'Admission Offered': { label: 'Admission Offered', color: 'indigo' },
  'Seat Reserved': { label: 'Seat Reserved', color: 'indigo' },
  'Payment Pending': { label: 'Payment Pending', color: 'amber' },
  'Admission Confirmed': { label: 'Admitted', color: 'green' },
  Rejected: { label: 'Rejected', color: 'red' },
  Waitlisted: { label: 'Waitlisted', color: 'orange' },
  'Offer Expired': { label: 'Offer Expired', color: 'red' },
  Withdrawn: { label: 'Withdrawn', color: 'gray' },
};

export const DOC_STATUS_CONFIG = {
  'Not Uploaded': { label: 'Not Uploaded', color: 'gray' },
  'Pending Verification': { label: 'Pending Verification', color: 'amber' },
  Verified: { label: 'Verified', color: 'green' },
  'Re-upload Required': { label: 'Re-upload Required', color: 'orange' },
  Rejected: { label: 'Rejected', color: 'red' },
};

export const ADMISSION_STEPS = [
  { key: 'submitted', label: 'Application Submitted' },
  { key: 'review', label: 'Admin Review' },
  { key: 'documents', label: 'Document Verification' },
  { key: 'offer', label: 'Admission Offer' },
  { key: 'payment', label: 'Fee Payment' },
  { key: 'confirmed', label: 'Admission Confirmed' },
];

export const STATUS_TO_STEP = {
  Draft: 0,
  Submitted: 1,
  'Under Admin Review': 1,
  'Correction Required': 1,
  'Eligibility Approved': 2,
  'Not Eligible': 1,
  'Document Verification Pending': 2,
  'Documents Verified': 3,
  'Admission Offered': 3,
  'Seat Reserved': 3,
  'Payment Pending': 4,
  'Admission Confirmed': 5,
};

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  OFFICER: 'officer',
};

export const COURSES = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'BCA'];

