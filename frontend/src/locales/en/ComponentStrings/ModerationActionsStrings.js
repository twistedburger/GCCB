export const moderationStrings = {
  pageTitle: 'Pending Reports',
  reportReason: 'Report Reason:',
  details: 'Report Details:',
  confirmApprove: report_target =>
    `This action cannot be undone. Are you sure you want to approve this ${report_target}?`,
  confirmDecline: report_target =>
    `This action cannot be undone. Are you sure you want to reject this ${report_target}?`,
  ok: 'OK',
  cancel: 'Cancel',
  invalidReports: [
    'No Violation',
    'Duplicate Report',
    'Insufficient Evidence',
    'Misuse',
    'Other',
  ],
  invalidVerifications: [
    'Inappropriate Content',
    'Misleading Information',
    'Duplicate Event',
    'Insufficient Details',
    'Spam',
    'Other',
  ],
  submitReport: 'Report submitted successfully.',
  submitEvent: 'Event verified successfully.',
  submitError: 'Something went wrong. Please try again.',
  approve: 'Approve',
  reject: 'Reject',
  selectReason: 'Select a reason...',
  reasonInvalid: 'Please provide a reason for the invalid report...',
  explanationInvalidRequired: 'Explanation for invalid report required.',
  rejectionLabel: isReport =>
    `Reason for invalid ${isReport ? 'report' : 'verification'}`,
}
