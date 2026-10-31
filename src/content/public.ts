export const SITE = {
  name: 'MindSpark Hub',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mindspark-hub.vercel.app',
  tagline: 'We spark growth and ignite Mindset.',
  motto: 'We spark growth and ignite Mindset.',
  philosophy:
    'Igniting minds, sparking purpose, and transforming lives across classrooms, campuses, and communities.',
  contact: {
    email: 'info@mindsparkhub.org',
    phone: '',
    address: 'Wukari, Taraba State, Nigeria',
    privacyEmail: 'privacy@mindsparkhub.org',
    securityEmail: 'security@mindsparkhub.org',
    secretariatEmail: 'secretariat@mindsparkhub.org',
  },
};

export const HOME = {
  eyebrow: 'Youth Development and Enlightenment',
  headline: 'Igniting Minds. Sparking Purpose. Transforming Lives.',
  supporting:
    'MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.',
  primaryCta: 'Discover Our Impact',
  secondaryCta: 'Explore Our Programmes',
  introductionTitle: 'We Spark Growth and Ignite Mindset',
  introductionBody:
    'We believe that genuine transformation begins with the mind. Through rigorous mentorship, practical skills training, moral discipline, and academic empowerment, MindSpark Hub mobilises young minds across Nigeria to reject complacency and embrace purpose.',
  vision: 'To build a Nigeria where citizens excel, innovate and lead positive change.',
  mission:
    'Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions.',
  approach: [
    {
      title: 'Academic Excellence',
      body: 'Promoting structured study discipline, productivity tools, and intellectual curiosity to overcome limitations.',
    },
    {
      title: 'Skills Acquisition',
      body: 'Equipping young Nigerians with in demand practical skills, digital literacy, and entrepreneurial competence early.',
    },
    {
      title: 'Character Development',
      body: 'Instilling moral integrity, personal dignity, and the courage to firmly reject anti social vice lifestyles.',
    },
    {
      title: 'Leadership Development',
      body: 'Training disciplined young leaders who take personal responsibility and influence their peers positively.',
    },
    {
      title: 'Purpose Discovery',
      body: 'Guiding students from confusion into clear life vision and destiny alignment before doubt takes root.',
    },
    {
      title: 'Moral and Spiritual Growth',
      body: 'Fostering reverence, spiritual consciousness, and genuine Christlike character in everyday conduct.',
    },
    {
      title: 'Community Responsibility',
      body: 'Inspiring active citizenship, local community service, mutual welfare support, and dedication to national progress.',
    },
  ],
  closingHeadline: 'The future is not waiting. We are building it.',
  closingBody:
    'Join a structured generation of Nigerians committed to excellence, character, and societal transformation. Partner with us, volunteer as a mentor, or participate in upcoming programmes.',
};

export const ABOUT = {
  eyebrow: 'About MindSpark Hub',
  headline: 'An Institution for National Transformation',
  supporting:
    'Equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.',
  whoWeAre: [
    'MindSpark Hub is a dynamic youth development, mentorship, enlightenment, and personal transformation organisation. Established in Wukari, Taraba State, the platform exists to raise a generation of Nigerians who excel academically, innovate practically, develop in demand skills, demonstrate unwavering character, and contribute positively to national development.',
    'We operate not as a temporary initiative, but as a structured institution. Through clear governance, specialised functional units, and dedicated volunteer field agents, we translate bold ideas into transformative realities in classrooms, campuses, and communities.',
  ],
  visionTitle: 'Building a Nation of Excellence',
  visionBody:
    'To build a Nigeria where citizens excel, innovate and lead positive change. We envision a society where youth reject mediocrity and cultivate the discipline required to stand on global stages.',
  missionTitle: 'Strategic Nationwide Engagement',
  missionBody:
    'Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions, practical workshops, and sustained mentorship relationships.',
  structureNote:
    'MindSpark Hub executes its mission through eight specialised functional advocacy units, supported by the Hub Secretariat and the Financial Department, led by our Executive Council.',
};

export const INVOLVEMENT_TYPES = [
  {
    id: 'join',
    label: 'Join the Hub',
    description: 'Register your interest in becoming a member of MindSpark Hub.',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    description: 'Offer your time and energy to a verified outreach.',
  },
  {
    id: 'mentor',
    label: 'Become a Mentor',
    description: 'Guide students and undergraduates with practical wisdom.',
  },
  {
    id: 'partner',
    label: 'Partner With Us',
    description: 'Explore an institutional or programme partnership.',
  },
  {
    id: 'support',
    label: 'Support an Outreach',
    description: 'Contribute resources, materials, or programme support.',
  },
  {
    id: 'programme',
    label: 'Participate in a Programme',
    description: 'Ask about taking part in a confirmed programme.',
  },
] as const;

export const CONTACT_TYPES = [
  { id: 'general', label: 'General Enquiry' },
  { id: 'programme', label: 'Programme Enquiry' },
  { id: 'partnership', label: 'Partnership Enquiry' },
] as const;
