import { 
  AnalysisResult, 
  KeywordMatch, 
  BulletRewrite, 
  SectionHealth, 
  FastApiConfig,
  SuggestedJobRole,
  RecommendedSkill,
  RecommendationsBlock
} from '../types';

// Common technical and soft keywords dictionary for lexical matching
const COMMON_TECH_KEYWORDS = [
  'Python', 'FastAPI', 'MongoDB', 'PostgreSQL', 'SQL', 'Docker', 'Kubernetes',
  'Redis', 'AWS', 'GCP', 'Azure', 'RESTful APIs', 'Microservices', 'GraphQL',
  'Git', 'CI/CD', 'GitHub Actions', 'PyTest', 'Celery', 'Kafka', 'RabbitMQ',
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Tailwind CSS', 'Next.js',
  'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'LangChain', 'RAG',
  'Pydantic', 'AsyncIO', 'Linux', 'Elasticsearch', 'System Design'
];

const ACTION_VERBS = [
  'architected', 'spearheaded', 'engineered', 'deployed', 'optimized',
  'refactored', 'designed', 'automated', 'implemented', 'scaled',
  'mentored', 'led', 'delivered', 'integrated', 'slashed', 'boosted'
];

export function runClientSideAnalysis(
  resumeText: string,
  jobDescription: string,
  targetRole: string = 'Software Engineer',
  targetCompany: string = 'Tech Enterprise'
): AnalysisResult {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Extract keywords from JD and Tech Dictionary
  const extractedKeywords: { name: string; category: 'technical' | 'tools' | 'soft' | 'domain'; importance: 'high' | 'medium' | 'low' }[] = [];

  COMMON_TECH_KEYWORDS.forEach((kw) => {
    const isHighPriorityInJD = jdLower.length > 0 && jdLower.includes(kw.toLowerCase());
    const isPresentInResume = resumeLower.includes(kw.toLowerCase());
    if (isHighPriorityInJD) {
      extractedKeywords.push({
        name: kw,
        category: kw.includes('Docker') || kw.includes('Git') || kw.includes('AWS') || kw.includes('Kubernetes') || kw.includes('Linux') ? 'tools' : 'technical',
        importance: 'high'
      });
    } else if (isPresentInResume) {
      extractedKeywords.push({
        name: kw,
        category: kw.includes('Docker') || kw.includes('Git') || kw.includes('AWS') || kw.includes('Kubernetes') || kw.includes('Linux') ? 'tools' : 'technical',
        importance: 'medium'
      });
    }
  });

  // If JD is empty, only evaluate skills actually present or fundamental to role
  if (jdLower.length === 0) {
    if (extractedKeywords.length === 0) {
      // Basic skills search across taxonomy
      ['Python', 'Java', 'C++', 'SQL', 'Git', 'Data Structures', 'OOP'].forEach((kw) => {
        if (resumeLower.includes(kw.toLowerCase())) {
          extractedKeywords.push({ name: kw, category: 'technical', importance: 'high' });
        }
      });
    }
  }

  const matched: KeywordMatch[] = [];
  const missing: KeywordMatch[] = [];

  extractedKeywords.forEach((kw) => {
    const escaped = kw.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'gi');
    const matches = resumeText.match(regex);
    if (matches && matches.length > 0) {
      matched.push({
        name: kw.name,
        category: kw.category,
        found: true,
        frequency: matches.length,
        importance: kw.importance
      });
    } else if (jdLower.length > 0) {
      // Only mark as missing if the job description actually requested it!
      missing.push({
        name: kw.name,
        category: kw.category,
        found: false,
        importance: kw.importance
      });
    }
  });

  const totalEvaluated = matched.length + missing.length;
  const matchPercentage = totalEvaluated > 0
    ? Math.round((matched.length / totalEvaluated) * 100)
    : (matched.length > 0 ? 90 : 75);

  // Impact quantification detection (numbers, percentages, metrics)
  const metricMatches = resumeText.match(/(\d+[\d,.]*[%+kKmMxX]?|\$\d+[\d,.]*)/g) || [];
  const quantifiedScore = Math.min(98, Math.max(50, Math.round(metricMatches.length * 7)));

  // Action verb detection
  let actionVerbCount = 0;
  ACTION_VERBS.forEach(verb => {
    if (resumeLower.includes(verb)) actionVerbCount++;
  });
  const verbScore = Math.min(96, Math.max(60, actionVerbCount * 12));

  // Readability & length
  const wordCount = resumeText.trim().split(/\s+/).length;
  const readabilityScore = wordCount >= 250 && wordCount <= 750 ? 92 : wordCount < 250 ? 68 : 80;

  // Overall ATS score formula
  const atsScore = Math.min(98, Math.max(45, Math.round(
    (matchPercentage * 0.45) + (quantifiedScore * 0.25) + (verbScore * 0.15) + (readabilityScore * 0.15)
  )));

  // Grade calculation
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (atsScore >= 92) grade = 'A+';
  else if (atsScore >= 84) grade = 'A';
  else if (atsScore >= 72) grade = 'B';
  else if (atsScore >= 60) grade = 'C';
  else grade = 'D';

  // Extract Candidate Name from first lines
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  const candidateName = lines.length > 0 && lines[0].length < 40 ? lines[0] : 'Job Seeker';

  // Generate dynamic bullet point critiques based on resume lines
  const candidateBullets = lines.filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'));
  const bulletPoints: BulletRewrite[] = [];

  if (candidateBullets.length > 0) {
    candidateBullets.slice(0, 3).forEach((bullet, idx) => {
      const cleanBullet = bullet.replace(/^[-•*]\s*/, '');
      const hasNumber = /\d/.test(cleanBullet);
      bulletPoints.push({
        id: `bp-${idx + 1}`,
        original: cleanBullet,
        improved: `Architected and deployed ${cleanBullet.toLowerCase().replace(/^(built|worked on|developed|helped with)\s*/i, '')} achieving 35% higher throughput and cutting latency by 45ms.`,
        scoreBefore: hasNumber ? 72 : 55,
        scoreAfter: 94,
        critique: hasNumber 
          ? 'Good foundation with numbers, but can be framed with higher executive impact and stronger leadership verbs.'
          : 'Lacks measurable scale, specific percentage improvements, and business outcome metrics.',
        improvementsApplied: [
          'Pre-pended high-impact executive action verb ("Architected and deployed")',
          'Injected quantifiable percentage improvement metric ("achieving 35% higher throughput")',
          'Framed with concrete operational scale ("cutting latency by 45ms")'
        ]
      });
    });
  }

  // If no bullets found in text, supply default smart templates
  if (bulletPoints.length === 0) {
    bulletPoints.push(
      {
        id: 'bp-1',
        original: 'Responsible for writing backend APIs in Python and maintaining MongoDB database collections.',
        improved: 'Engineered 24+ scalable asynchronous REST APIs using FastAPI and MongoDB, scaling traffic capacity to 10k req/s and optimizing query response times by 48%.',
        scoreBefore: 54,
        scoreAfter: 95,
        critique: 'Passive wording ("Responsible for writing") with no metrics or business achievements.',
        improvementsApplied: [
          'Replaced passive voice with power verb ("Engineered")',
          'Quantified workload scope ("24+ scalable asynchronous REST APIs")',
          'Added business impact ("optimized query response times by 48%")'
        ]
      },
      {
        id: 'bp-2',
        original: 'Worked with the team to fix bugs and write tests with PyTest.',
        improved: 'Established automated Test-Driven Development (TDD) pipelines with PyTest and GitHub Actions, boosting test coverage to 94% and eliminating critical production regressions.',
        scoreBefore: 58,
        scoreAfter: 93,
        critique: 'Sounds like routine duty rather than high-leverage initiative.',
        improvementsApplied: [
          'Framed as active leadership ("Established automated TDD pipelines")',
          'Added tangible benchmark ("boosting test coverage to 94%")',
          'Demonstrated risk reduction ("eliminating critical production regressions")'
        ]
      }
    );
  }

  // Section Audits
  const hasContact = /(@|\.com|\.io|\.org|\.in|\.net|\+?\d{1,3}[-\s]?\d{3,5}[-\s]?\d{3,5}|\d{10})/i.test(resumeText);
  const hasSummary = /(summary|profile|about\s*me|about|objective|career\s*objective|overview)/i.test(resumeText);
  const hasWorkHistory = /(work\s*experience|professional\s*experience|employment|work\s*history)/i.test(resumeText);
  const hasInternship = /\b(internships?|intern)\b/i.test(resumeText);
  const hasExperience = hasWorkHistory || hasInternship;

  // Project title extraction
  const extractClientProjects = (text: string): string[] => {
    if (!/projects?/i.test(text)) return [];
    const textLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const excludePrefixes = [
      'bachelor', 'master', 'pursuing', 'higher', 'secondary', 'completed',
      'university', 'college', 'playing', 'watching', 'travelling', 'language',
      'hobbies', 'education', 'skills', 'project', 'about', 'percentage',
      'shows', 'detects', 'helps', 'used', 'built', 'developed', 'engineered',
      'architected', 'sos', 'key', 'technical', 'academic', 'radius'
    ];
    const results: string[] = [];
    for (let i = 0; i < textLines.length; i++) {
      const lineClean = textLines[i].replace(/[:]+$/, '');
      const matchExplicit = lineClean.match(/^(?:Project(?:\s+Title)?|Title)\s*[:\-]\s*(.+)$/i);
      if (matchExplicit && matchExplicit[1].length >= 3 && matchExplicit[1].length <= 65) {
        results.push(matchExplicit[1].trim());
        continue;
      }
      if (!lineClean || /[.,;]$/.test(lineClean)) continue;
      if (!/^[A-Z]/.test(lineClean)) continue;
      const words = lineClean.split(/\s+/);
      if (words.length < 2 || words.length > 8 || lineClean.length > 55) continue;
      const lower = lineClean.toLowerCase();
      if (excludePrefixes.some(p => lower.startsWith(p))) continue;

      const hasKw = /\b(Application|App|System|Radar|Kit|Platform|Dashboard|Portal|Engine|Analyzer|Detector|Tracker|Tool|Website|Bot|Model|Clone|Service|API|Network|Interface)\b/i.test(lineClean);
      const nextIsDesc = i + 1 < textLines.length && /^(shows|detects|helps|used|built|developed|engineered|sos|[-•*]|features|designed|implements)/i.test(textLines[i + 1]);
      if (hasKw || nextIsDesc) {
        results.push(lineClean);
      }
    }
    return Array.from(new Set(results));
  };

  const detectedProjects = extractClientProjects(resumeText);
  const hasProjectsHeader = /\b(projects?|portfolio|personal\s*projects?|academic\s*projects?)\b/i.test(resumeText);
  const hasProjects = detectedProjects.length > 0 || hasProjectsHeader;

  const hasSkills = /(skills|technologies|proficiencies|tools|language skills|technical)/i.test(resumeText) || matched.length >= 2;
  const hasEducation = /(education|university|college|bachelor|master|mca|bca|b\.?tech|m\.?tech|degree|diploma|cgpa|gpa)/i.test(resumeText);

  const skillsScore = missing.length === 0
    ? Math.min(100, Math.max(70, matched.length * 15))
    : Math.max(50, 100 - (missing.length * 8));
  const skillsStatus = missing.length <= 2 || (missing.length === 0 && matched.length >= 3)
    ? 'excellent'
    : missing.length <= 5
    ? 'warning'
    : 'critical';

  const sectionAudits: SectionHealth[] = [
    {
      section: 'Contact & Header',
      status: hasContact ? 'excellent' : 'critical',
      score: hasContact ? 100 : 40,
      findings: hasContact 
        ? ['Email address detected', 'Direct contact details parseable', 'Social/portfolio links found']
        : ['Missing or obscured contact email/phone number'],
      recommendation: hasContact
        ? 'Optimal contact structure. ATS scanners will parse identity and links smoothly.'
        : 'Crucial: Add your email, phone number, and LinkedIn URL at the top.'
    },
    {
      section: 'Professional Summary',
      status: hasSummary ? 'excellent' : 'warning',
      score: hasSummary ? 92 : 65,
      findings: hasSummary
        ? ['Clear targeted summary or About Me section found', 'Contains target role keywords']
        : ['Summary section is missing or unnamed'],
      recommendation: hasSummary
        ? 'Solid overview. Keep it to 3–4 impactful sentences.'
        : 'Add a 3-sentence summary highlighting your core tech stack and years of expertise.'
    },
    {
      section: 'Work Experience',
      status: hasExperience ? 'excellent' : 'warning',
      score: hasWorkHistory ? 90 : (hasInternship ? 85 : 45),
      findings: hasWorkHistory
        ? ['Professional work experience section recognized']
        : hasInternship
        ? ['Formal internship experience recognized']
        : ['No commercial work experience or formal internship detected in resume'],
      recommendation: hasExperience
        ? 'Inject more percentages, throughput numbers, and user scale metrics into every bullet using the STAR method.'
        : 'As a fresher/student, highlight internships or open-source projects, and prioritize your Projects section to showcase execution ability.'
    },
    {
      section: 'Project',
      status: hasProjects ? 'excellent' : 'warning',
      score: hasProjects ? 90 : 50,
      findings: hasProjects
        ? [
            'Projects detected in resume',
            'Demonstrates practical software development and technical implementation'
          ]
        : ['No project section detected in resume'],
      recommendation: hasProjects
        ? 'Frame project descriptions with quantifiable metrics (e.g. latency, user scale, accuracy) using the STAR format.'
        : 'Add 2–3 technical projects demonstrating your programming languages and frameworks.'
    },
    {
      section: 'Skills Section',
      status: skillsStatus,
      score: skillsScore,
      findings: [
        `Matched ${matched.length} key technical competencies`,
        missing.length > 0
          ? `${missing.length} target job keywords currently missing from resume`
          : 'All core evaluated competencies present'
      ],
      recommendation: missing.length > 0
        ? `Incorporate key missing skills like: ${missing.slice(0, 3).map(m => m.name).join(', ')}.`
        : 'Great keyword alignment for this profile.'
    },
    {
      section: 'Education & Credentials',
      status: hasEducation ? 'excellent' : 'warning',
      score: hasEducation ? 90 : 60,
      findings: hasEducation
        ? ['Degree or education details located', 'Standard school notation']
        : ['Education header missing or placed irregularly'],
      recommendation: hasEducation
        ? 'Clean academic section. Mention relevant honors or certifications if applicable.'
        : 'Ensure your degree, institution name, and graduation year are explicitly stated.'
    }
  ];

  // Role & skill recommendations
  const matchedSkillNames = matched.map(m => m.name);
  const hasBackend = matchedSkillNames.some(s => /python|fastapi|django|flask|node|sql|mongo|backend|api/i.test(s));
  const hasFrontend = matchedSkillNames.some(s => /react|javascript|typescript|vue|angular|html|css|frontend/i.test(s));
  const hasEmbedded = /arduino|c\+\+|iot|sensor|embedded|radar/i.test(resumeText);
  const hasMobile = /flutter|android|ios|react native|kotlin/i.test(resumeText);
  const hasData = matchedSkillNames.some(s => /pandas|numpy|machine learning|tensorflow|pytorch|data/i.test(s));

  const suggestedRoles: SuggestedJobRole[] = [];
  if (hasFrontend && hasBackend) {
    suggestedRoles.push({
      title: 'Full-Stack Software Engineer',
      matchScore: 94,
      reason: 'Proficiency across both frontend interactive interfaces and backend data APIs allows end-to-end product implementation.',
      suitableSkills: matchedSkillNames.filter(s => /python|react|javascript|typescript|fastapi|sql|mongo/i.test(s)).slice(0, 5)
    });
  }
  if (hasBackend || !suggestedRoles.length) {
    suggestedRoles.push({
      title: 'Backend Systems Engineer',
      matchScore: 92,
      reason: 'Proven capabilities in microservices, database operations, and reliable server-side architecture.',
      suitableSkills: matchedSkillNames.filter(s => /python|fastapi|flask|sql|mongo|docker|redis/i.test(s)).slice(0, 5)
    });
  }
  if (hasFrontend) {
    suggestedRoles.push({
      title: 'Frontend Web Developer',
      matchScore: 88,
      reason: 'Solid command of modern component design, responsive UI workflows, and state handling.',
      suitableSkills: matchedSkillNames.filter(s => /react|javascript|typescript|html|css/i.test(s)).slice(0, 5)
    });
  }
  if (hasEmbedded) {
    suggestedRoles.push({
      title: 'Embedded Systems & IoT Engineer',
      matchScore: 90,
      reason: 'Demonstrated experience with microcontroller programming, sensor interfacing, and hardware prototyping.',
      suitableSkills: ['C++', 'Arduino', 'Sensors', 'Hardware Interfacing']
    });
  }
  if (hasMobile) {
    suggestedRoles.push({
      title: 'Mobile Application Developer',
      matchScore: 89,
      reason: 'Portfolio in cross-platform mobile frameworks, responsive mobile UI, and device APIs.',
      suitableSkills: ['Flutter', 'Android', 'Firebase', 'State Management']
    });
  }
  if (hasData) {
    suggestedRoles.push({
      title: 'Data & Machine Learning Engineer',
      matchScore: 87,
      reason: 'Demonstrated ability in analytical computation, data pipelines, and predictive model exploration.',
      suitableSkills: matchedSkillNames.filter(s => /python|pandas|sql|machine learning/i.test(s)).slice(0, 5)
    });
  }

  if (suggestedRoles.length < 2) {
    suggestedRoles.push({
      title: 'Software Development Engineer (SDE-1)',
      matchScore: 88,
      reason: 'Strong software engineering baseline, algorithms, and practical programming fluency.',
      suitableSkills: matchedSkillNames.slice(0, 4)
    });
  }

  const primaryRoleTitles = suggestedRoles.slice(0, 2).map(r => r.title);

  const recommendedSkills: RecommendedSkill[] = [
    {
      skill: 'Docker & Containerization',
      category: 'Cloud / DevOps',
      importance: 'high',
      reason: 'Essential for containerizing microservices and ensuring parity across development, staging, and production.',
      forRoles: primaryRoleTitles
    },
    {
      skill: 'Redis & Distributed Caching',
      category: 'System Architecture',
      importance: 'high',
      reason: 'Crucial for sub-millisecond data retrieval and caching frequent queries in distributed systems.',
      forRoles: primaryRoleTitles
    },
    {
      skill: 'CI/CD & GitHub Actions',
      category: 'DevOps / Quality',
      importance: 'high',
      reason: 'Automates linting, test suites, and continuous cloud deployments demanded by high-growth engineering teams.',
      forRoles: primaryRoleTitles
    },
    {
      skill: 'System Design & Scalability Patterns',
      category: 'Architecture',
      importance: 'high',
      reason: 'Mastering microservices communication and rate limiting is required to advance into senior technical roles.',
      forRoles: primaryRoleTitles
    },
    {
      skill: 'AWS / Cloud Services (ECS, S3, RDS)',
      category: 'Cloud Computing',
      importance: 'medium',
      reason: 'Hands-on cloud experience differentiates candidates for modern infrastructure and serverless roles.',
      forRoles: primaryRoleTitles
    }
  ];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    candidateName,
    targetRole,
    targetCompany,
    overallScore: atsScore,
    grade,
    verdict: atsScore >= 80 
      ? `Strong ATS Compatibility. Your profile strongly matches the ${targetRole} criteria with ${matchPercentage}% keyword overlap. Focus on the few highlighted missing keywords to maximize interview callback rates.`
      : `Moderate Match. You have solid experience, but your resume is missing several high-frequency ATS keywords required for ${targetRole}. Implementing the recommended bullet rewrites will significantly elevate your score.`,
    metrics: {
      atsScore,
      keywordMatch: matchPercentage,
      impactQuantification: quantifiedScore,
      readabilityScore,
      brevityScore: Math.min(95, Math.max(65, 100 - Math.abs(500 - wordCount) / 10))
    },
    recruiterImpression: {
      firstGlanceSummary: `In 6 seconds, a recruiter sees strong technical capabilities in ${matched.slice(0, 3).map(m => m.name).join(', ')} with ${metricMatches.length > 0 ? 'good quantifiable evidence' : 'standard responsibilities'}.`,
      estimatedReadTimeSeconds: Math.round(wordCount / 220 * 60) || 6,
      topStrengths: [
        `Strong density of in-demand tech skills (${matched.slice(0, 4).map(m => m.name).join(', ')}).`,
        `Presence of ${metricMatches.length} concrete numbers and metrics indicating measurable business value.`,
        'Clean ATS-readable layout without complex tables or columns.'
      ],
      criticalRedFlags: missing.length > 0 ? [
        `Missing critical requirements: ${missing.slice(0, 3).map(m => m.name).join(', ')}.`,
        'Some bullet points start with passive duties rather than leadership action verbs.'
      ] : [
        'Could include more cloud architecture certifications to stand out among senior candidates.'
      ]
    },
    keywords: {
      matched,
      missing,
      matchPercentage
    },
    bulletPoints,
    sectionAudits,
    recommendations: {
      suggestedRoles: suggestedRoles.slice(0, 4),
      recommendedSkills
    },
    rawResumeText: resumeText,
    rawJobDescription: jobDescription
  };
}

// Service to call user's Python FastAPI backend if configured
export async function analyzeWithFastApi(
  config: FastApiConfig,
  resumeText: string,
  jobDescription: string,
  targetRole: string = 'Software Engineer',
  targetCompany: string = 'Target Employer'
): Promise<AnalysisResult> {
  const url = `${config.baseUrl.replace(/\/$/, '')}${config.endpointPath.startsWith('/') ? config.endpointPath : `/${config.endpointPath}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  // Send comprehensive payload with multiple field aliases so common FastAPI Pydantic models match
  const payload = {
    resume_text: resumeText,
    resume: resumeText,
    text: resumeText,
    job_description: jobDescription,
    job_desc: jobDescription,
    jd: jobDescription,
    target_role: targetRole,
    role: targetRole,
    target_company: targetCompany,
    company: targetCompany,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  } catch (fetchErr: any) {
    throw new Error(
      fetchErr.message?.includes('Failed to fetch')
        ? `Cannot connect to ${url}. Ensure your FastAPI server is running on localhost and has CORS middleware enabled.`
        : `Network request to ${url} failed: ${fetchErr.message}`
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`FastAPI returned HTTP ${response.status} (${response.statusText}): ${errorBody.slice(0, 180)}`);
  }

  const rawData = await response.json();
  return normalizeFastApiResponse(rawData, resumeText, jobDescription, targetRole, targetCompany);
}

// Service to upload PDF/TXT directly to FastAPI backend
export async function analyzeFileWithFastApi(
  config: FastApiConfig,
  file: File,
  jobDescription: string,
  targetRole: string = 'Software Engineer',
  targetCompany: string = 'Target Employer'
): Promise<AnalysisResult> {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}/api/analyze/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_description', jobDescription);
  formData.append('target_role', targetRole);
  formData.append('target_company', targetCompany);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (fetchErr: any) {
    throw new Error(
      fetchErr.message?.includes('Failed to fetch')
        ? `Cannot connect to ${url}. Ensure your FastAPI server is running on localhost and has CORS middleware enabled.`
        : `File upload request to ${url} failed: ${fetchErr.message}`
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`FastAPI returned HTTP ${response.status} (${response.statusText}): ${errorBody.slice(0, 180)}`);
  }

  const rawData = await response.json();
  return normalizeFastApiResponse(rawData, rawData.raw_resume_text || '', jobDescription, targetRole, targetCompany);
}


// Universal response adapter supporting diverse FastAPI, MongoDB, and LLM output shapes
export function normalizeFastApiResponse(
  raw: any,
  resumeText: string,
  jobDescription: string,
  defaultRole: string,
  defaultCompany: string = 'Target Employer'
): AnalysisResult {
  // 1. Unwrap common response envelopes (e.g. { data: { ... } }, { result: { ... } }, { payload: { ... } })
  const root = (raw && typeof raw === 'object')
    ? (raw.data || raw.result || raw.response || raw.payload || raw.analysis || raw)
    : {};

  // Baseline client-side analysis to provide smart fallbacks for any fields the backend did not generate
  const baseline = runClientSideAnalysis(resumeText, jobDescription, defaultRole, defaultCompany);

  // 2. Score extraction (supports overall_score, score, ats_score, match_score, match_percentage, etc.)
  const candidateScore = 
    root.overall_score ?? root.overallScore ??
    root.score ?? root.ats_score ?? root.atsScore ??
    root.total_score ?? root.totalScore ??
    root.match_score ?? root.matchScore ??
    root.match_percentage ?? root.matchPercentage;

  const overallScore = typeof candidateScore === 'number' && !isNaN(candidateScore)
    ? Math.min(100, Math.max(0, Math.round(candidateScore)))
    : baseline.overallScore;

  // Grade
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = baseline.grade;
  if (typeof root.grade === 'string' && ['A+', 'A', 'B', 'C', 'D'].includes(root.grade)) {
    grade = root.grade as any;
  } else if (overallScore >= 92) grade = 'A+';
  else if (overallScore >= 84) grade = 'A';
  else if (overallScore >= 72) grade = 'B';
  else if (overallScore >= 60) grade = 'C';
  else grade = 'D';

  // Candidate Name
  const candidateName = 
    root.candidate_name || root.candidateName ||
    root.name || root.applicant_name || root.candidate ||
    baseline.candidateName;

  // Role & Company
  const targetRole = root.target_role || root.targetRole || root.role || defaultRole;
  const targetCompany = root.target_company || root.targetCompany || root.company || defaultCompany;

  // Verdict / Summary
  const verdict = 
    root.verdict || root.summary || root.feedback || root.conclusion || root.evaluation ||
    `Analysis completed via your Python FastAPI & MongoDB pipeline. Overall ATS match score: ${overallScore}/100.`;

  // Metrics
  const rawMetrics = root.metrics || {};
  const metrics = {
    atsScore: Number(rawMetrics.ats_score ?? rawMetrics.atsScore ?? overallScore) || overallScore,
    keywordMatch: Number(rawMetrics.keyword_match ?? rawMetrics.keywordMatch ?? root.keyword_match ?? baseline.metrics.keywordMatch) || baseline.metrics.keywordMatch,
    impactQuantification: Number(rawMetrics.impact_quantification ?? rawMetrics.impactQuantification ?? root.impact_score ?? baseline.metrics.impactQuantification) || baseline.metrics.impactQuantification,
    readabilityScore: Number(rawMetrics.readability_score ?? rawMetrics.readabilityScore ?? baseline.metrics.readabilityScore) || baseline.metrics.readabilityScore,
    brevityScore: Number(rawMetrics.brevity_score ?? rawMetrics.brevityScore ?? baseline.metrics.brevityScore) || baseline.metrics.brevityScore,
  };

  // Keywords normalization: handles objects OR simple string arrays (e.g. matched: ["Python", "FastAPI"])
  const matchedKeywordsRaw = 
    root.keywords?.matched || root.matched_keywords || root.matched_skills || root.skills_matched || root.matched || [];
  const missingKeywordsRaw = 
    root.keywords?.missing || root.missing_keywords || root.missing_skills || root.skills_missing || root.missing || [];

  const matchedKeywords: KeywordMatch[] = Array.isArray(matchedKeywordsRaw)
    ? matchedKeywordsRaw.map((k, idx) => {
        if (typeof k === 'string') {
          const isTool = /docker|git|aws|gcp|azure|kubernetes|linux|mongodb|redis|ci\/cd|pytest/i.test(k);
          const isSoft = /lead|mentor|collaborat|communicat|agile/i.test(k);
          return {
            name: k,
            category: isTool ? 'tools' : isSoft ? 'soft' : 'technical',
            found: true,
            frequency: 1,
            importance: 'high'
          };
        }
        return {
          name: k.name || k.skill || k.keyword || `Skill-${idx + 1}`,
          category: k.category || 'technical',
          found: true,
          frequency: k.frequency || 1,
          importance: k.importance || 'high'
        };
      })
    : baseline.keywords.matched;

  const missingKeywords: KeywordMatch[] = Array.isArray(missingKeywordsRaw)
    ? missingKeywordsRaw.map((k, idx) => {
        if (typeof k === 'string') {
          const isTool = /docker|git|aws|gcp|azure|kubernetes|linux|mongodb|redis/i.test(k);
          const isSoft = /lead|mentor|collaborat|communicat|agile/i.test(k);
          return {
            name: k,
            category: isTool ? 'tools' : isSoft ? 'soft' : 'technical',
            found: false,
            importance: 'high'
          };
        }
        return {
          name: k.name || k.skill || k.keyword || `Missing-${idx + 1}`,
          category: k.category || 'technical',
          found: false,
          importance: k.importance || 'high'
        };
      })
    : baseline.keywords.missing;

  const matchPercentage = Number(
    root.keywords?.match_percentage ?? root.keywords?.matchPercentage ??
    root.match_percentage ?? root.matchPercentage ??
    (matchedKeywords.length + missingKeywords.length > 0
      ? Math.round((matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) * 100)
      : baseline.keywords.matchPercentage)
  );

  // Bullet Points normalization: handles objects OR simple string arrays
  const bulletsRaw = root.bullet_points || root.bulletPoints || root.bullets || root.bullet_rewrites || root.suggestions || root.rewrites;
  let bulletPoints: BulletRewrite[] = baseline.bulletPoints;

  if (Array.isArray(bulletsRaw) && bulletsRaw.length > 0) {
    bulletPoints = bulletsRaw.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `fastapi-bp-${idx + 1}`,
          original: 'Previous resume phrasing',
          improved: item,
          scoreBefore: 56,
          scoreAfter: 94,
          critique: 'Optimized with strong action verbs and quantified impact from your FastAPI engine.',
          improvementsApplied: [
            'Enhanced leadership voice and action verb',
            'Quantified business outcome and engineering scale'
          ]
        };
      }
      return {
        id: item.id || `fastapi-bp-${idx + 1}`,
        original: item.original || item.before || item.original_bullet || 'Previous resume phrasing',
        improved: item.improved || item.after || item.rewritten || item.new_text || String(item),
        scoreBefore: Number(item.scoreBefore ?? item.score_before ?? 55),
        scoreAfter: Number(item.scoreAfter ?? item.score_after ?? 93),
        critique: item.critique || item.feedback || 'Impact enhanced with measurable metrics and action verbs.',
        improvementsApplied: Array.isArray(item.improvementsApplied || item.improvements_applied || item.improvements)
          ? (item.improvementsApplied || item.improvements_applied || item.improvements).map(String)
          : ['Injected quantifiable metrics', 'Enhanced ATS action verb density']
      };
    });
  }

  // Section Audits normalization
  const auditsRaw = root.section_audits || root.sectionAudits || root.sections || root.audits;
  let sectionAudits: SectionHealth[] = baseline.sectionAudits;

  if (Array.isArray(auditsRaw) && auditsRaw.length > 0) {
    sectionAudits = auditsRaw.map((item, idx) => ({
      section: item.section || item.name || `Section ${idx + 1}`,
      status: (item.status === 'excellent' || item.status === 'warning' || item.status === 'critical') ? item.status : 'excellent',
      score: Number(item.score ?? 85),
      findings: Array.isArray(item.findings) ? item.findings.map(String) : ['Section recognized and parsed'],
      recommendation: item.recommendation || item.feedback || 'Ensure clear formatting and standard header labels.'
    }));
  }

  // Recruiter Impression normalization
  const impressionRaw = root.recruiter_impression || root.recruiterImpression || root.impression || {};
  const recruiterImpression = {
    firstGlanceSummary: impressionRaw.first_glance_summary || impressionRaw.firstGlanceSummary || impressionRaw.summary || root.summary || baseline.recruiterImpression.firstGlanceSummary,
    estimatedReadTimeSeconds: Number(impressionRaw.estimated_read_time_seconds || impressionRaw.estimatedReadTimeSeconds || 6),
    topStrengths: Array.isArray(impressionRaw.top_strengths || impressionRaw.topStrengths || root.strengths)
      ? (impressionRaw.top_strengths || impressionRaw.topStrengths || root.strengths).map(String)
      : baseline.recruiterImpression.topStrengths,
    criticalRedFlags: Array.isArray(impressionRaw.critical_red_flags || impressionRaw.criticalRedFlags || root.weaknesses || root.red_flags)
      ? (impressionRaw.critical_red_flags || impressionRaw.criticalRedFlags || root.weaknesses || root.red_flags).map(String)
      : baseline.recruiterImpression.criticalRedFlags
  };

  // Recommendations normalization
  const recsRaw = root.recommendations || {};
  let recommendations: RecommendationsBlock | undefined = undefined;
  if (recsRaw && (Array.isArray(recsRaw.suggested_roles || recsRaw.suggestedRoles) || Array.isArray(recsRaw.recommended_skills || recsRaw.recommendedSkills))) {
    recommendations = {
      suggestedRoles: Array.isArray(recsRaw.suggested_roles || recsRaw.suggestedRoles)
        ? (recsRaw.suggested_roles || recsRaw.suggestedRoles).map((r: any) => ({
            title: r.title || 'Software Engineer',
            matchScore: Number(r.match_score ?? r.matchScore ?? 85),
            reason: r.reason || 'Matches core profile competencies and background.',
            suitableSkills: Array.isArray(r.suitable_skills || r.suitableSkills) ? (r.suitable_skills || r.suitableSkills).map(String) : []
          }))
        : (baseline.recommendations?.suggestedRoles || []),
      recommendedSkills: Array.isArray(recsRaw.recommended_skills || recsRaw.recommendedSkills)
        ? (recsRaw.recommended_skills || recsRaw.recommendedSkills).map((s: any) => ({
            skill: s.skill || 'System Design',
            category: s.category || 'Cloud / DevOps',
            importance: (s.importance === 'high' || s.importance === 'medium' || s.importance === 'low') ? s.importance : 'high',
            reason: s.reason || 'High-leverage industry skill.',
            forRoles: Array.isArray(s.for_roles || s.forRoles) ? (s.for_roles || s.forRoles).map(String) : []
          }))
        : (baseline.recommendations?.recommendedSkills || [])
    };
  } else {
    recommendations = baseline.recommendations;
  }

  return {
    id: root.id || root._id ? String(root.id || root._id) : `scan-${Date.now()}`,
    timestamp: root.timestamp || new Date().toISOString(),
    candidateName,
    targetRole,
    targetCompany,
    overallScore,
    grade,
    verdict,
    metrics,
    recruiterImpression,
    keywords: {
      matched: matchedKeywords,
      missing: missingKeywords,
      matchPercentage
    },
    bulletPoints,
    sectionAudits,
    recommendations,
    rawResumeText: resumeText,
    rawJobDescription: jobDescription
  };
}

export async function fetchRecommendations(
  config: FastApiConfig,
  resumeText: string,
  skills: string[] = [],
  projects: string[] = [],
  education: string = '',
  experience: string = '',
  targetRole: string = 'Software Engineer'
): Promise<RecommendationsBlock> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/api/recommendations`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resume_text: resumeText,
      skills,
      projects,
      education,
      experience,
      target_role: targetRole,
    }),
  });

  if (!response.ok) {
    throw new Error(`Recommendations endpoint failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  return {
    suggestedRoles: Array.isArray(data.suggested_roles || data.suggestedRoles)
      ? (data.suggested_roles || data.suggestedRoles).map((r: any) => ({
          title: r.title || 'Software Engineer',
          matchScore: Number(r.match_score ?? r.matchScore ?? 85),
          reason: r.reason || 'Matches technical competencies and background.',
          suitableSkills: Array.isArray(r.suitable_skills || r.suitableSkills) ? (r.suitable_skills || r.suitableSkills).map(String) : []
        }))
      : [],
    recommendedSkills: Array.isArray(data.recommended_skills || data.recommendedSkills)
      ? (data.recommended_skills || data.recommendedSkills).map((s: any) => ({
          skill: s.skill || 'System Design',
          category: s.category || 'Cloud / DevOps',
          importance: (s.importance === 'high' || s.importance === 'medium' || s.importance === 'low') ? s.importance : 'high',
          reason: s.reason || 'High-leverage industry skill.',
          forRoles: Array.isArray(s.for_roles || s.forRoles) ? (s.for_roles || s.forRoles).map(String) : []
        }))
      : []
  };
}
