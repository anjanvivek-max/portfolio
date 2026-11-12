import type { Project, ProjectId } from './types'

/**
 * Exactly two completed projects are showcased.
 *
 * TO UPDATE LATER
 * - repoUrl:      paste the full GitHub repository URL (currently null = "to be added").
 * - screenshots:  put images in public/assets/projects/ and set `src`,
 *                 e.g. src: 'assets/projects/ai-sql-assistant-1.png'.
 */
export const projects: Project[] = [
  {
    id: 'project-ai-sql',
    number: '01',
    title: 'AI SQL Assistant',
    shortTitle: 'AI SQL Assistant',
    kind: 'AI + Databases',
    summary:
      'An AI-powered assistant that lets people query an employee database in plain English. It turns a natural-language question into SQL, runs it on SQLite and returns the result.',
    overview: [
      'AI SQL Assistant is a practical application of AI and database technology. A user types a question in natural language, the assistant generates the matching SQL query with an LLM, and the query is executed against an employee SQLite database.',
      'It combines prompt engineering, a LLaMA 3 model accessed through the Groq API, and a Python layer that handles query execution.',
    ],
    problem: [
      'Getting answers from a relational database normally requires knowing SQL and the structure of the tables.',
      'People who know the question they want to ask, but not the query language, depend on someone else to write the query for them.',
    ],
    objective: [
      'Let a user interact with a database using natural language instead of hand-written SQL.',
      'Generate the SQL automatically and execute it, so the user goes from question to result in one step.',
    ],
    howItWorks: [
      'The user enters a question about the employee data in plain English.',
      'A prompt describing the task is built and sent to LLaMA 3 through the Groq API.',
      'The model returns a SQL query for the question.',
      'Python executes the generated query against the employee SQLite database.',
      'The rows returned by the database are shown to the user.',
    ],
    technologies: ['Python', 'SQLite', 'Groq API', 'LLaMA 3', 'Git'],
    features: [
      'Natural-language-to-SQL generation',
      'Automated SQL query execution',
      'Employee database interaction',
      'Support for more than 10 query types',
      'Prompt engineering for query generation',
      'AI-assisted database interaction',
    ],
    workflowTitle: 'Question-to-result workflow',
    workflow: [
      { label: 'User question', detail: 'Plain-English question about employees' },
      { label: 'Prompt', detail: 'Python prepares the prompt for the model' },
      { label: 'LLaMA 3 via Groq API', detail: 'Generates the SQL query' },
      { label: 'SQL execution', detail: 'Query runs on the SQLite employee database' },
      { label: 'Result', detail: 'Returned rows are shown to the user' },
    ],
    screenshots: [
      { src: null, caption: 'Asking a question in natural language' },
      { src: null, caption: 'Generated SQL query' },
      { src: null, caption: 'Query result from the employee database' },
    ],
    repoUrl: null,
    futureImprovements: [
      'Validate generated SQL before it runs and restrict it to read-only queries.',
      'Support other database engines such as MySQL in addition to SQLite.',
      'Read the schema automatically so the assistant can work with any database.',
      'Add a simple web interface with query history.',
    ],
  },
  {
    id: 'project-bone-marrow',
    number: '02',
    title: 'Early Detection of Bone Marrow Graft Rejection using LLMs',
    shortTitle: 'Bone Marrow Graft Rejection Detection',
    kind: 'AI + Healthcare (academic project)',
    summary:
      'An academic, AI-assisted web application that explores how an LLM can support the early identification of possible bone marrow graft rejection from clinical and hematological data.',
    overview: [
      'This is an AI-assisted application designed to support the early identification of possible bone marrow graft rejection using clinical and hematological information.',
      'It uses an LLM-based approach to produce a risk score together with explainable insights about the data provided. The application is built with Django, uses Google Gemini through LangChain, and stores its data in SQLite.',
    ],
    problem: [
      'Signs of possible graft rejection are spread across several blood and clinical indicators that have to be read together.',
      'A score without reasoning is hard to discuss. An assessment is more useful when it also explains which indicators influenced it.',
    ],
    objective: [
      'Build a secure web application where patient records and clinical values can be entered and managed.',
      'Use an LLM to turn those values into a risk score with an explainable, readable assessment.',
      'Present the result as a prediction report generated as soon as the data is submitted.',
    ],
    howItWorks: [
      'A user signs in to the web application.',
      'A patient record is created or selected in the patient management area.',
      'Clinical and hematological values are entered: white blood cell count, red blood cell count, platelet count, hemoglobin and cytokine markers.',
      'LangChain passes the data to Google Gemini with a prompt that asks for a risk assessment.',
      'The model returns a risk score and an explanation, which are shown as a prediction report.',
    ],
    technologies: ['Python', 'Django', 'Google Gemini', 'LangChain', 'SQLite'],
    features: [
      'Secure web application',
      'Authentication',
      'Patient management',
      'Clinical data input',
      'Real-time prediction reports',
      'LLM-generated risk assessment and explanations',
    ],
    workflowTitle: 'System architecture',
    workflow: [
      { label: 'Authenticated user', detail: 'Signs in to the Django web application' },
      { label: 'Patient management', detail: 'Create or select a patient record' },
      { label: 'Clinical data input', detail: 'WBC, RBC, platelets, hemoglobin, cytokine markers' },
      { label: 'LangChain + Google Gemini', detail: 'LLM produces a risk score and explanation' },
      { label: 'Prediction report', detail: 'Shown to the user, data kept in SQLite' },
    ],
    screenshots: [
      { src: null, caption: 'Sign-in and patient management' },
      { src: null, caption: 'Clinical data input form' },
      { src: null, caption: 'Prediction report with explanation' },
    ],
    repoUrl: null,
    futureImprovements: [
      'Evaluate the approach on properly sourced clinical datasets with guidance from medical experts.',
      'Track how a patient’s indicators change over time instead of assessing a single reading.',
      'Add role-based access and audit logs for different kinds of users.',
      'Allow reports to be exported for review.',
    ],
    disclaimer:
      'This is an academic and technical project, not a clinically validated medical product. Its predictions are experimental and are not a substitute for medical diagnosis or professional clinical decisions.',
  },
]

export const getProject = (id: ProjectId): Project => projects.find((p) => p.id === id) as Project
