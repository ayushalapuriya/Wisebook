export const subjects = ['DBMS', 'Operating Systems', 'Computer Networks', 'Java', 'React', 'Machine Learning'];

export const notes = [
  {
    id: 'n1',
    title: 'Normalization and Functional Dependencies',
    subject: 'DBMS',
    tags: ['unit-2', 'exam'],
    uploadDate: '2026-06-01',
    preview: 'Normalization reduces redundancy and improves data consistency through structured relations.',
    views: 142
  },
  {
    id: 'n2',
    title: 'Process Scheduling Algorithms',
    subject: 'Operating Systems',
    tags: ['cpu', 'revision'],
    uploadDate: '2026-05-29',
    preview: 'FCFS, SJF, Priority, and Round Robin differ in waiting time, turnaround time, and fairness.',
    views: 118
  },
  {
    id: 'n3',
    title: 'TCP Congestion Control',
    subject: 'Computer Networks',
    tags: ['transport', 'viva'],
    uploadDate: '2026-05-21',
    preview: 'Slow start, congestion avoidance, fast retransmit, and fast recovery regulate sender rate.',
    views: 96
  }
];

export const activity = [
  'Generated flashcards for TCP Congestion Control',
  'Uploaded Process Scheduling Algorithms',
  'Created subject Machine Learning',
  'Exported DBMS notes as PDF'
];

export const subjectChart = [
  { subject: 'DBMS', notes: 12 },
  { subject: 'OS', notes: 8 },
  { subject: 'CN', notes: 7 },
  { subject: 'Java', notes: 5 },
  { subject: 'React', notes: 4 },
  { subject: 'ML', notes: 6 }
];

export const monthlyChart = [
  { month: 'Jan', uploads: 4 },
  { month: 'Feb', uploads: 7 },
  { month: 'Mar', uploads: 6 },
  { month: 'Apr', uploads: 10 },
  { month: 'May', uploads: 13 },
  { month: 'Jun', uploads: 5 }
];
