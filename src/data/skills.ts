import type { SkillCategory } from './types'

/** Skills are grouped by area. No percentages or proficiency claims, on purpose. */
export const skillCategories: SkillCategory[] = [
  {
    id: 'prog',
    title: 'Programming & Databases',
    blurb: 'Writing the logic and talking to the data.',
    skills: ['Python', 'SQL', 'MySQL', 'SQLite'],
  },
  {
    id: 'analytics',
    title: 'Data Analytics',
    blurb: 'From raw data to something you can reason about.',
    skills: [
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Data Cleaning',
      'Data Wrangling',
      'Exploratory Data Analysis',
      'Statistical Analysis',
      'Data Manipulation',
      'Data Interpretation',
    ],
  },
  {
    id: 'bi',
    title: 'Business Intelligence',
    blurb: 'Dashboards, models and reporting.',
    skills: [
      'Power BI',
      'Dashboard Development',
      'Microsoft Excel',
      'Google Sheets',
      'ETL',
      'BI',
      'Data Modeling',
      'Multidimensional Data Modeling',
    ],
  },
  {
    id: 'ai',
    title: 'AI & Application Development',
    blurb: 'LLMs and the applications around them.',
    skills: ['LLaMA 3', 'Groq API', 'LangChain', 'Google Gemini', 'Django'],
  },
  {
    id: 'tools',
    title: 'Developer Tools',
    blurb: 'The everyday toolbox.',
    skills: ['Git', 'GitHub', 'Visual Studio Code', 'Jupyter Notebook'],
  },
]
