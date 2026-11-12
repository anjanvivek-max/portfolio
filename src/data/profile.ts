import type { Profile } from './types'

export const profile: Profile = {
  name: 'Jatangi Anjan Vivek',
  shortName: 'Vivek',
  title: 'Software Engineer | AI & Data Analytics Developer',
  location: 'Hyderabad, India',
  email: 'anjanvivekjatangi@gmail.com',
  github: 'https://github.com/anjanvivek-max',

  // TODO: add your LinkedIn profile URL, e.g. 'https://www.linkedin.com/in/your-handle'
  linkedin: null,
  // TODO: optionally place a PDF in public/assets/ and set e.g. 'assets/resume.pdf'
  resumeUrl: null,

  tagline: 'I appreciate the technology of yesterday and build for tomorrow.',

  summary: [
    'I am a B.Tech Information Technology graduate from TKR College of Engineering and Technology, Hyderabad.',
    'I am interested in software engineering, AI-powered applications, database-driven solutions and data analytics. I work with Python, SQL, MySQL, data analysis tools and modern AI technologies.',
    'I enjoy exploring how technology can solve practical problems, and I like turning ideas into applications that actually work.',
  ],

  interests: ['Software engineering', 'AI-powered applications', 'Databases', 'Data analytics'],

  // Shown in the notebook on the desk. Edit freely: it is your own voice.
  note: [
    'Hello, I am Vivek.',
    'I like understanding how things work, and then building something useful with what I learn.',
    'Most of what I build sits where software, data and AI meet: a database you can question in plain English, an assessment that explains its own reasoning.',
    'I am still learning every day, and that is the part I enjoy most.',
    'Thanks for visiting. Pick a tape and press play.',
  ],
}
