export const VALID_TRANSITIONS = {
  Draft: ['Submitted', 'Withdrawn'],
  Submitted: ['Under Admin Review', 'Withdrawn'],
  'Under Admin Review': ['Eligibility Approved', 'Not Eligible', 'Correction Required', 'Rejected', 'Waitlisted'],
  'Correction Required': ['Submitted', 'Withdrawn'],
  'Eligibility Approved': ['Document Verification Pending', 'Rejected'],
  'Not Eligible': ['Draft', 'Withdrawn'],
  'Document Verification Pending': ['Documents Verified', 'Rejected'],
  'Documents Verified': ['Admission Offered', 'Waitlisted', 'Rejected'],
  'Admission Offered': ['Seat Reserved', 'Payment Pending', 'Offer Expired', 'Withdrawn', 'Rejected'],
  'Seat Reserved': ['Payment Pending', 'Admission Confirmed', 'Offer Expired', 'Withdrawn'],
  'Payment Pending': ['Admission Confirmed', 'Offer Expired', 'Withdrawn'],
  'Admission Confirmed': [],
  Rejected: [],
  Waitlisted: ['Admission Offered', 'Rejected', 'Withdrawn'],
  'Offer Expired': [],
  Withdrawn: [],
};

export function canTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

