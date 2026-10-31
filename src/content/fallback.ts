import type {
  Article,
  AwardItem,
  EventItem,
  GalleryItem,
  GovernanceStructure,
  LegalDocument,
  Programme,
} from '@/types';

export const FALLBACK_SITE = {
  name: 'MindSpark Hub',
  siteUrl: 'https://mindspark-hub.vercel.app',
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

export const FALLBACK_HOME = {
  eyebrow: 'Youth Development and Enlightenment',
  headline: 'Igniting Minds. Sparking Purpose. Transforming Lives.',
  supporting:
    'MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.',
  primaryCta: 'Discover Our Impact',
  secondaryCta: 'Explore Our Programmes',
  introductionTitle: 'Where Every Word Lights a Fire',
  introductionBody:
    'We believe that genuine transformation begins with the mind. Through rigorous mentorship, practical skills training, moral discipline, and academic empowerment, MindSpark Hub mobilises young minds across Nigeria to reject complacency and embrace purpose.',
  vision: 'To build a Nigeria where citizens excel, innovate and lead positive change.',
  mission:
    'Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions.',
};

export const FALLBACK_PROGRAMMES: Programme[] = [
  {
    slug: 'ssi',
    title: 'Secondary Schools Invasion',
    tagline: 'Catching Them Young, Building Solid Foundations',
    audience: 'Secondary school teenagers, senior students, teachers, and school administrators',
    description:
      'Secondary Schools Invasion is our flagship educational initiative designed to awaken purpose, intellectual discipline, and moral resilience in teenagers before doubt and negative peer pressure take root. Through engaging seminars and workshops, we equip students with study methodologies, early skill acquisition frameworks, and practical strategies to firmly reject anti social vice lifestyles.',
    objectives: [
      'Inspire academic discipline, structured study habits, and intellectual ambition.',
      'Expose students to early in demand skills, digital literacy, and entrepreneurial thinking.',
      'Build strong moral character, self respect, and resilience against anti social vices.',
      'Guide students from academic confusion into clear life vision and destiny alignment.',
      'Provide structured follow up and academic mentorship in partnership with schools.',
    ],
    structure: [
      'Interactive College Assembly Keynote Addresses',
      'Breakout Workshops on Study Productivity and Goal Setting',
      'Character, Ethics, and Vice Prevention Dialogues',
      'Practical Skills Demonstrations and Tech Awareness',
      'Open Question and Answer Mentorship Sessions',
    ],
    scheduleSummary: 'Termly school visits coordinated directly with institutional authorities',
    isActive: true,
  },
  {
    slug: 'cs',
    title: 'Campus Sparking',
    tagline: 'Beyond the Certificate, Awakening Campus Excellence',
    audience: 'University undergraduates, polytechnic students, and campus youth leaders',
    description:
      'Campus Sparking reaches tertiary students across Nigerian universities and higher institutions. We challenge the prevailing culture of minimum effort, urging students to look beyond academic transcripts and cultivate high value skills, intellectual rigor, ethical leadership, and personal responsibility required for enduring national impact.',
    objectives: [
      'Promote high academic attainment while demystifying career preparedness.',
      'Encourage acquisition of verified digital, creative, and technical skills.',
      'Cultivate ethical leadership and civic responsibility on campus.',
      'Build collaborative networks of purposeful undergraduates solving local problems.',
      'Anchor students in uncompromised character and spiritual consciousness.',
    ],
    structure: [
      'Biweekly Campus Sparking Convergences',
      'Beyond CGPA Leadership and Career Masterclasses',
      'Peer Mentorship and Academic Accountability Pods',
      'Digital Competence and Practical Skills Clinics',
      'Community Action and Social Impact Projects',
    ],
    scheduleSummary: 'Biweekly Saturday convergences from 10 AM to 12 PM',
    isActive: true,
  },
  {
    slug: 'ce',
    title: 'Community Enlightenment',
    tagline: 'Awakening Economic Productivity, Civic Responsibility and Renewed Purpose',
    audience: 'Working class adults, mid career professionals, artisans, and community elders',
    description:
      'Community Enlightenment takes transformation beyond academic institutions directly into local neighbourhoods and towns. We empower adults and community leaders with civic knowledge, vocational empowerment, economic productivity frameworks, and community welfare initiatives.',
    objectives: [
      'Stimulate grassroots economic productivity and vocational skill enhancement.',
      'Foster active civic participation, accountability, and community leadership.',
      'Support vulnerable families through mutual welfare and community food banks.',
      'Bridge generational divides through cooperative youth adult community dialogues.',
      'Promote moral integrity, peaceful coexistence, and shared community security.',
    ],
    structure: [
      'Town Hall Enlightenment Sessions and Community Seminars',
      'Adult Vocational and Digital Literacy Clinics',
      'Community Food Bank and Welfare Distributions',
      'Civic Responsibility and Public Health Awareness Dialogues',
    ],
    scheduleSummary: 'Monthly community forums and targeted outreach programmes',
    isActive: true,
  },
];

export const FALLBACK_EVENTS: EventItem[] = [
  {
    id: 'evt_cs_biweekly_1',
    programmeSlug: 'cs',
    programmeTitle: 'Campus Sparking',
    title: 'Biweekly Campus Sparking Convergence',
    tagline: 'Life Mentorship and Leadership Skills Development',
    description:
      'General community coaching session held biweekly on Saturdays from 10 AM to 12 PM. Open to undergraduates of all backgrounds for life mentorship, question addressing, and leadership skills development.',
    venue: 'Selected Campus Hub Center, Federal University Wukari',
    city: 'Wukari',
    state: 'Taraba',
    startDate: '2026-11-14T10:00:00Z',
    endDate: '2026-11-14T12:00:00Z',
    status: 'APPROVED',
    isPublic: true,
  },
  {
    id: 'evt_ssi_planning',
    programmeSlug: 'ssi',
    programmeTitle: 'Secondary Schools Invasion',
    title: 'Secondary Schools Invasion Preparatory Outreach',
    tagline: 'Early Skills Acquisition and Study Productivity',
    description:
      'Structured secondary school outreach focusing on early skills acquisition, study productivity frameworks, and anti social vices lifestyle prevention.',
    venue: 'Designated Secondary College Hall',
    city: 'Wukari',
    state: 'Taraba',
    startDate: '2026-12-05T09:00:00Z',
    endDate: '2026-12-05T13:00:00Z',
    status: 'APPROVED',
    isPublic: true,
  },
];

export const FALLBACK_GALLERY: GalleryItem[] = [
  {
    id: 'gal_ssi_fgc_pano',
    programmeSlug: 'ssi',
    title: 'SSI 1.0 Panoramic Assembly at Federal Government College Wukari',
    caption:
      'Full college assembly hall during Secondary Schools Invasion 1.0 at Federal Government College Wukari, Taraba State.',
    altText:
      'Panoramic view of students gathered in the assembly hall at Federal Government College Wukari during MindSpark Hub outreach',
    category: 'OUTREACH',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/ssi_fgc_wukari_panoramic.jpg',
    isPublished: true,
    isMinorDepicted: true,
    consentVerified: true,
  },
  {
    id: 'gal_ssi_agents',
    programmeSlug: 'ssi',
    title: 'MindSpark Agents Deborah and Anna',
    caption:
      'MindSpark Hub field agents Deborah and Anna engaging students on character discipline and academic excellence at FGC Wukari.',
    altText:
      'MindSpark Hub agents Deborah and Anna addressing students during school seminar session',
    category: 'OUTREACH',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/ssi_agents_deborah_anna.jpg',
    isPublished: true,
    isMinorDepicted: false,
    consentVerified: true,
  },
  {
    id: 'gal_ssi_godwin',
    programmeSlug: 'ssi',
    title: 'MindSpark Agent Godwin Addressing the Assembly',
    caption:
      'MindSpark Agent Godwin facilitating the practical skills and personal development session for senior students.',
    altText:
      'MindSpark Agent Godwin standing before students facilitating an interactive learning session',
    category: 'OUTREACH',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/ssi_agent_godwin.jpg',
    isPublished: true,
    isMinorDepicted: false,
    consentVerified: true,
  },
  {
    id: 'gal_cs_fuw_pano',
    programmeSlug: 'cs',
    title: 'Campus Sparking at Federal University Wukari',
    caption:
      'Panoramic view of undergraduate students gathered for Campus Sparking at Federal University Wukari, Taraba State.',
    altText:
      'Undergraduate students seated in university lecture hall during Campus Sparking seminar',
    category: 'CAMPUS',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/cs_fu_wukari_panoramic.jpg',
    isPublished: true,
    isMinorDepicted: false,
    consentVerified: true,
  },
  {
    id: 'gal_cs_lecture',
    programmeSlug: 'cs',
    title: 'Beyond CGPA Seminar Session at FU Wukari',
    caption:
      'Undergraduates exploring practical skills, value creation mentality, and career readiness at Federal University Wukari.',
    altText:
      'University students listening intently to presentation on skills and career preparedness',
    category: 'CAMPUS',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/cs_lecture_hall_session.jpg',
    isPublished: true,
    isMinorDepicted: false,
    consentVerified: true,
  },
  {
    id: 'gal_cs_convergence',
    programmeSlug: 'cs',
    title: 'Participants Convergence and Mentorship Discussion',
    caption:
      'Campus Sparking participants convening for small group mentorship and purpose alignment discussions.',
    altText:
      'Undergraduate participants engaged in community mentorship dialogue after seminar session',
    category: 'CAMPUS',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/cs_participants_convergence.jpg',
    isPublished: true,
    isMinorDepicted: false,
    consentVerified: true,
  },
];

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'art_beyond_cgpa',
    slug: 'beyond-cgpa-unlocking-skills-and-purpose',
    title: 'Beyond CGPA: Why Nigerian Undergraduates Must Build Practical Competence Early',
    excerpt:
      'Higher education is shifting globally. For Nigerian university students, academic excellence must be complemented with problem solving capability and practical relevance.',
    category: 'Skills and Career',
    authorName: 'Adakole Agene Michael',
    readingTimeMinutes: 4,
    publishedAt: '2026-10-15T09:00:00Z',
    isPublished: true,
    coverImageUrl: 'https://mindspark-hub.vercel.app/gallery/cs_lecture_hall_session.jpg',
    blocks: [
      {
        type: 'heading',
        level: 2,
        text: 'The Limitation of Academic Credentials Alone',
      },
      {
        type: 'paragraph',
        text: 'A high cumulative grade point average represents academic discipline, cognitive capacity, and perseverance. These qualities are admirable. However, in the contemporary Nigerian economy and international market, academic qualification without practical application leaves graduates unprepared for substantive challenges.',
      },
      {
        type: 'paragraph',
        text: 'Employers and institutions no longer ask simply what degree you hold. They ask what problem you can solve, what tools you master, and how reliably you deliver results under pressure.',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Four Pillars of Practical Undergrad Competence',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Digital and Technical Literacy: mastering productivity software, coding, data analysis, or digital design.',
          'Effective Written and Verbal Communication: the ability to articulate complex thoughts clearly and persuasively.',
          'Collaborative Teamwork and Emotional Intelligence: working effectively across diverse teams without friction.',
          'Critical Problem Solving: identifying inefficiencies and crafting actionable, sustainable solutions.',
        ],
      },
      {
        type: 'quote',
        text: 'Certificates validate your past attendance. Practical competence defines your future contribution.',
      },
      {
        type: 'paragraph',
        text: 'MindSpark Hub urges every undergraduate to pair classroom excellence with rigorous skill acquisition. Your university years must serve as an incubator for practical problem solving.',
      },
    ],
  },
  {
    id: 'art_catch_them_young',
    slug: 'catch-them-young-instilling-vision-in-teenagers',
    title: 'Catch Them Young: Instilling Academic Discipline Before Doubt Takes Root',
    excerpt:
      'Secondary school represents the most critical developmental stage for teenagers. Planting seeds of purpose early transforms their trajectory for life.',
    category: 'Academic Excellence',
    authorName: 'Daniel Joseph Ayomide',
    readingTimeMinutes: 5,
    publishedAt: '2026-10-20T10:00:00Z',
    isPublished: true,
    coverImageUrl: 'https://mindspark-hub.vercel.app/gallery/ssi_fgc_wukari_panoramic.jpg',
    blocks: [
      {
        type: 'heading',
        level: 2,
        text: 'The Formative Window of Adolescence',
      },
      {
        type: 'paragraph',
        text: 'The secondary school years are when young people form foundational habits, identity frameworks, and moral boundaries. If teenagers are left to unguided peer culture and social media trends, complacency and disillusionment take root rapidly.',
      },
      {
        type: 'paragraph',
        text: 'When we enter classrooms through Secondary Schools Invasion, our objective is to ignite a conviction that academic excellence is accessible to anyone willing to apply structured discipline.',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Key Practices for Teen Academic Mastery',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Consistent daily review schedules rather than last minute examination cramming.',
          'Active reading with summarisation and conceptual questioning.',
          'Early peer study accountability pods that encourage focused discussion.',
          'Firm personal boundaries regarding smartphone and recreational screen time.',
        ],
      },
      {
        type: 'paragraph',
        text: 'When a teenager discovers their cognitive potential early, anti social vices lose their appeal. Purpose becomes a natural shield against destructive shortcuts.',
      },
    ],
  },
  {
    id: 'art_character_capital',
    slug: 'character-as-capital-rejecting-antisocial-vices',
    title: 'Character as Capital: The Urgent Need to Reject Anti Social Lifestyles',
    excerpt:
      'Talent may open doors, but character preserves enduring impact. A deep look into building moral resilience among youth.',
    category: 'Character and Ethics',
    authorName: 'Chukwuebuka James Obochi',
    readingTimeMinutes: 4,
    publishedAt: '2026-10-25T11:00:00Z',
    isPublished: true,
    coverImageUrl: 'https://mindspark-hub.vercel.app/gallery/ssi_agents_deborah_anna.jpg',
    blocks: [
      {
        type: 'heading',
        level: 2,
        text: 'The True Measure of Enduring Influence',
      },
      {
        type: 'paragraph',
        text: 'It is a common error among youth to believe that technical genius or charismatic charm is sufficient for greatness. Yet history demonstrates repeatedly that gifted individuals without ethical anchors collapse under scrutiny.',
      },
      {
        type: 'quote',
        text: 'A society that celebrates talent while ignoring integrity builds its future upon sinking sand.',
      },
      {
        type: 'paragraph',
        text: 'At MindSpark Hub, character is treated as foundational institutional capital. We educate youth on the long term catastrophic consequences of substance abuse, examination malpractice, fraudulent internet schemes, and interpersonal disrespect.',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Cultivating Uncompromising Integrity',
      },
      {
        type: 'paragraph',
        text: 'Integrity is not an abstract theory. It is the practical habit of doing what is morally right when no supervisor is watching, honoring your commitments, and treating every citizen with genuine dignity.',
      },
    ],
  },
];

export const FALLBACK_STRUCTURE: GovernanceStructure = {
  motto: 'We spark growth and ignite Mindset.',
  slogan: 'We spark growth and ignite Mindset.',
  philosophy:
    'Igniting minds, sparking purpose, and transforming lives across classrooms, campuses, and communities.',
  headquarters: 'Wukari, Taraba State, Nigeria',
  contact: {
    email: 'info@mindsparkhub.org',
    privacyEmail: 'privacy@mindsparkhub.org',
    securityEmail: 'security@mindsparkhub.org',
    secretariatEmail: 'secretariat@mindsparkhub.org',
    address: 'Wukari, Taraba State, Nigeria',
  },
  leadership: [
    {
      name: 'Chukwuebuka James Obochi',
      role: 'Hub Director and Founder',
      unit: 'Central Executive',
      image: 'https://mindspark-hub.vercel.app/exco/chukwuebuka_james_obochi.jpg',
    },
    {
      name: 'Daniel Joseph Ayomide',
      role: 'Academic Excellence Advocacy Unit Head',
      unit: 'Academic Excellence',
      image: 'https://mindspark-hub.vercel.app/exco/daniel_joseph_ayomide.jpg',
    },
    {
      name: 'Gladness Adeduni',
      role: 'Communication and Editorial Unit Head',
      unit: 'Editorial and Voice',
      image: 'https://mindspark-hub.vercel.app/exco/gladness_adeduni.jpg',
    },
    {
      name: 'Kayode Mary Ayomide',
      role: 'Financial Secretary',
      unit: 'Finance and Stewardship',
      image: 'https://mindspark-hub.vercel.app/exco/kayode_mary_ayomide.jpg',
    },
    {
      name: 'Bekwapu Lucy Beshiunim',
      role: 'Gender Based Vices and Sexual Purity Advocacy Unit Head',
      unit: 'Ethics and Protection',
      image: 'https://mindspark-hub.vercel.app/exco/bekwapu_lucy_beshiunim.jpg',
    },
    {
      name: 'Samuel Daberechukwu Oputa',
      role: 'Logistics Coordinator',
      unit: 'Logistics and Planning',
      image: 'https://mindspark-hub.vercel.app/exco/samuel_daberechukwu_oputa.jpg',
    },
    {
      name: 'Adakole Agene Michael',
      role: 'Skills Acquisition Advocacy Unit Head',
      unit: 'Practical Competence',
      image: 'https://mindspark-hub.vercel.app/exco/adakole_agene_michael.jpg',
    },
    {
      name: 'Jeremiah Daniel Baba',
      role: 'Technical Director',
      unit: 'Digital and Infrastructure',
      image: 'https://mindspark-hub.vercel.app/exco/jeremiah_daniel_baba.jpg',
    },
    {
      name: 'Omomayowa Eunice Adewuyi',
      role: 'Welfare Coordinator',
      unit: 'Welfare and Community',
      image: 'https://mindspark-hub.vercel.app/exco/omomayowa_eunice_adewuyi.jpg',
    },
    {
      name: 'MindSpark Agent',
      role: 'Field Representative',
      unit: 'Field Operations',
      image: 'https://mindspark-hub.vercel.app/exco/mindspark_agent.jpg',
    },
  ],
  units: [
    {
      name: 'Academic Excellence Advocacy Unit',
      focus: 'Intellectual discipline, structured study strategies, and academic productivity',
      responsibilities: [
        'Design academic excellence presentation slides for SSI and CS',
        'Organize training sessions and study strategy workshops',
        'Develop structured academic mentorship for members and students',
        'Provide academic performance monitoring tools',
        'Promote reading culture, innovation, and critical thinking',
      ],
    },
    {
      name: 'Skill Acquisition Advocacy Unit',
      focus: 'Practical competence, high demand digital literacy, and entrepreneurial capability',
      responsibilities: [
        'Identify high demand skills relevant to Nigeria economy and global trends',
        'Organize practical skill based seminars and workshops',
        'Partner with certified trainers and industry professionals',
        'Promote entrepreneurial awareness and innovation among youth',
        'Connect students to internships and practical digital literacy initiatives',
      ],
    },
    {
      name: 'Gender Based Vices and Sexual Purity Advocacy Unit',
      focus: 'Moral discipline, respect, dignity, and abuse prevention in schools and campuses',
      responsibilities: [
        'Organize awareness programmes against gender based vices and violence',
        'Educate students on respect, boundaries, and responsible conduct',
        'Promote moral discipline and healthy relationships',
        'Advocate against teenage marriage and school dropouts',
        'Provide guidance and ethical counselling referral support',
      ],
    },
    {
      name: 'Communication and Editorial Unit',
      focus: 'Institutional narrative, publication clarity, and brand integrity',
      responsibilities: [
        'Develop official publications, articles, and educational content',
        'Design clean graphics and slides for seminar presentations',
        'Manage official messaging and institutional brand tone',
        'Edit seminar materials of all units prior to public release',
        'Document verified impact stories, programme reports, and archives',
      ],
    },
    {
      name: 'Technical Unit',
      focus: 'Audiovisual projection, software systems, and operational technology',
      responsibilities: [
        'Coordinate audiovisual projection and sound setup for seminars',
        'Maintain digital systems, website infrastructure, and media equipment',
        'Ensure seamless technical operations during school and campus outreaches',
        'Safeguard digital assets and technical documentation',
      ],
    },
    {
      name: 'Welfare Unit',
      focus: 'Mutual care, community food banks, and member safety support',
      responsibilities: [
        'Coordinate welfare support and mutual care among members',
        'Manage community food bank donations for vulnerable students',
        'Facilitate outreach hospitality and logistics support',
        'Foster an encouraging and emotionally healthy community environment',
      ],
    },
    {
      name: 'Logistics Unit',
      focus: 'Venue coordination, transportation planning, and operational execution',
      responsibilities: [
        'Coordinate seminar venues for SSI and CS with institutional authorities',
        'Plan transport logistics for volunteer agents and guest facilitators',
        'Manage distribution of outreach materials and seminar guides',
        'Oversee timeline enforcement and operational checklists',
      ],
    },
    {
      name: 'Evangelism Unit',
      focus: 'Spiritual consciousness, moral integrity, and Christlike character',
      responsibilities: [
        'Promote spiritual consciousness and character integrity within the Hub',
        'Coordinate prayer and intercession for all outreaches and state initiatives',
        'Conduct follow up and spiritual encouragement for participants seeking guidance',
        'Ensure holistic transformation across intellectual, moral, and spiritual life',
      ],
    },
  ],
  secretariat: {
    title: 'The Hub Secretariat',
    description:
      'Coordinates institutional documentation, inter unit logistics, regulatory correspondence, meeting minutes, and outreach records under General Secretary Dimas Mercy.',
  },
  financialDepartment: {
    title: 'The Financial Department',
    description:
      'Maintains rigorous accounting integrity, transparent recordkeeping, audit trail accountability, and resource stewardship under Financial Secretary Kayode Mary Ayomide.',
  },
};

export const FALLBACK_LEGAL: Record<LegalDocument['slug'], LegalDocument> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Trust and Data Protection',
    updated: 'October 2026',
    summary:
      'How MindSpark Hub collects, uses, stores, and protects personal information under the Nigeria Data Protection Act 2023.',
    sections: [
      {
        heading: '1. Our Data Protection Commitment',
        paragraphs: [
          'MindSpark Hub is committed to safeguarding the privacy and digital dignity of every person who interacts with our platform. We collect the minimum information necessary to run our youth development, mentorship, and enlightenment work.',
        ],
      },
      {
        heading: '2. Lawful Basis for Processing',
        paragraphs: [
          'In line with the Nigeria Data Protection Act 2023, we process personal information under the following lawful bases:',
        ],
        bullets: [
          'Consent: freely given when you submit an inquiry, volunteer application, or mentorship registration.',
          'Legitimate institutional purpose: evaluating volunteer suitability, coordinating school outreach logistics, and preventing system abuse.',
        ],
      },
      {
        heading: '3. Protection of Minors and Child Safeguarding',
        paragraphs: [
          'Secondary school students are minors under Nigerian law. MindSpark Hub enforces strict safeguarding rules:',
        ],
        bullets: [
          'We never collect personal contact information from children through public forms.',
          'Photographs showing secondary school students are published only with verified institutional consent from participating schools and guardians.',
          'Metadata, including device information and geographic location, is permanently stripped from images before publication.',
          'We operate an immediate takedown route for any guardian or school requesting removal of an outreach photograph.',
        ],
      },
      {
        heading: '4. No Non Essential Cookies or Advertising Trackers',
        paragraphs: [
          'MindSpark Hub does not use advertising trackers, commercial telemetry pixels, or intrusive behavioural profiling. The web dashboard uses only strictly necessary security cookies for authenticated staff. The mobile app stores staff tokens in the operating system secure store and stores no personal data in plain text.',
        ],
      },
      {
        heading: '5. Citizen Data Rights',
        paragraphs: [
          'Under the NDPA 2023, you have the right to request access to your personal data, rectify inaccuracies, withdraw consent, or request complete erasure. Contact our data protection officer at privacy@mindsparkhub.org.',
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Use',
    eyebrow: 'Agreement and Conduct',
    updated: 'October 2026',
    summary:
      'Rules governing participation in MindSpark Hub digital platforms, school invasion programmes, and campus engagements.',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        paragraphs: [
          'By accessing the MindSpark Hub mobile application, website, or attending our verified seminars, you agree to these Terms of Use and our institutional code of conduct.',
        ],
      },
      {
        heading: '2. Purpose and Conduct',
        paragraphs: [
          'MindSpark Hub exists solely for educational, youth development, mentorship, and civic enlightenment purposes. Participants must conduct themselves with mutual respect, academic integrity, and personal dignity at all times.',
        ],
      },
      {
        heading: '3. Intellectual Property and Content',
        paragraphs: [
          'All seminar guides, slide decks, articles, logos, and curriculum frameworks produced by MindSpark Hub remain the intellectual property of the organisation. Materials may be read and shared for non commercial educational enlightenment with attribution.',
        ],
      },
      {
        heading: '4. Zero Tolerance for Vices',
        paragraphs: [
          'MindSpark Hub enforces a strict zero tolerance policy towards substance abuse, academic dishonesty, gender harassment, cyber fraud, and violence during all physical outreaches and across our online community channels.',
        ],
      },
    ],
  },
  security: {
    slug: 'security',
    title: 'Security and Responsible Disclosure',
    eyebrow: 'Institutional Safeguards',
    updated: 'October 2026',
    summary:
      'Our defense in depth security architecture, encryption standards, vulnerability reporting guidelines, and audit policies.',
    sections: [
      {
        heading: '1. Defense in Depth Architecture',
        paragraphs: [
          'MindSpark Hub applies modern defense in depth standards across all web and mobile systems. Mobile tokens are strictly isolated within hardware backed secure enclaves using the operating system SecureStore. Communication uses TLS 1.3 encryption, and administrative actions require mandatory two factor authentication.',
        ],
      },
      {
        heading: '2. Child Safeguarding and Image Scrubbing',
        paragraphs: [
          'All media depicting outreach activities undergoes automated EXIF metadata scrubbing before publication to eliminate geographic coordinates, camera serial numbers, and device timestamps.',
        ],
      },
      {
        heading: '3. Responsible Disclosure Policy',
        paragraphs: [
          'We welcome security researchers who identify potential vulnerabilities in our systems. Please report findings responsibly to security@mindsparkhub.org with sufficient technical detail to reproduce the issue. We commit to acknowledging reports within 48 hours and implementing remediations promptly.',
        ],
      },
    ],
  },
};

export const FALLBACK_AWARDS: AwardItem[] = [
  {
    id: 'awd_2026_01',
    recipientName: 'Daniel Joseph Ayomide',
    awardTitle: 'Distinguished Academic Mentor of the Year',
    category: 'Mentorship Excellence',
    year: 2026,
    citation:
      'Awarded for exemplary commitment to student study strategies, intellectual discipline, and academic mentorship across Secondary Schools Invasion outreaches.',
    imageUrl: 'https://mindspark-hub.vercel.app/exco/daniel_joseph_ayomide.jpg',
    orderIndex: 1,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'awd_2026_02',
    recipientName: 'Federal Government College Wukari',
    awardTitle: 'Institutional Partnership Citation for Child Safeguarding',
    category: 'Institutional Partnership',
    year: 2026,
    citation:
      'Recognized for outstanding institutional cooperation, moral support, and exemplary child safeguarding during Secondary Schools Invasion 1.0.',
    imageUrl: 'https://mindspark-hub.vercel.app/gallery/ssi_fgc_wukari_panoramic.jpg',
    orderIndex: 2,
    createdAt: '2026-10-05T11:00:00Z',
  },
  {
    id: 'awd_2026_03',
    recipientName: 'Adakole Agene Michael',
    awardTitle: 'Youth Leadership and Skills Innovation Honor',
    category: 'Youth Leadership',
    year: 2026,
    citation:
      'Presented for groundbreaking leadership in equipping undergraduates with practical digital literacy and high demand vocational competencies.',
    imageUrl: 'https://mindspark-hub.vercel.app/exco/adakole_agene_michael.jpg',
    orderIndex: 3,
    createdAt: '2026-10-10T12:00:00Z',
  },
  {
    id: 'awd_2026_04',
    recipientName: 'Omomayowa Eunice Adewuyi',
    awardTitle: 'Community Compassion and Welfare Award',
    category: 'Community Impact',
    year: 2026,
    citation:
      'Honored for tireless dedication to member welfare, community food bank initiatives, and support for vulnerable students in Taraba State.',
    imageUrl: 'https://mindspark-hub.vercel.app/exco/omomayowa_eunice_adewuyi.jpg',
    orderIndex: 4,
    createdAt: '2026-10-15T14:00:00Z',
  },
  {
    id: 'awd_2026_05',
    recipientName: 'Bekwapu Lucy Beshiunim',
    awardTitle: 'Moral Courage and Character Defense Citation',
    category: 'Academic Distinction',
    year: 2026,
    citation:
      'Recognized for exceptional leadership in promoting moral discipline, personal dignity, and student awareness against anti social vices.',
    imageUrl: 'https://mindspark-hub.vercel.app/exco/bekwapu_lucy_beshiunim.jpg',
    orderIndex: 5,
    createdAt: '2026-10-20T16:00:00Z',
  },
];
