// src/utils/constants.js

export const SUBJECTS = [
  { id: 'eptd', name: 'EPTD', teacherName: 'S. A. Ali', teacherUsername: 'eptd@sya' },
  { id: 'emi',  name: 'EMI',  teacherName: 'A. K. Roy', teacherUsername: 'emi@sya' },
  { id: 'ee',   name: 'EE',   teacherName: 'N. A. Sonkamble', teacherUsername: 'ee@sya' },
  { id: 'tdmc', name: 'T&DMC', teacherName: 'S. B. Khan', teacherUsername: 'tdmc@sya' },
  { id: 'pe',   name: 'PE',   teacherName: 'T. H. Shaikh', teacherUsername: 'pe@sya' },
  { id: 'uhv',  name: 'UHV',  teacherName: 'R. B. Palwe', teacherUsername: 'uhv@sya' },
];

export const STATUS = {
  SUBMITTED: 'submitted',
  LATE: 'late',
  NOT_SUBMITTED: 'not_submitted',
};

export const STATUS_LABEL = {
  submitted: 'Submitted',
  late: 'Late Submitted',
  not_submitted: 'Not Submitted',
};

export const STATUS_COLOR = {
  submitted: '#22c55e',
  late: '#f59e0b',
  not_submitted: '#ef4444',
};

export const TEACHER_SUBJECT_MAP = {
  'eptd@sya': 'eptd',
  'emi@sya': 'emi',
  'ee@sya': 'ee',
  'tdmc@sya': 'tdmc',
  'pe@sya': 'pe',
  'uhv@sya': 'uhv',
};
