export const moderationStrings = {
  reportReason: 'Report Reason:',
  details: 'Details:',
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
}
