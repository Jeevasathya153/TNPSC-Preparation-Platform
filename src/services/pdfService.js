// Static PDF data from TNPSC Materials - No MongoDB required
// Source: https://tnpscematerials.wordpress.com/

const BASE_URL = 'https://tnpscematerials.wordpress.com/wp-content/uploads/2015/12';

// Study Materials / Books
export const studyMaterials = [
  // General Studies
  {
    id: 'gs-official',
    title: 'TNPSC Official General Studies',
    subject: 'General Studies',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/tnpsc-bulk-android-app_tnpsc_offical_general_studies.pdf`,
    size: '2 MB'
  },
  {
    id: 'gs-english-official',
    title: 'TNPSC Official General English',
    subject: 'General English',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/tnpsc-bulk-android-app_tnpsc_offical_general_english.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'gs-tamil-official',
    title: 'TNPSC Official General Tamil',
    subject: 'General Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/tnpsc-bulk-android-app_tnpsc_offical_general_tamil.pdf`,
    size: '2 MB'
  },
  
  // Tamil Materials by Class
  {
    id: 'tamil-6th',
    title: '6th Samacheer Kalvi Tamil Notes',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/6th-samacheer-kalvi-study-materials.pdf`,
    size: '1 MB'
  },
  {
    id: 'tamil-7th',
    title: '7th Samacheer Kalvi Tamil Notes',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/7th-samacheer-kalvi-notes.pdf`,
    size: '1.2 MB'
  },
  {
    id: 'tamil-8th',
    title: '8th Tamil Text Book Notes',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/8th-tamil-text-book-notes.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'tamil-9th',
    title: '9th Samacheer Kalvi Tamil Notes',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/9th-samacheer-kalvi-notes-tnpsc-tamil.pdf`,
    size: '1.8 MB'
  },
  {
    id: 'tamil-10th',
    title: '10th Samacheer Kalvi Tamil',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/4',
    pdfUrl: `${BASE_URL}/10th-samacheer-kalvi-tamil-palani-murugan.pdf`,
    size: '2 MB'
  },
  {
    id: 'tamil-11th',
    title: '11th Tamil Study Material',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 1/2',
    pdfUrl: `${BASE_URL}/11th-tamil-material-for-tnspc-exam-palani-murugan-tnpsctamil-in.pdf`,
    size: '2.5 MB'
  },
  {
    id: 'tamil-12th',
    title: '12th Tamil Study Material',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 1/2',
    pdfUrl: `${BASE_URL}/12th-tamil-material-by-palani-murugan-tnpsctamil-in.pdf`,
    size: '2.8 MB'
  },
  {
    id: 'tamil-grammar',
    title: 'தமிழ் இலக்கணம் - Tamil Grammar',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC Group 2/VAO',
    pdfUrl: `${BASE_URL}/e0aea4e0aeaee0aebfe0aeb4e0af8d-e0ae87e0aeb2e0ae95e0af8de0ae95e0aea3e0aeaee0af8d.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'tamil-part-a',
    title: 'Tamil TNPSC Part-A Material',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/tamil-tnpsc-part-a-material.pdf`,
    size: '1 MB'
  },
  {
    id: 'tamil-part-b',
    title: 'Tamil TNPSC Part-B Material',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/tnpsc-tamil-part-b-material.pdf`,
    size: '1 MB'
  },
  {
    id: 'tamil-part-c',
    title: 'Tamil TNPSC Part-C Material',
    subject: 'Tamil',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/tamil-tnpsc-part-c-material.pdf`,
    size: '1 MB'
  },
  
  // History
  {
    id: 'history-qa',
    title: 'வரலாறு வினா விடைகள் - History Q&A',
    subject: 'History',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/e0aeb5e0aeb0e0aeb2e0aebee0aeb1e0af81-e0aeb5e0aebfe0aea9e0aebe-e0aeb5e0aebfe0ae9fe0af88e0ae95e0aeb3e0af8d.pdf`,
    size: '2 MB'
  },
  {
    id: 'modern-india',
    title: 'Modern India Material',
    subject: 'History',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/tnpsc-modern-india-material.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'nayakkar-period',
    title: '10th Tamil & Nayakkar Period',
    subject: 'History',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/10th-tamil-nayakkar-period-dec-2015.pdf`,
    size: '1 MB'
  },
  
  // Civics / Polity
  {
    id: 'constitution-india',
    title: 'Constitution of India Material',
    subject: 'Civics',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/constitution-of-india-material.pdf`,
    size: '2 MB'
  },
  {
    id: 'indian-polity-tamil',
    title: 'இந்திய அரசியலமைப்பு - Indian Polity Tamil',
    subject: 'Civics',
    category: 'BOOK',
    exam: 'TNPSC Group 2/VAO',
    pdfUrl: `${BASE_URL}/e0ae87e0aea8e0af8de0aea4e0aebfe0aeaf-e0ae85e0aeb0e0ae9ae0aebfe0aeafe0aeb2e0aeaee0af88e0aeaae0af8de0aeaae0af81-e0aea4e0aeaee0aebfe0aeb4.pdf`,
    size: '1.8 MB'
  },
  
  // Geography
  {
    id: 'geography-notes',
    title: 'Geography One Word Notes',
    subject: 'Geography',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/geography-one-word-notes-dec-2015.pdf`,
    size: '800 KB'
  },
  
  // Science
  {
    id: 'physics-500',
    title: 'Physics 500 Important Questions',
    subject: 'Science',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/tnpsc-physics-500-important-questions-and-answers.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'maths-science',
    title: 'General Maths & Science Practice',
    subject: 'Science',
    category: 'BOOK',
    exam: 'TNPSC Group 2',
    pdfUrl: `${BASE_URL}/tnpsc-group-2-general-mathssciencepractics-your-skill-part-4.pdf`,
    size: '1.2 MB'
  },
  
  // Maths
  {
    id: 'maths-mental',
    title: 'Maths and Mental Ability',
    subject: 'Maths',
    category: 'BOOK',
    exam: 'TNPSC Group 2A/VAO',
    pdfUrl: `${BASE_URL}/download-maths-and-mental-ability-for-tnpsc-group-2a-and-vao.pdf`,
    size: '2 MB'
  },
  
  // VAO Specific
  {
    id: 'vao-materials',
    title: 'VAO Examination Study Materials',
    subject: 'General Studies',
    category: 'BOOK',
    exam: 'VAO',
    pdfUrl: `${BASE_URL}/vao-examination-study-materials.pdf`,
    size: '3 MB'
  },
  {
    id: 'vao-mini',
    title: 'VAO Mini Materials',
    subject: 'General Studies',
    category: 'BOOK',
    exam: 'VAO',
    pdfUrl: `${BASE_URL}/vao-mini-materials-dec-2015.pdf`,
    size: '1 MB'
  },
  
  // General Knowledge
  {
    id: 'gk-qa',
    title: 'பொது அறிவு வினா விடைகள் - GK Q&A',
    subject: 'General Studies',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/e0aeaae0af8ae0aea4e0af81-e0ae85e0aeb1e0aebfe0aeb5e0af81-e0aeb5e0aebfe0aea9e0aebe-e0aeb5e0aebfe0ae9fe0af88e0ae95e0aeb3e0af8d.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'social-science-1',
    title: 'சமுக அறிவியல் வினா விடைகள் Part-1',
    subject: 'General Studies',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/e0ae9ae0aeaee0af81e0ae95-e0ae85e0aeb1e0aebfe0aeb5e0aebfe0aeafe0aeb2e0af8d-e0aeb5e0aebfe0aea9e0aebe-e0aeb5e0aebfe0ae9fe0af88e0ae951.pdf`,
    size: '1.5 MB'
  },
  {
    id: 'social-science-2',
    title: 'சமுக அறிவியல் வினா விடைகள் Part-2',
    subject: 'General Studies',
    category: 'BOOK',
    exam: 'TNPSC',
    pdfUrl: `${BASE_URL}/e0ae9ae0aeaee0af81e0ae95-e0ae85e0aeb1e0aebfe0aeb5e0aebfe0aeafe0aeb2e0af8d-e0aeb5e0aebfe0aea9e0aebe-e0aeb5e0aebfe0ae9fe0af88e0ae95.pdf`,
    size: '1.5 MB'
  }
];

// Previous Year Questions
export const previousYearQuestions = [
  // Group 2A Answer Keys
  {
    id: 'group2a-tamil-key',
    title: 'Group 2A Answer Key - General Tamil',
    subject: 'General Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc-group-2a-answer-key-general-tamil.pdf`,
    size: '500 KB'
  },
  {
    id: 'group2a-gs-key',
    title: 'Group 2A Answer Key - General Studies',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc-group-2a-answer-key-general-studies.pdf`,
    size: '500 KB'
  },
  {
    id: 'group2a-english-key',
    title: 'Group 2A Answer Key - General English',
    subject: 'General English',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc-group-2a-answer-key-general-english.pdf`,
    size: '500 KB'
  },
  {
    id: 'group2a-gk-updated',
    title: 'Group 2A General Knowledge Key (Updated)',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc_group2a_general_knowledge_key_2016_updated.pdf`,
    size: '600 KB'
  },
  {
    id: 'group2a-tamil-updated',
    title: 'Group 2A General Tamil Key (Updated)',
    subject: 'General Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc_group2a_general_tamil_key_2016_updated.pdf`,
    size: '600 KB'
  },
  {
    id: 'group2a-english-2016',
    title: 'Group 2A General English Key',
    subject: 'General English',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc_group2a_general_english_key_2016.pdf`,
    size: '500 KB'
  },
  
  // Model Tests
  {
    id: 'model-test-1',
    title: 'TNPSC Group 2 Model Test - 1',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-model-test-1-dec-2015.pdf`,
    size: '800 KB'
  },
  {
    id: 'model-test-2',
    title: 'TNPSC Group 2 Model Test - 2',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-model-test-2-dec-2015.pdf`,
    size: '800 KB'
  },
  {
    id: 'mock-test-3',
    title: 'EFFORT TNPSC Mock Test - 3',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/effort-tnpsc-mock-test-3-dec-2015.pdf`,
    size: '700 KB'
  },
  {
    id: 'model-6th-tamil',
    title: 'Model Test (6th Tamil & Sanga Kalam)',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-model-test-6th-tamil-sanga-kalam.pdf`,
    size: '600 KB'
  },
  
  // VAO Model Tests
  {
    id: 'vao-model-1',
    title: 'VAO Model Test - 1',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'VAO',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-vao-model-test-part-1.pdf`,
    size: '600 KB'
  },
  {
    id: 'vao-model-2',
    title: 'VAO Model Test - 2',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'VAO',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-vao-model-test-part-2.pdf`,
    size: '600 KB'
  },
  
  // Important Questions
  {
    id: 'tamil-1000-qa',
    title: 'Tamil 1000 Model Questions & Answers',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-tamil-1000-model-questions-and-answers.pdf`,
    size: '3 MB'
  },
  {
    id: 'tamil-2000-qa',
    title: 'Tamil 6-12th Std 2000 Questions & Answers',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-tamil-6-12-th-std-2000-questions-and-answers.pdf`,
    size: '4 MB'
  },
  {
    id: 'tamil-important-1',
    title: 'Important Tamil Questions Part-1',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/important-tamil-questions-and-answers-part-1.pdf`,
    size: '1 MB'
  },
  {
    id: 'tamil-important-2',
    title: 'Important Tamil Questions Part-2',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/important-tamil-questions-and-answers-part-2.pdf`,
    size: '1 MB'
  },
  {
    id: 'tamil-ilakiya-1',
    title: 'தமிழ் இலக்கிய வினாக்கள் Part-1',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/file-1.pdf`,
    size: '800 KB'
  },
  {
    id: 'tamil-ilakiya-2',
    title: 'தமிழ் இலக்கிய வினாக்கள் Part-2',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/file-2.pdf`,
    size: '800 KB'
  },
  {
    id: 'group2-tamil-3',
    title: 'Group-2 General Tamil Important Materials Part-3',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc-group-2-general-tamil-important-study-materials-part-3.pdf`,
    size: '1.2 MB'
  },
  {
    id: 'group2-tamil-b-2',
    title: 'Group-2-B Tamil Materials Part-2',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc-group-2-b-tamil-part-2.pdf`,
    size: '1 MB'
  },
  {
    id: 'group2-vi-tamil',
    title: 'Group-II Important Questions (VI Tamil Part-1)',
    subject: 'Tamil',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2',
    year: '2016',
    pdfUrl: `${BASE_URL}/tnpsc-group-ii-important-questions-with-answers-vi-tamil-part-1.pdf`,
    size: '900 KB'
  },
  
  // Current Affairs
  {
    id: 'ca-nov-2015',
    title: 'Current Affairs November 2015',
    subject: 'Current Affairs',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-current-affairs-november-2015.pdf`,
    size: '1 MB'
  },
  {
    id: 'ca-oct-2015',
    title: 'Current Affairs October 2015',
    subject: 'Current Affairs',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-current-affairs-october-2015.pdf`,
    size: '1 MB'
  },
  {
    id: 'ca-sep-2015',
    title: 'Current Affairs September 2015',
    subject: 'Current Affairs',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-current-affairs-september-2015.pdf`,
    size: '1 MB'
  },
  {
    id: 'ca-qa-dec-2015',
    title: 'Current Affairs Questions & Answers Dec 2015',
    subject: 'Current Affairs',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-current-affairs-questions-and-answers.pdf`,
    size: '700 KB'
  },
  {
    id: 'ca-group2a',
    title: 'Group 2A Current Affairs',
    subject: 'Current Affairs',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2016',
    pdfUrl: `${BASE_URL}/current-affairs-group-2a.pdf`,
    size: '800 KB'
  },
  {
    id: 'ca-nov-test',
    title: 'Current Affairs November 2015 Test - ARIVU TNPSC',
    subject: 'Current Affairs',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/current-affairs-november-test-arivu-tnpsc-dec-2015.pdf`,
    size: '600 KB'
  },
  
  // Model Questions
  {
    id: 'model-qa-nov',
    title: 'Model Questions & Answers Nov 2015',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC',
    year: '2015',
    pdfUrl: `${BASE_URL}/tnpsc-model-questions-and-answers_nov_15.pdf`,
    size: '700 KB'
  },
  
  // Recommended Books
  {
    id: 'recommended-books',
    title: 'Recommended Books for Group IIA',
    subject: 'General Studies',
    category: 'PREVIOUS_YEAR',
    exam: 'TNPSC Group 2A',
    year: '2015',
    pdfUrl: `${BASE_URL}/recommended-books-for-group-iia.pdf`,
    size: '300 KB'
  }
];

// Get all materials combined
export const getAllMaterials = () => {
  return [...studyMaterials, ...previousYearQuestions];
};

// Get study materials (books)
export const getStudyMaterials = (subject = 'All') => {
  if (subject === 'All') return studyMaterials;
  return studyMaterials.filter(m => 
    m.subject.toLowerCase().includes(subject.toLowerCase())
  );
};

// Get previous year questions
export const getPreviousYearQuestions = (subject = 'All') => {
  if (subject === 'All') return previousYearQuestions;
  return previousYearQuestions.filter(q => 
    q.subject.toLowerCase().includes(subject.toLowerCase())
  );
};

// Get materials by category
export const getMaterialsByCategory = (category, subject = 'All') => {
  if (category === 'BOOK') {
    return getStudyMaterials(subject);
  } else if (category === 'PREVIOUS_YEAR') {
    return getPreviousYearQuestions(subject);
  }
  return getAllMaterials();
};

// Get material by ID
export const getMaterialById = (id) => {
  return getAllMaterials().find(m => m.id === id);
};

// Get unique subjects
export const getSubjects = () => {
  const allMaterials = getAllMaterials();
  const subjects = [...new Set(allMaterials.map(m => m.subject))];
  return ['All', ...subjects.sort()];
};

// Get unique exams
export const getExams = () => {
  const allMaterials = getAllMaterials();
  const exams = [...new Set(allMaterials.map(m => m.exam))];
  return ['All', ...exams.sort()];
};

export default {
  studyMaterials,
  previousYearQuestions,
  getAllMaterials,
  getStudyMaterials,
  getPreviousYearQuestions,
  getMaterialsByCategory,
  getMaterialById,
  getSubjects,
  getExams
};
