import type { Achievement, Certification } from './types'

/**
 * TO UPDATE LATER
 * - image:     put the certificate image in public/assets/certificates/ and set the path,
 *              e.g. image: 'assets/certificates/power-bi-foundation.png'
 * - verifyUrl: paste the public verification link if the issuer provides one.
 * Both stay `null` until you provide real files and links.
 */
export const certifications: Certification[] = [
  {
    title: 'Data Analytics using Power BI Foundation',
    issuer: 'Infosys Springboard',
    year: '2026',
    image: null,
    verifyUrl: null,
  },
  {
    title: 'Data Science',
    issuer: 'Infosys Springboard',
    year: '2026',
    image: null,
    verifyUrl: null,
  },
  {
    title: 'Microsoft Excel',
    issuer: 'Infosys Springboard',
    year: '2026',
    image: null,
    verifyUrl: null,
  },
  {
    title: 'Introduction to Business Intelligence',
    issuer: 'Infosys Springboard',
    year: '2026',
    image: null,
    verifyUrl: null,
  },
  {
    title: 'Multidimensional Data Modeling',
    issuer: 'Infosys Springboard',
    year: '2026',
    image: null,
    verifyUrl: null,
  },
  {
    title: 'Oracle Cloud Infrastructure AI Foundations Associate',
    issuer: 'Oracle',
    year: '2025',
    image: null,
    verifyUrl: null,
  },
]

export const achievements: Achievement[] = [
  {
    title: 'Infosys Springboard Virtual Internship 7.0',
    detail: 'Virtual internship and training programme in data analytics.',
  },
  {
    title: 'Be10x AI Tools Workshop',
    detail: 'Workshop on AI tools.',
  },
]
