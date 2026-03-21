// server/scripts/seedTech.js
// 120 tech interview questions across 7 categories

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dns from 'dns';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import TechQuestion from '../models/TechQuestion.js';

const questions = [

  // ══════════════════════════════════════════════════════
  // JAVASCRIPT (20 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'JavaScript', subcategory: 'Closures', difficulty: 'Medium',
    question: 'What is a closure in JavaScript? Give a real-world use case.',
    tags: ['closure', 'scope', 'functions'],
  },
  {
    category: 'JavaScript', subcategory: 'Event Loop', difficulty: 'Hard',
    question: 'Explain the JavaScript event loop. What is the difference between the call stack, microtask queue, and macrotask queue?',
    tags: ['event loop', 'async', 'concurrency'],
  },
  {
    category: 'JavaScript', subcategory: 'Hoisting', difficulty: 'Easy',
    question: 'What is hoisting? How does it differ between var, let, const, and function declarations?',
    tags: ['hoisting', 'var', 'let', 'const'],
  },
  {
    category: 'JavaScript', subcategory: 'Promises', difficulty: 'Medium',
    question: 'What is the difference between Promise.all, Promise.allSettled, Promise.race, and Promise.any?',
    tags: ['promises', 'async', 'concurrency'],
  },
  {
    category: 'JavaScript', subcategory: 'Prototypes', difficulty: 'Hard',
    question: 'Explain prototypal inheritance in JavaScript. How does the prototype chain work?',
    tags: ['prototype', 'inheritance', 'OOP'],
  },
  {
    category: 'JavaScript', subcategory: 'This', difficulty: 'Hard',
    question: 'Explain how "this" works in JavaScript. How does it behave differently in arrow functions vs regular functions?',
    tags: ['this', 'binding', 'arrow functions'],
  },
  {
    category: 'JavaScript', subcategory: 'Memory', difficulty: 'Medium',
    question: 'What is a memory leak in JavaScript? Name three common causes and how to prevent them.',
    tags: ['memory leak', 'garbage collection', 'performance'],
  },
  {
    category: 'JavaScript', subcategory: 'ES6+', difficulty: 'Easy',
    question: 'What are generators in JavaScript? How do they differ from async/await?',
    tags: ['generators', 'iterators', 'async'],
  },
  {
    category: 'JavaScript', subcategory: 'Scope', difficulty: 'Medium',
    question: 'What is the difference between var, let, and const in terms of scope, hoisting, and reassignment?',
    tags: ['scope', 'var', 'let', 'const'],
  },
  {
    category: 'JavaScript', subcategory: 'Async', difficulty: 'Medium',
    question: 'What is the difference between synchronous and asynchronous code in JavaScript? Explain with callback, promise, and async/await examples.',
    tags: ['async', 'callbacks', 'promises'],
  },
  {
    category: 'JavaScript', subcategory: 'Types', difficulty: 'Easy',
    question: 'What is the difference between == and ===? When would you use each?',
    tags: ['equality', 'coercion', 'types'],
  },
  {
    category: 'JavaScript', subcategory: 'Functional', difficulty: 'Medium',
    question: 'Explain map, filter, and reduce. Write an example using all three on the same array.',
    tags: ['map', 'filter', 'reduce', 'functional'],
  },
  {
    category: 'JavaScript', subcategory: 'Patterns', difficulty: 'Medium',
    question: 'What is debouncing and throttling? Write a simple debounce function from scratch.',
    tags: ['debounce', 'throttle', 'performance'],
  },
  {
    category: 'JavaScript', subcategory: 'Modules', difficulty: 'Easy',
    question: 'What is the difference between CommonJS (require) and ES Modules (import/export)?',
    tags: ['modules', 'CommonJS', 'ESM'],
  },
  {
    category: 'JavaScript', subcategory: 'Immutability', difficulty: 'Medium',
    question: 'What is the difference between deep copy and shallow copy? How would you deep clone an object in JavaScript?',
    tags: ['clone', 'deep copy', 'shallow copy'],
  },
  {
    category: 'JavaScript', subcategory: 'WeakMap', difficulty: 'Hard',
    question: 'What is WeakMap and WeakSet? When would you use them over Map and Set?',
    tags: ['WeakMap', 'WeakSet', 'memory'],
  },
  {
    category: 'JavaScript', subcategory: 'Proxy', difficulty: 'Hard',
    question: 'What is the Proxy object in JavaScript? Give a practical use case.',
    tags: ['Proxy', 'Reflect', 'meta-programming'],
  },
  {
    category: 'JavaScript', subcategory: 'Error Handling', difficulty: 'Medium',
    question: 'How does error handling work in async/await code? What happens if you forget to try/catch?',
    tags: ['error handling', 'try/catch', 'async'],
  },
  {
    category: 'JavaScript', subcategory: 'Currying', difficulty: 'Medium',
    question: 'What is currying? Write a curried version of a function that adds three numbers.',
    tags: ['currying', 'partial application', 'functional'],
  },
  {
    category: 'JavaScript', subcategory: 'Event Delegation', difficulty: 'Medium',
    question: 'What is event delegation and why is it useful? How does event bubbling and capturing work?',
    tags: ['event delegation', 'bubbling', 'DOM'],
  },

  // ══════════════════════════════════════════════════════
  // REACT (20 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'React', subcategory: 'Hooks', difficulty: 'Medium',
    question: 'When does useEffect run? Explain the difference between no deps array, empty deps array, and populated deps array.',
    tags: ['useEffect', 'hooks', 'lifecycle'],
  },
  {
    category: 'React', subcategory: 'Performance', difficulty: 'Medium',
    question: 'What is the difference between useMemo and useCallback? When would you use each?',
    tags: ['useMemo', 'useCallback', 'performance'],
  },
  {
    category: 'React', subcategory: 'Reconciliation', difficulty: 'Hard',
    question: "How does React's reconciliation algorithm (diffing) work? What role do keys play?",
    tags: ['virtual DOM', 'reconciliation', 'keys'],
  },
  {
    category: 'React', subcategory: 'Virtual DOM', difficulty: 'Easy',
    question: 'What is the Virtual DOM and how does it improve performance over direct DOM manipulation?',
    tags: ['virtual DOM', 'performance'],
  },
  {
    category: 'React', subcategory: 'State', difficulty: 'Medium',
    question: 'What is the difference between useState and useReducer? When would you choose useReducer?',
    tags: ['useState', 'useReducer', 'state management'],
  },
  {
    category: 'React', subcategory: 'Context', difficulty: 'Medium',
    question: 'What is the React Context API? What are its limitations and when should you use Redux instead?',
    tags: ['context', 'state management', 'Redux'],
  },
  {
    category: 'React', subcategory: 'Refs', difficulty: 'Medium',
    question: 'What is useRef? Name three use cases where you would use a ref instead of state.',
    tags: ['useRef', 'refs', 'DOM'],
  },
  {
    category: 'React', subcategory: 'Lifecycle', difficulty: 'Medium',
    question: 'How do React class component lifecycle methods map to hooks? (componentDidMount, componentDidUpdate, componentWillUnmount)',
    tags: ['lifecycle', 'hooks', 'class components'],
  },
  {
    category: 'React', subcategory: 'Patterns', difficulty: 'Hard',
    question: 'What are compound components? Explain the pattern with an example.',
    tags: ['compound components', 'patterns', 'design'],
  },
  {
    category: 'React', subcategory: 'Performance', difficulty: 'Hard',
    question: 'What is React.memo? How does it differ from PureComponent? When does it NOT help?',
    tags: ['React.memo', 'PureComponent', 'optimization'],
  },
  {
    category: 'React', subcategory: 'Rendering', difficulty: 'Hard',
    question: 'What causes unnecessary re-renders in React? List 4 ways to prevent them.',
    tags: ['re-renders', 'optimization', 'performance'],
  },
  {
    category: 'React', subcategory: 'Custom Hooks', difficulty: 'Medium',
    question: 'What are custom hooks? Write a custom useFetch hook that handles loading, error, and data states.',
    tags: ['custom hooks', 'hooks', 'patterns'],
  },
  {
    category: 'React', subcategory: 'Error Boundaries', difficulty: 'Medium',
    question: 'What are error boundaries in React? What kinds of errors do they NOT catch?',
    tags: ['error boundaries', 'error handling'],
  },
  {
    category: 'React', subcategory: 'Portals', difficulty: 'Medium',
    question: 'What are React portals? When would you use one? Give an example use case.',
    tags: ['portals', 'DOM', 'modals'],
  },
  {
    category: 'React', subcategory: 'Suspense', difficulty: 'Hard',
    question: 'What is React Suspense? How does it work with lazy loading and data fetching?',
    tags: ['Suspense', 'lazy loading', 'code splitting'],
  },
  {
    category: 'React', subcategory: 'Forms', difficulty: 'Easy',
    question: 'What is the difference between controlled and uncontrolled components in React forms?',
    tags: ['controlled', 'uncontrolled', 'forms'],
  },
  {
    category: 'React', subcategory: 'Patterns', difficulty: 'Medium',
    question: 'What is prop drilling? What are the solutions to avoid it?',
    tags: ['prop drilling', 'context', 'state management'],
  },
  {
    category: 'React', subcategory: 'Concurrent', difficulty: 'Hard',
    question: 'What is React 18 Concurrent Mode? What problems does it solve? What is useTransition?',
    tags: ['concurrent mode', 'useTransition', 'React 18'],
  },
  {
    category: 'React', subcategory: 'Testing', difficulty: 'Medium',
    question: 'How do you test React components? What is the difference between shallow rendering and full mounting?',
    tags: ['testing', 'React Testing Library', 'Jest'],
  },
  {
    category: 'React', subcategory: 'Server Components', difficulty: 'Hard',
    question: 'What are React Server Components? How do they differ from traditional SSR?',
    tags: ['server components', 'SSR', 'Next.js'],
  },

  // ══════════════════════════════════════════════════════
  // NODE.JS (15 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'Node.js', subcategory: 'Event Loop', difficulty: 'Hard',
    question: 'How does the Node.js event loop differ from the browser event loop? What are libuv and the thread pool?',
    tags: ['event loop', 'libuv', 'async'],
  },
  {
    category: 'Node.js', subcategory: 'Streams', difficulty: 'Medium',
    question: 'What are Node.js streams? Explain the difference between readable, writable, duplex, and transform streams.',
    tags: ['streams', 'piping', 'backpressure'],
  },
  {
    category: 'Node.js', subcategory: 'Cluster', difficulty: 'Hard',
    question: 'What is the Node.js cluster module? How does it help utilize multi-core CPUs?',
    tags: ['cluster', 'multi-core', 'scaling'],
  },
  {
    category: 'Node.js', subcategory: 'Modules', difficulty: 'Easy',
    question: 'How does the Node.js module system work? What is the difference between require() and dynamic import()?',
    tags: ['modules', 'require', 'CommonJS'],
  },
  {
    category: 'Node.js', subcategory: 'Error Handling', difficulty: 'Medium',
    question: 'What is the difference between operational errors and programmer errors in Node.js? How should each be handled?',
    tags: ['error handling', 'process', 'crashes'],
  },
  {
    category: 'Node.js', subcategory: 'Performance', difficulty: 'Medium',
    question: 'What is backpressure in Node.js streams? How do you handle it?',
    tags: ['backpressure', 'streams', 'performance'],
  },
  {
    category: 'Node.js', subcategory: 'Security', difficulty: 'Medium',
    question: 'What are the most common security vulnerabilities in Node.js applications? How do you prevent them?',
    tags: ['security', 'OWASP', 'injection'],
  },
  {
    category: 'Node.js', subcategory: 'Worker Threads', difficulty: 'Hard',
    question: 'What are Worker Threads in Node.js? When would you use them vs child_process?',
    tags: ['worker threads', 'child_process', 'CPU-bound'],
  },
  {
    category: 'Node.js', subcategory: 'Middleware', difficulty: 'Easy',
    question: 'What is middleware in Express? Explain the request-response cycle and how next() works.',
    tags: ['middleware', 'Express', 'next'],
  },
  {
    category: 'Node.js', subcategory: 'Buffer', difficulty: 'Medium',
    question: 'What is a Buffer in Node.js? When would you need to use it?',
    tags: ['Buffer', 'binary data', 'streams'],
  },
  {
    category: 'Node.js', subcategory: 'Process', difficulty: 'Medium',
    question: 'What is process.nextTick()? How does it differ from setImmediate() and setTimeout()?',
    tags: ['process.nextTick', 'setImmediate', 'event loop'],
  },
  {
    category: 'Node.js', subcategory: 'Memory', difficulty: 'Hard',
    question: 'How does garbage collection work in V8/Node.js? What tools would you use to diagnose a memory leak?',
    tags: ['garbage collection', 'V8', 'memory leak'],
  },
  {
    category: 'Node.js', subcategory: 'Authentication', difficulty: 'Medium',
    question: 'How would you implement JWT authentication in a Node.js/Express API? What are the security considerations?',
    tags: ['JWT', 'authentication', 'security'],
  },
  {
    category: 'Node.js', subcategory: 'Testing', difficulty: 'Medium',
    question: 'How do you write unit tests for Node.js APIs? What is the difference between unit, integration, and e2e tests?',
    tags: ['testing', 'Jest', 'supertest'],
  },
  {
    category: 'Node.js', subcategory: 'Performance', difficulty: 'Hard',
    question: 'How would you profile and optimize a slow Node.js API endpoint?',
    tags: ['profiling', 'optimization', 'performance'],
  },

  // ══════════════════════════════════════════════════════
  // BACKEND (20 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'Backend', subcategory: 'API Design', difficulty: 'Medium',
    question: 'What is the difference between REST and GraphQL? When would you choose one over the other?',
    tags: ['REST', 'GraphQL', 'API design'],
  },
  {
    category: 'Backend', subcategory: 'Auth', difficulty: 'Medium',
    question: 'What is the difference between JWT and session-based authentication? What are the trade-offs?',
    tags: ['JWT', 'sessions', 'authentication'],
  },
  {
    category: 'Backend', subcategory: 'Database', difficulty: 'Medium',
    question: 'What is the N+1 problem in database queries? How do you detect and solve it?',
    tags: ['N+1', 'ORM', 'database'],
  },
  {
    category: 'Backend', subcategory: 'Database', difficulty: 'Medium',
    question: 'What is database indexing? Explain B-tree vs hash indexes and when to use each.',
    tags: ['indexing', 'B-tree', 'database'],
  },
  {
    category: 'Backend', subcategory: 'Web', difficulty: 'Easy',
    question: 'What is CORS and why does it exist? How do you configure it in Express?',
    tags: ['CORS', 'HTTP', 'security'],
  },
  {
    category: 'Backend', subcategory: 'Database', difficulty: 'Hard',
    question: 'What are database transactions? Explain ACID properties with real examples.',
    tags: ['transactions', 'ACID', 'database'],
  },
  {
    category: 'Backend', subcategory: 'Caching', difficulty: 'Medium',
    question: 'What is Redis? Name 5 practical use cases for Redis in a backend application.',
    tags: ['Redis', 'caching', 'performance'],
  },
  {
    category: 'Backend', subcategory: 'Microservices', difficulty: 'Hard',
    question: 'What is the difference between monolithic and microservices architecture? What problems do microservices introduce?',
    tags: ['microservices', 'monolith', 'architecture'],
  },
  {
    category: 'Backend', subcategory: 'API Design', difficulty: 'Medium',
    question: 'What makes an API versioning strategy good? Compare URL versioning, header versioning, and query param versioning.',
    tags: ['versioning', 'API design', 'REST'],
  },
  {
    category: 'Backend', subcategory: 'Rate Limiting', difficulty: 'Medium',
    question: 'How would you implement rate limiting in an API? Compare token bucket, leaky bucket, and sliding window algorithms.',
    tags: ['rate limiting', 'throttling', 'security'],
  },
  {
    category: 'Backend', subcategory: 'WebSockets', difficulty: 'Medium',
    question: 'When would you use WebSockets instead of HTTP? What are Server-Sent Events (SSE) and how do they compare?',
    tags: ['WebSockets', 'SSE', 'real-time'],
  },
  {
    category: 'Backend', subcategory: 'Database', difficulty: 'Hard',
    question: 'What is database normalization? Explain 1NF, 2NF, 3NF. When would you intentionally denormalize?',
    tags: ['normalization', 'SQL', 'database design'],
  },
  {
    category: 'Backend', subcategory: 'Testing', difficulty: 'Medium',
    question: 'What is contract testing? How does it differ from integration testing in a microservices environment?',
    tags: ['contract testing', 'Pact', 'microservices'],
  },
  {
    category: 'Backend', subcategory: 'Queues', difficulty: 'Medium',
    question: 'What is a message queue? What problems does it solve? When would you use Bull/BullMQ in Node.js?',
    tags: ['message queue', 'Bull', 'async processing'],
  },
  {
    category: 'Backend', subcategory: 'Security', difficulty: 'Hard',
    question: 'How would you securely store passwords in a database? What is bcrypt and why is it preferred over SHA256?',
    tags: ['bcrypt', 'password hashing', 'security'],
  },
  {
    category: 'Backend', subcategory: 'Database', difficulty: 'Medium',
    question: 'What is the difference between optimistic and pessimistic locking? When would you use each?',
    tags: ['locking', 'concurrency', 'database'],
  },
  {
    category: 'Backend', subcategory: 'API Design', difficulty: 'Easy',
    question: 'What HTTP status codes should your API return? Walk through 200, 201, 400, 401, 403, 404, 409, 422, 429, 500.',
    tags: ['HTTP status codes', 'REST', 'API design'],
  },
  {
    category: 'Backend', subcategory: 'Logging', difficulty: 'Medium',
    question: 'What is structured logging? What should you log in a production API? What should you never log?',
    tags: ['logging', 'observability', 'production'],
  },
  {
    category: 'Backend', subcategory: 'File Upload', difficulty: 'Medium',
    question: 'How would you handle large file uploads in a Node.js API? What are the considerations for streaming vs buffering?',
    tags: ['file upload', 'multipart', 'streams'],
  },
  {
    category: 'Backend', subcategory: 'GraphQL', difficulty: 'Hard',
    question: 'What is the N+1 problem in GraphQL? How does DataLoader solve it?',
    tags: ['GraphQL', 'DataLoader', 'N+1'],
  },

  // ══════════════════════════════════════════════════════
  // SYSTEM DESIGN (20 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'System Design', subcategory: 'Scaling', difficulty: 'Easy',
    question: 'What is the difference between horizontal and vertical scaling? When does horizontal scaling become necessary?',
    tags: ['scaling', 'horizontal', 'vertical'],
  },
  {
    category: 'System Design', subcategory: 'CAP', difficulty: 'Hard',
    question: 'Explain the CAP theorem. Give real-world examples of CP systems and AP systems.',
    tags: ['CAP theorem', 'consistency', 'availability'],
  },
  {
    category: 'System Design', subcategory: 'Load Balancing', difficulty: 'Medium',
    question: 'What is a load balancer? Compare round-robin, least connections, and consistent hashing algorithms.',
    tags: ['load balancing', 'algorithms', 'infrastructure'],
  },
  {
    category: 'System Design', subcategory: 'Caching', difficulty: 'Medium',
    question: 'What are caching strategies? Explain cache-aside, read-through, write-through, and write-behind.',
    tags: ['caching', 'Redis', 'CDN'],
  },
  {
    category: 'System Design', subcategory: 'CDN', difficulty: 'Easy',
    question: 'What is a CDN and how does it work? When would you use one? What are edge locations?',
    tags: ['CDN', 'edge', 'performance'],
  },
  {
    category: 'System Design', subcategory: 'Sharding', difficulty: 'Hard',
    question: 'What is database sharding? Compare range-based, hash-based, and directory-based sharding strategies.',
    tags: ['sharding', 'partitioning', 'database'],
  },
  {
    category: 'System Design', subcategory: 'Rate Limiting', difficulty: 'Medium',
    question: 'How would you design a rate limiter for an API that handles 1 million requests per second?',
    tags: ['rate limiting', 'distributed systems', 'Redis'],
  },
  {
    category: 'System Design', subcategory: 'Message Queues', difficulty: 'Hard',
    question: 'What are message queues? When would you use Kafka vs RabbitMQ vs SQS?',
    tags: ['Kafka', 'RabbitMQ', 'event streaming'],
  },
  {
    category: 'System Design', subcategory: 'Real-time', difficulty: 'Hard',
    question: 'How would you design a real-time chat system like WhatsApp? What are the key components?',
    tags: ['WebSockets', 'pub/sub', 'real-time'],
  },
  {
    category: 'System Design', subcategory: 'URL Shortener', difficulty: 'Medium',
    question: 'Design a URL shortener like bit.ly. How would you handle 100M URLs and 10B redirects per day?',
    tags: ['URL shortener', 'hashing', 'scale'],
  },
  {
    category: 'System Design', subcategory: 'Consistency', difficulty: 'Hard',
    question: 'What is eventual consistency? How does it differ from strong consistency? Give examples of each.',
    tags: ['consistency', 'distributed systems', 'trade-offs'],
  },
  {
    category: 'System Design', subcategory: 'Search', difficulty: 'Hard',
    question: 'How would you design a full-text search system? What is an inverted index and how does Elasticsearch use it?',
    tags: ['search', 'Elasticsearch', 'inverted index'],
  },
  {
    category: 'System Design', subcategory: 'Circuit Breaker', difficulty: 'Medium',
    question: 'What is the circuit breaker pattern? How does it prevent cascading failures in distributed systems?',
    tags: ['circuit breaker', 'resilience', 'microservices'],
  },
  {
    category: 'System Design', subcategory: 'Storage', difficulty: 'Medium',
    question: 'What is the difference between object storage (S3), block storage (EBS), and file storage (EFS)? When do you use each?',
    tags: ['S3', 'EBS', 'storage'],
  },
  {
    category: 'System Design', subcategory: 'Idempotency', difficulty: 'Medium',
    question: 'What is idempotency? Why is it important in distributed systems and payment processing?',
    tags: ['idempotency', 'distributed systems', 'payments'],
  },
  {
    category: 'System Design', subcategory: 'Notification', difficulty: 'Medium',
    question: 'Design a notification system that supports push, email, and SMS for 100M users. How do you handle delivery guarantees?',
    tags: ['notifications', 'push', 'reliability'],
  },
  {
    category: 'System Design', subcategory: 'Two Phase Commit', difficulty: 'Hard',
    question: 'What is the two-phase commit protocol (2PC)? What are its limitations? What is SAGA pattern?',
    tags: ['2PC', 'SAGA', 'distributed transactions'],
  },
  {
    category: 'System Design', subcategory: 'API Gateway', difficulty: 'Medium',
    question: 'What is an API Gateway? What responsibilities should it have vs individual services?',
    tags: ['API gateway', 'microservices', 'architecture'],
  },
  {
    category: 'System Design', subcategory: 'Twitter', difficulty: 'Hard',
    question: 'How would you design Twitter\'s home timeline? How do you handle fan-out for users with 10M followers?',
    tags: ['fan-out', 'timeline', 'social media'],
  },
  {
    category: 'System Design', subcategory: 'Monitoring', difficulty: 'Medium',
    question: 'What is the difference between metrics, logs, and traces (the observability triangle)? Name a tool for each.',
    tags: ['observability', 'metrics', 'tracing'],
  },

  // ══════════════════════════════════════════════════════
  // CS FUNDAMENTALS (15 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'CS Fundamentals', subcategory: 'OS', difficulty: 'Medium',
    question: 'What is the difference between a process and a thread? What is a race condition and how do you prevent it?',
    tags: ['processes', 'threads', 'concurrency'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Medium',
    question: 'What is the difference between TCP and UDP? When would you choose UDP despite its unreliability?',
    tags: ['TCP', 'UDP', 'networking'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Medium',
    question: 'Walk me through what happens step-by-step when you type "https://google.com" and press Enter.',
    tags: ['DNS', 'HTTP', 'TLS', 'networking'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Database', difficulty: 'Easy',
    question: 'What is the difference between SQL and NoSQL? When would you choose MongoDB over PostgreSQL?',
    tags: ['SQL', 'NoSQL', 'MongoDB', 'PostgreSQL'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Easy',
    question: 'What is the difference between HTTP/1.1, HTTP/2, and HTTP/3? What improvements does each version bring?',
    tags: ['HTTP', 'HTTP/2', 'HTTP/3'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Security', difficulty: 'Medium',
    question: 'What is TLS/SSL? Explain the TLS handshake process and what symmetric/asymmetric encryption is used.',
    tags: ['TLS', 'SSL', 'encryption'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'OS', difficulty: 'Medium',
    question: 'What is a deadlock? What are the four conditions required for a deadlock to occur (Coffman conditions)?',
    tags: ['deadlock', 'OS', 'concurrency'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Memory', difficulty: 'Medium',
    question: 'What is the difference between the stack and the heap? What is stack overflow?',
    tags: ['stack', 'heap', 'memory'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Medium',
    question: 'What is the difference between a cookie, local storage, and session storage? When would you use each?',
    tags: ['cookies', 'localStorage', 'sessionStorage'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Security', difficulty: 'Medium',
    question: 'What is XSS (Cross-Site Scripting)? What is CSRF (Cross-Site Request Forgery)? How do you prevent each?',
    tags: ['XSS', 'CSRF', 'security'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'API', difficulty: 'Medium',
    question: 'What are the 6 REST constraints? What makes an API truly RESTful vs just JSON over HTTP?',
    tags: ['REST', 'constraints', 'API design'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'OS', difficulty: 'Hard',
    question: 'What is virtual memory? What is a page fault and how does the OS handle it?',
    tags: ['virtual memory', 'paging', 'OS'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Networking', difficulty: 'Easy',
    question: 'What is the difference between IPv4 and IPv6? What is NAT and why was it invented?',
    tags: ['IPv4', 'IPv6', 'NAT'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Hashing', difficulty: 'Medium',
    question: 'What is consistent hashing? Why is it used in distributed systems like distributed caches?',
    tags: ['consistent hashing', 'distributed systems', 'load balancing'],
  },
  {
    category: 'CS Fundamentals', subcategory: 'Encoding', difficulty: 'Easy',
    question: 'What is the difference between encoding, encryption, and hashing? Give a real example of each.',
    tags: ['encoding', 'encryption', 'hashing'],
  },

  // ══════════════════════════════════════════════════════
  // BEHAVIORAL (10 questions)
  // ══════════════════════════════════════════════════════
  {
    category: 'Behavioral', subcategory: 'Introduction', difficulty: 'Easy',
    question: 'Tell me about yourself. Walk me through your background and what brings you here today.',
    tags: ['intro', 'STAR', 'narrative'],
  },
  {
    category: 'Behavioral', subcategory: 'Conflict', difficulty: 'Medium',
    question: 'Tell me about a time you had a significant disagreement with a teammate or manager. How did you resolve it?',
    tags: ['conflict', 'teamwork', 'communication'],
  },
  {
    category: 'Behavioral', subcategory: 'Failure', difficulty: 'Medium',
    question: 'What is your biggest professional failure or mistake? What did you learn and how did it change you?',
    tags: ['failure', 'growth', 'self-awareness'],
  },
  {
    category: 'Behavioral', subcategory: 'Leadership', difficulty: 'Medium',
    question: 'Describe a time you took initiative on a project that wasn\'t strictly your responsibility. What was the outcome?',
    tags: ['leadership', 'initiative', 'impact'],
  },
  {
    category: 'Behavioral', subcategory: 'Ambiguity', difficulty: 'Medium',
    question: 'Tell me about a time you had to make an important decision with incomplete information. How did you approach it?',
    tags: ['ambiguity', 'decision making', 'risk'],
  },
  {
    category: 'Behavioral', subcategory: 'Technical Influence', difficulty: 'Medium',
    question: 'Tell me about a time you influenced a technical decision at your company. How did you get buy-in?',
    tags: ['influence', 'technical leadership', 'stakeholders'],
  },
  {
    category: 'Behavioral', subcategory: 'Pressure', difficulty: 'Medium',
    question: 'Describe a time you had to deliver something under extreme time pressure. How did you prioritize?',
    tags: ['pressure', 'prioritization', 'delivery'],
  },
  {
    category: 'Behavioral', subcategory: 'Growth', difficulty: 'Easy',
    question: 'What is a technical skill you\'ve taught yourself in the past year? How did you approach learning it?',
    tags: ['growth', 'learning', 'self-improvement'],
  },
  {
    category: 'Behavioral', subcategory: 'Feedback', difficulty: 'Easy',
    question: 'Tell me about a time you received critical feedback. How did you respond and what did you do with it?',
    tags: ['feedback', 'growth', 'self-awareness'],
  },
  {
    category: 'Behavioral', subcategory: 'Impact', difficulty: 'Medium',
    question: 'What is the most impactful project you\'ve worked on? How did you measure its success?',
    tags: ['impact', 'metrics', 'product sense'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    await TechQuestion.deleteMany({});
    await TechQuestion.insertMany(questions);
    console.log(`✅ Seeded ${questions.length} tech questions across ${[...new Set(questions.map(q => q.category))].length} categories`);
    console.log('Categories:', [...new Set(questions.map(q => q.category))].join(', '));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();