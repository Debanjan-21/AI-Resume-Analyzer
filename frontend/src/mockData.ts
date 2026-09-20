import { SampleProfile, AnalysisResult } from './types';

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: 'backend-eng',
    role: 'Senior Backend Engineer (Python & FastAPI)',
    company: 'Fintech Cloud Corp',
    experienceLevel: '5+ years',
    resumeText: `ALEXANDER WRIGHT
San Francisco, CA | (415) 555-0192 | alex.wright@email.com | linkedin.com/in/alexwright | github.com/alexwright

PROFESSIONAL SUMMARY
Results-driven Backend Engineer with 5+ years of experience building high-throughput distributed microservices using Python, FastAPI, and MongoDB. Specialized in REST & GraphQL API architecture, database performance tuning, and scalable cloud deployments.

TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, SQL
- Frameworks & Libs: FastAPI, Flask, Pydantic, SQLAlchemy, Celery, React
- Databases: MongoDB, PostgreSQL, Redis, Elasticsearch
- Cloud & DevOps: Docker, AWS (ECS, S3, RDS), Git, CI/CD GitHub Actions, Linux
- Core Competencies: RESTful APIs, Microservices, AsyncIO, Database Indexing, Unit Testing (PyTest)

WORK EXPERIENCE
Senior Software Engineer | Apex Financial Systems | July 2022 – Present
- Architected and deployed a real-time transaction processing microservice using Python, FastAPI, and MongoDB, handling 14,000+ requests/sec with sub-45ms P99 latency.
- Refactored MongoDB aggregation pipelines and compound indexes, decreasing query execution times by 58% and slashing server memory consumption by 32%.
- Built asynchronous job workers with Celery and Redis to process background statement exports, reducing API response blocking by 80%.
- Mentored 4 junior engineers on clean code practices, automated PyTest suites, and test coverage standards maintaining 92% coverage.

Software Engineer | Streamline Media Labs | Jan 2020 – June 2022
- Developed core RESTful endpoints using Flask and PostgreSQL for a multi-tenant content delivery platform serving 500,000 monthly active users.
- Automated Docker container builds and CI/CD pipelines via GitHub Actions, decreasing release cycle from 3 days to under 25 minutes.
- Integrated JWT authentication and role-based access control (RBAC) ensuring compliance with SOC2 standards.

EDUCATION
Bachelor of Science in Computer Science
University of California, Davis | Graduated 2019`,
    jobDescription: `Position: Senior Backend Engineer (Python / FastAPI)
Company: Fintech Cloud Corp
Location: Remote (US)

About the Role:
We are seeking an experienced Senior Backend Engineer to lead development of our core financial ledger engine. You will design, build, and maintain scalable microservices using Python, FastAPI, and MongoDB/PostgreSQL.

Key Responsibilities:
- Design and implement high-performance, fault-tolerant REST and asynchronous APIs using FastAPI and Python 3.11+.
- Build data schemas and optimize queries across MongoDB and PostgreSQL.
- Implement caching strategies with Redis to handle sudden traffic surges.
- Deploy containerized services with Docker and Kubernetes on AWS.
- Collaborate with frontend teams building React dashboards.
- Ensure rigorous test automation with PyTest and maintain CI/CD pipelines.

Qualifications:
- 4+ years of professional backend development with Python.
- Proven experience with FastAPI or modern asynchronous Python frameworks (AsyncIO).
- Strong hands-on database experience with MongoDB and relational databases like PostgreSQL.
- Experience with Docker, Kubernetes, and AWS cloud infrastructure.
- Familiarity with event-driven architecture (Kafka or RabbitMQ is a plus).
- Deep understanding of API security, OAuth2, and database optimization.`
  },
  {
    id: 'ai-ml-eng',
    role: 'AI / Machine Learning Engineer',
    company: 'Cognitive AI Labs',
    experienceLevel: '3+ years',
    resumeText: `PRIYA SHARMA
New York, NY | priya.sharma@tech.dev | github.com/priyasharma-ai

SUMMARY
AI Engineer specializing in Natural Language Processing (NLP), Large Language Model orchestration, and vector retrieval pipelines. Experienced with LangChain, PyTorch, FastAPI microservices, and Pinecone vector databases.

SKILLS
- AI/ML: PyTorch, Transformers (Hugging Face), LangChain, RAG, OpenAI API, SpaCy
- Backend: Python, FastAPI, Docker, PostgreSQL, ChromaDB, FastAPI
- Tools: Weights & Biases, MLflow, AWS Bedrock, Git

EXPERIENCE
Machine Learning Engineer | NovaSearch Inc | 2023 - Present
- Built enterprise Retrieval-Augmented Generation (RAG) system utilizing LangChain, Hugging Face transformers, and vector embeddings, improving search answer accuracy from 64% to 91%.
- Deployed FastAPI inference endpoints on AWS ECS with auto-scaling, serving 2M+ monthly queries.
- Fine-tuned BERT-based classification models for sentiment analysis, achieving 94.2% F1 score.

Data Science Associate | DataSphere | 2021 - 2023
- Built predictive customer churn pipelines using Scikit-Learn and XGBoost.
- Automated data validation using Pydantic and Great Expectations.`,
    jobDescription: `Senior AI Engineer (LLMs & RAG)
Cognitive AI Labs

We are looking for an AI Engineer to drive our core Generative AI and vector search platform.
Requirements:
- Strong programming skills in Python with FastAPI or Flask backend experience.
- Deep hands-on experience with LLMs, Prompt Engineering, LangChain, and RAG architectures.
- Experience with Vector Databases (Pinecone, Chroma, Milvus, or Qdrant).
- Experience deploying ML models to production with Docker, Kubernetes, and cloud providers (AWS/GCP).`
  },
  {
    id: 'fullstack-dev',
    role: 'Full-Stack Developer (React & Node/Python)',
    company: 'NextGen SaaS',
    experienceLevel: '4 years',
    resumeText: `DAVID CHEN
Austin, TX | david.chen@inbox.io | linkedin.com/in/dchen-dev

SUMMARY
Versatile Full-Stack Developer with 4 years of experience building modern web applications using React, TypeScript, Tailwind CSS, Python FastAPI, and MongoDB.

SKILLS
- Frontend: React 18, TypeScript, Tailwind CSS, Next.js, Redux Toolkit
- Backend: Python (FastAPI), Node.js, Express, MongoDB, RESTful APIs
- DevOps: Docker, Vercel, AWS S3, GitHub Actions

WORK EXPERIENCE
Full-Stack Developer | CloudCanvas | 2022 - Present
- Developed interactive web applications using React, TypeScript, and Tailwind CSS.
- Designed RESTful API endpoints in FastAPI with MongoDB to manage user documents and authorization.
- Reduced initial page load times by 40% using code splitting, memoization, and server-state caching.`,
    jobDescription: `Full-Stack Software Engineer
NextGen SaaS

We are looking for a Full-Stack Engineer skilled in modern React frontends and Python/FastAPI backends.
Requirements:
- 3+ years experience with React, TypeScript, and Tailwind CSS.
- Strong Python backend experience (FastAPI or Django) with MongoDB or PostgreSQL.
- Ability to design clean UI/UX for complex analytical dashboards.`
  }
];

export const INITIAL_ANALYSIS: AnalysisResult = {
  id: 'scan-1',
  timestamp: new Date().toISOString(),
  candidateName: 'Alexander Wright',
  targetRole: 'Senior Backend Engineer (Python / FastAPI)',
  targetCompany: 'Fintech Cloud Corp',
  overallScore: 88,
  grade: 'A',
  verdict: 'Strong ATS Match. Your backend competencies (FastAPI, MongoDB, Python) align closely with this role. A few high-priority keywords (Kubernetes, Kafka) will boost you to the top 5% of applicants.',
  metrics: {
    atsScore: 88,
    keywordMatch: 82,
    impactQuantification: 94,
    readabilityScore: 90,
    brevityScore: 86
  },
  recruiterImpression: {
    firstGlanceSummary: 'Immediate confirmation of high-throughput backend scale (14k req/sec, sub-45ms latency) and modern stack mastery (FastAPI + MongoDB + Redis). Highly legible layout and clean hierarchy.',
    estimatedReadTimeSeconds: 6,
    topStrengths: [
      'Exceptional quantification of business impact (58% query optimization, 80% reduced blocking).',
      'Direct tech stack alignment with core job specifications (Python, FastAPI, MongoDB, Docker, AWS).',
      'Clean single-page ATS-friendly formatting with standard standard section headers.'
    ],
    criticalRedFlags: [
      'Missing explicit mention of Kubernetes orchestration, which is prioritized in the job requirements.',
      'No mention of messaging queues (Kafka / RabbitMQ) or event-driven architecture.',
      'Certifications section is omitted; adding AWS or Python certifications would strengthen credibility.'
    ]
  },
  keywords: {
    matchPercentage: 82,
    matched: [
      { name: 'Python', category: 'technical', found: true, frequency: 5, importance: 'high' },
      { name: 'FastAPI', category: 'technical', found: true, frequency: 4, importance: 'high' },
      { name: 'MongoDB', category: 'technical', found: true, frequency: 4, importance: 'high' },
      { name: 'PostgreSQL', category: 'technical', found: true, frequency: 2, importance: 'high' },
      { name: 'Docker', category: 'tools', found: true, frequency: 2, importance: 'high' },
      { name: 'Redis', category: 'technical', found: true, frequency: 2, importance: 'high' },
      { name: 'AWS', category: 'tools', found: true, frequency: 2, importance: 'medium' },
      { name: 'RESTful APIs', category: 'technical', found: true, frequency: 3, importance: 'high' },
      { name: 'Microservices', category: 'technical', found: true, frequency: 2, importance: 'high' },
      { name: 'PyTest', category: 'tools', found: true, frequency: 2, importance: 'medium' },
      { name: 'CI/CD', category: 'tools', found: true, frequency: 2, importance: 'medium' },
      { name: 'React', category: 'technical', found: true, frequency: 1, importance: 'low' }
    ],
    missing: [
      { name: 'Kubernetes (K8s)', category: 'tools', found: false, importance: 'high' },
      { name: 'Event-Driven / Kafka', category: 'technical', found: false, importance: 'high' },
      { name: 'OAuth2 / Security', category: 'technical', found: false, importance: 'medium' },
      { name: 'System Design', category: 'domain', found: false, importance: 'medium' }
    ]
  },
  bulletPoints: [
    {
      id: 'bp-1',
      original: 'Developed core RESTful endpoints using Flask and PostgreSQL for a multi-tenant content delivery platform.',
      improved: 'Architected 18+ high-availability RESTful microservices using Flask and PostgreSQL, boosting multi-tenant platform throughput by 35% for 500k monthly active users.',
      scoreBefore: 62,
      scoreAfter: 95,
      critique: 'Lacks quantifiable scale, active verbs, and specific business impact metrics.',
      improvementsApplied: [
        'Added quantifiable volume ("18+ high-availability microservices")',
        'Introduced direct performance outcome ("boosting throughput by 35%")',
        'Enhanced action verb ("Architected" instead of "Developed")'
      ]
    },
    {
      id: 'bp-2',
      original: 'Mentored junior engineers on clean code practices and automated PyTest suites.',
      improved: 'Coached 4 junior engineers in Test-Driven Development (TDD) and CI testing with PyTest, elevating team test coverage to 92% and cutting production bug escapes by 40%.',
      scoreBefore: 55,
      scoreAfter: 92,
      critique: 'Sounds passive and does not quantify the outcome of the mentorship.',
      improvementsApplied: [
        'Quantified team size ("4 junior engineers")',
        'Specified technical methodology ("Test-Driven Development (TDD)")',
        'Demonstrated verifiable business outcome ("cutting production bug escapes by 40%")'
      ]
    },
    {
      id: 'bp-3',
      original: 'Integrated JWT authentication and role-based access control (RBAC).',
      improved: 'Engineered zero-trust JWT authentication and granular RBAC across 30+ endpoints, achieving full SOC2 compliance audit readiness with zero reported security vulnerabilities.',
      scoreBefore: 58,
      scoreAfter: 94,
      critique: 'Very brief statement that leaves recruiters guessing about the security standards achieved.',
      improvementsApplied: [
        'Aligned with enterprise standard ("SOC2 compliance audit readiness")',
        'Framed as zero-trust architecture',
        'Added measurable security outcome ("zero reported security vulnerabilities")'
      ]
    }
  ],
  sectionAudits: [
    {
      section: 'Contact & Header',
      status: 'excellent',
      score: 100,
      findings: ['Professional email present', 'Phone number formatted correctly', 'LinkedIn & GitHub profiles included'],
      recommendation: 'Perfect. ATS parsers easily extracted all 4 primary communication channels.'
    },
    {
      section: 'Professional Summary',
      status: 'excellent',
      score: 95,
      findings: ['Concise (under 4 lines)', 'Highlights years of experience (5+)', 'Includes top target technologies'],
      recommendation: 'Strong elevator pitch. Mention target company domain if applying for specific financial roles.'
    },
    {
      section: 'Work Experience',
      status: 'excellent',
      score: 92,
      findings: ['Reverse chronological order', 'Consistent date formats', 'Strong quantified metrics in bullet points'],
      recommendation: 'Add 1 bullet on distributed event queues or Kubernetes container scaling to match the JD.'
    },
    {
      section: 'Skills Section',
      status: 'warning',
      score: 75,
      findings: ['Great categorization (Languages, Frameworks, DBs)', 'Missing Kubernetes and Kafka/RabbitMQ keywords'],
      recommendation: 'Add "Kubernetes" and "Event-Driven Architecture (Kafka/RabbitMQ)" to Technical Skills.'
    },
    {
      section: 'Education & Certifications',
      status: 'warning',
      score: 80,
      findings: ['Degree, University, and Graduation year clear', 'No cloud or industry certifications listed'],
      recommendation: 'Consider adding any AWS Certified Developer or MongoDB certifications if available.'
    }
  ],
  recommendations: {
    suggestedRoles: [
      {
        title: 'Full-Stack Software Engineer',
        matchScore: 95,
        reason: 'Demonstrates deep end-to-end fluency connecting high-throughput Python backends with interactive React frontend interfaces.',
        suitableSkills: ['Python', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'RESTful APIs']
      },
      {
        title: 'Backend Systems & API Engineer',
        matchScore: 92,
        reason: 'Extensive track record building low-latency microservices (14k req/sec), async workers, and optimized database indexing.',
        suitableSkills: ['Python', 'FastAPI', 'AsyncIO', 'MongoDB', 'Redis', 'Microservices']
      },
      {
        title: 'Cloud Infrastructure & DevOps Engineer',
        matchScore: 88,
        reason: 'Strong foundation in Docker containerization, automated CI/CD pipelines, and cloud database optimization.',
        suitableSkills: ['Docker', 'CI/CD GitHub Actions', 'AWS ECS/S3', 'Linux', 'Database Tuning']
      },
      {
        title: 'Distributed Systems Developer',
        matchScore: 86,
        reason: 'Practical experience with asynchronous task queues, caching strategies, and event streaming architectures.',
        suitableSkills: ['AsyncIO', 'Celery', 'Redis', 'Aggregation Pipelines', 'Microservices']
      }
    ],
    recommendedSkills: [
      {
        skill: 'Docker & Container Orchestration',
        category: 'Cloud / DevOps',
        importance: 'high',
        reason: 'Industry standard for packaging, shipping, and running microservices reproducibly across development and production.',
        forRoles: ['Full-Stack Software Engineer', 'Backend Systems & API Engineer', 'Cloud Infrastructure & DevOps Engineer']
      },
      {
        skill: 'Redis & Distributed Caching',
        category: 'System Architecture',
        importance: 'high',
        reason: 'Accelerates API latency and handles high-throughput session state in modern distributed environments.',
        forRoles: ['Backend Systems & API Engineer', 'Distributed Systems Developer']
      },
      {
        skill: 'Kubernetes & Helm',
        category: 'Cloud Computing',
        importance: 'high',
        reason: 'Essential for container orchestration, zero-downtime rolling deploys, and automated horizontal scaling.',
        forRoles: ['Cloud Infrastructure & DevOps Engineer', 'Backend Systems & API Engineer']
      },
      {
        skill: 'Kafka / RabbitMQ Event Streaming',
        category: 'System Architecture',
        importance: 'medium',
        reason: 'Enables asynchronous decoupling, event-driven microservices, and reliable high-scale messaging.',
        forRoles: ['Distributed Systems Developer', 'Backend Systems & API Engineer']
      },
      {
        skill: 'System Design & Scalability Patterns',
        category: 'Architecture',
        importance: 'high',
        reason: 'Required to design fault-tolerant distributed platforms and succeed in senior engineering interviews.',
        forRoles: ['Full-Stack Software Engineer', 'Backend Systems & API Engineer']
      }
    ]
  },
  rawResumeText: '',
  rawJobDescription: ''
};
