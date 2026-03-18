require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // force Google DNS
const TechQuestion = require('../models/TechQuestion');

const questions = [
  // ── JAVASCRIPT / REACT (8) ──────────────────────────────────
  { category: 'JavaScript', subcategory: 'Closures', difficulty: 'Medium',
    question: 'What is a closure in JavaScript? Give a real use case.',
    tags: ['closure', 'scope', 'functions'] },
  { category: 'JavaScript', subcategory: 'Event Loop', difficulty: 'Hard',
    question: 'Explain the JavaScript event loop. What is the difference between the call stack, microtask queue, and macrotask queue?',
    tags: ['event loop', 'async', 'concurrency'] },
  { category: 'JavaScript', subcategory: 'Hoisting', difficulty: 'Easy',
    question: 'What is hoisting? How does it differ between var, let, and function declarations?',
    tags: ['hoisting', 'var', 'let', 'const'] },
  { category: 'JavaScript', subcategory: 'Promises', difficulty: 'Medium',
    question: 'What is the difference between Promise.all, Promise.allSettled, Promise.race, and Promise.any?',
    tags: ['promises', 'async', 'concurrency'] },
  { category: 'React', subcategory: 'Hooks', difficulty: 'Medium',
    question: 'When does useEffect run? Explain the difference between no deps array, empty deps array, and a populated deps array.',
    tags: ['useEffect', 'hooks', 'lifecycle'] },
  { category: 'React', subcategory: 'Performance', difficulty: 'Medium',
    question: 'What is the difference between useMemo and useCallback? When would you use each?',
    tags: ['useMemo', 'useCallback', 'performance'] },
  { category: 'React', subcategory: 'Reconciliation', difficulty: 'Hard',
    question: "How does React's reconciliation algorithm work? What role do keys play?",
    tags: ['virtual DOM', 'reconciliation', 'keys', 'diffing'] },
  { category: 'React', subcategory: 'Virtual DOM', difficulty: 'Easy',
    question: 'What is the Virtual DOM and how does it improve performance over direct DOM manipulation?',
    tags: ['virtual DOM', 'performance', 'rendering'] },

  // ── NODE.JS / BACKEND (8) ───────────────────────────────────
  { category: 'Node.js', subcategory: 'Event Loop', difficulty: 'Hard',
    question: 'How does the Node.js event loop differ from the browser event loop? What are libuv and the thread pool?',
    tags: ['event loop', 'libuv', 'async', 'Node.js'] },
  { category: 'Node.js', subcategory: 'Streams', difficulty: 'Medium',
    question: 'What are Node.js streams? What is the difference between readable, writable, and transform streams?',
    tags: ['streams', 'Node.js', 'buffers'] },
  { category: 'Backend', subcategory: 'API Design', difficulty: 'Medium',
    question: 'What is the difference between REST and GraphQL? When would you choose one over the other?',
    tags: ['REST', 'GraphQL', 'API design'] },
  { category: 'Backend', subcategory: 'Auth', difficulty: 'Medium',
    question: 'What is the difference between JWT and session-based authentication? What are the trade-offs?',
    tags: ['JWT', 'sessions', 'auth', 'stateless'] },
  { category: 'Backend', subcategory: 'Database', difficulty: 'Medium',
    question: 'What is the N+1 problem in database queries? How do you solve it?',
    tags: ['N+1', 'ORM', 'database', 'queries'] },
  { category: 'Backend', subcategory: 'Database', difficulty: 'Medium',
    question: 'What is database indexing? What types of indexes exist and when would you use each?',
    tags: ['indexing', 'database', 'performance'] },
  { category: 'Backend', subcategory: 'Web', difficulty: 'Easy',
    question: 'What is CORS and why does it exist? How do you configure it in Express?',
    tags: ['CORS', 'HTTP', 'security', 'Express'] },
  { category: 'Backend', subcategory: 'Express', difficulty: 'Easy',
    question: 'What is middleware in Express? How does the middleware chain work with next()?',
    tags: ['middleware', 'Express', 'Node.js'] },

  // ── SYSTEM DESIGN (8) ───────────────────────────────────────
  { category: 'System Design', subcategory: 'Scaling', difficulty: 'Easy',
    question: 'What is the difference between horizontal and vertical scaling? When would you use each?',
    tags: ['scaling', 'distributed systems', 'infrastructure'] },
  { category: 'System Design', subcategory: 'Distributed Systems', difficulty: 'Hard',
    question: 'Explain the CAP theorem. Can you give an example of a CP system and an AP system?',
    tags: ['CAP theorem', 'consistency', 'availability', 'partition tolerance'] },
  { category: 'System Design', subcategory: 'Infrastructure', difficulty: 'Medium',
    question: 'What is a load balancer? What are the different load balancing algorithms?',
    tags: ['load balancing', 'infrastructure', 'scaling'] },
  { category: 'System Design', subcategory: 'Performance', difficulty: 'Medium',
    question: 'What are caching strategies? Explain cache-aside, write-through, and write-behind.',
    tags: ['caching', 'Redis', 'performance'] },
  { category: 'System Design', subcategory: 'Infrastructure', difficulty: 'Easy',
    question: 'What is a CDN and how does it work? When should you use one?',
    tags: ['CDN', 'performance', 'infrastructure'] },
  { category: 'System Design', subcategory: 'Database', difficulty: 'Hard',
    question: 'What is database sharding? What are the different sharding strategies and their trade-offs?',
    tags: ['sharding', 'database', 'distributed systems'] },
  { category: 'System Design', subcategory: 'API Design', difficulty: 'Medium',
    question: 'What is rate limiting? What algorithms are used to implement it (token bucket, leaky bucket, sliding window)?',
    tags: ['rate limiting', 'API', 'security'] },
  { category: 'System Design', subcategory: 'Async', difficulty: 'Hard',
    question: 'What are message queues? What problems do they solve and when would you use Kafka vs RabbitMQ?',
    tags: ['message queues', 'Kafka', 'async', 'microservices'] },

  // ── CS FUNDAMENTALS (8) ─────────────────────────────────────
  { category: 'CS Fundamentals', subcategory: 'OS', difficulty: 'Medium',
    question: 'What is the difference between a process and a thread? What is a race condition?',
    tags: ['processes', 'threads', 'concurrency', 'OS'] },
  { category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Medium',
    question: 'What is the difference between TCP and UDP? When would you use UDP over TCP?',
    tags: ['TCP', 'UDP', 'networking', 'protocols'] },
  { category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Medium',
    question: 'What happens when you type a URL in the browser and press enter? Walk me through the full request lifecycle.',
    tags: ['DNS', 'HTTP', 'networking', 'browser'] },
  { category: 'CS Fundamentals', subcategory: 'Database', difficulty: 'Easy',
    question: 'What is the difference between SQL and NoSQL databases? When would you choose MongoDB over PostgreSQL?',
    tags: ['SQL', 'NoSQL', 'MongoDB', 'PostgreSQL'] },
  { category: 'CS Fundamentals', subcategory: 'Database', difficulty: 'Hard',
    question: 'What is the difference between a clustered index and a non-clustered index?',
    tags: ['indexing', 'database', 'performance'] },
  { category: 'CS Fundamentals', subcategory: 'OS', difficulty: 'Hard',
    question: 'What is virtual memory and how does paging work?',
    tags: ['virtual memory', 'paging', 'OS'] },
  { category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Easy',
    question: 'What is the difference between HTTP and HTTPS? How does TLS work at a high level?',
    tags: ['HTTP', 'HTTPS', 'TLS', 'security'] },
  { category: 'CS Fundamentals', subcategory: 'API', difficulty: 'Medium',
    question: 'What are the 6 REST principles (constraints)? What makes an API truly RESTful?',
    tags: ['REST', 'API design', 'HTTP'] },

  // ── BEHAVIORAL (8) ──────────────────────────────────────────
  { category: 'Behavioral', subcategory: 'Introduction', difficulty: 'Easy',
    question: 'Tell me about yourself.',
    tags: ['intro', 'STAR', 'behavioral'] },
  { category: 'Behavioral', subcategory: 'Conflict', difficulty: 'Medium',
    question: 'Tell me about a time you had a conflict with a teammate. How did you resolve it?',
    tags: ['conflict', 'teamwork', 'STAR'] },
  { category: 'Behavioral', subcategory: 'Failure', difficulty: 'Medium',
    question: 'What is your biggest professional failure? What did you learn from it?',
    tags: ['failure', 'growth', 'STAR'] },
  { category: 'Behavioral', subcategory: 'Motivation', difficulty: 'Easy',
    question: 'Why do you want to work at this company specifically?',
    tags: ['motivation', 'research', 'culture fit'] },
  { category: 'Behavioral', subcategory: 'Leadership', difficulty: 'Medium',
    question: 'Describe a time you took initiative or led a project without being asked.',
    tags: ['leadership', 'initiative', 'STAR'] },
  { category: 'Behavioral', subcategory: 'Strengths', difficulty: 'Easy',
    question: 'What are your greatest strengths and weaknesses?',
    tags: ['self-awareness', 'strengths', 'weaknesses'] },
  { category: 'Behavioral', subcategory: 'Goals', difficulty: 'Easy',
    question: 'Where do you see yourself in 5 years?',
    tags: ['goals', 'career', 'growth'] },
  { category: 'Behavioral', subcategory: 'STAR Method', difficulty: 'Medium',
    question: 'Give an example of a time you had to meet a tight deadline. What did you do?',
    tags: ['STAR', 'pressure', 'time management'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    await TechQuestion.deleteMany({});
    console.log('🗑️  Cleared existing tech questions');
    await TechQuestion.insertMany(questions);
    console.log(`✅ Seeded ${questions.length} tech questions`);

    const counts = await TechQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n📊 Questions by category:');
    counts.forEach(c => console.log(`   ${c._id}: ${c.count}`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();