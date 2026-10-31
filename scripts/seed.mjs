import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import { Secret } from 'otpauth';

const DB_PATH = path.resolve('mindspark.db');
const db = new DatabaseSync(DB_PATH);

// Helper for scrypt password hashing
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function seed() {
  console.log('--- Initializing MindSpark Hub Database Schema ---');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      mfa_enabled INTEGER DEFAULT 0,
      mfa_secret TEXT,
      mfa_backup_codes TEXT,
      is_active INTEGER DEFAULT 1,
      failed_sign_ins INTEGER DEFAULT 0,
      locked_until TEXT,
      last_sign_in_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS programmes (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      audience TEXT NOT NULL,
      objectives_json TEXT NOT NULL,
      content TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      programme_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      venue TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by TEXT NOT NULL,
      approved_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      unit_head_name TEXT NOT NULL,
      description TEXT NOT NULL,
      core_functions_json TEXT NOT NULL,
      guiding_rules_json TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exco_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      unit_slug TEXT,
      bio TEXT NOT NULL,
      image_url TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      caption TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_minor_depicted INTEGER DEFAULT 0,
      consent_verified INTEGER DEFAULT 0,
      consent_reference TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      author_name TEXT NOT NULL,
      category TEXT NOT NULL,
      featured_image TEXT NOT NULL,
      reading_time_mins INTEGER DEFAULT 3,
      is_published INTEGER DEFAULT 1,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      reference_code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_number TEXT,
      interests TEXT,
      message TEXT NOT NULL,
      consent_given INTEGER NOT NULL,
      is_adult_confirmed INTEGER NOT NULL,
      status TEXT DEFAULT 'NEW',
      internal_notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      details TEXT,
      outcome TEXT NOT NULL,
      previous_hash TEXT NOT NULL,
      entry_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      is_public INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mfa_setup_requests (
      user_id TEXT PRIMARY KEY,
      secret TEXT NOT NULL,
      backup_codes TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_password_reset_hash ON password_reset_tokens(token_hash);
  `);

  console.log('--- Seeding Verified Administrative Accounts ---');
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(20).toString('base64url');
  const defaultPasswordHash = await hashPassword(seedPassword);
  const now = new Date().toISOString();

  // Create accounts
  const users = [
    {
      id: 'usr_super_admin',
      name: 'Executive Super Administrator',
      email: 'admin@mindsparkhub.org',
      role: 'SUPER_ADMIN',
    },
    {
      id: 'usr_admin',
      name: 'Operations Administrator',
      email: 'coordinator@mindsparkhub.org',
      role: 'ADMIN',
    },
    {
      id: 'usr_editor',
      name: 'Communications Lead',
      email: 'editorial@mindsparkhub.org',
      role: 'EDITOR',
    },
    {
      id: 'usr_prog_mgr',
      name: 'Field Programme Manager',
      email: 'programmes@mindsparkhub.org',
      role: 'PROGRAMME_MANAGER',
    },
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, password_hash, role, mfa_enabled, mfa_secret, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seededCredentials = [];

  for (const u of users) {
    const mfaSecret = process.env.SEED_MFA_SECRET || new Secret({ size: 20 }).base32;
    insertUser.run(
      u.id,
      u.name,
      u.email,
      defaultPasswordHash,
      u.role,
      1, // MFA enabled by default for all privileged accounts
      mfaSecret,
      1,
      now,
      now
    );
    seededCredentials.push({ email: u.email, mfaSecret });
  }

  console.log('--- Generated Local Seed Credentials ---');
  console.log(`Password: ${seedPassword}`);
  for (const credential of seededCredentials) {
    console.log(`${credential.email} | TOTP secret: ${credential.mfaSecret}`);
  }
  console.log('Store these locally. They are not intended for production use.');

  console.log('--- Seeding The 3 Core Impact Vehicles ---');
  const programmes = [
    {
      id: 'prog_ssi',
      slug: 'ssi',
      title: 'Secondary Schools Invasion',
      tagline: 'Catch Them Young. Shape Them Early.',
      audience: 'Teenage secondary school students across Nigerian schools',
      objectives: JSON.stringify([
        'Promote academic excellence and structured study discipline',
        'Encourage early practical skills acquisition and digital literacy',
        'Develop personal discipline and ethical youth leadership',
        'Build positive character values and responsible citizenship',
        'Equip students to reject anti social vices and negative peer pressure',
        'Help students overcome regional barriers and discover purpose early'
      ]),
      content: `Secondary Schools Invasion is designed to influence teenagers at a critical stage of growth. It raises young Nigerians who are confident, disciplined, morally sound, skilful and academically intentional.

It rebuilds student mindsets early, instils vision before confusion sets in, and plants seeds of greatness before the world plants doubt.

The seminar delivers three structured curriculum sessions:
1. Academic Excellence: Greatness despite regional barriers, practical learning approaches, academic discipline, and productive study habits.
2. Skills Acquisition: Why practical competence matters early, lifelong skills, digital literacy, and personal development.
3. Anti Social Vices: Frank guidance on the destructive impact of social vices, substance abuse, and peer pressure, providing practical tools for positive choices.

The programme concludes with an interactive question and answer session led by experienced MindSpark agents, the official MindSpark chant, and closing prayers.`,
    },
    {
      id: 'prog_cs',
      slug: 'cs',
      title: 'Campus Sparking',
      tagline: 'Beyond CGPA: Unlocking Skills, Purpose and Opportunities',
      audience: 'Undergraduate students across Nigerian universities and polytechnics',
      objectives: JSON.stringify([
        'Shift students from certificate mentality to value creation mentality',
        'Bridge academic lecture room theory and practical societal impact',
        'Equip undergraduates with relevant, in demand hard and soft skills',
        'Guide students through early purpose discovery and career readiness',
        'Provide sustained mentorship and life coaching communities',
        'Prepare graduates who are truly empowered for post graduation life'
      ]),
      content: `Campus Sparking transforms undergraduates into competent, skilled, and purpose aligned individuals who are prepared for life, not merely examinations.

Participants experience intensive sessions covering practical skills development, purpose alignment, leadership capability, career readiness, and direct mentorship.

In addition to large hall seminars, Campus Sparking convenes bi weekly community sessions every two weeks on Saturdays from 10 AM to 12 PM at selected venues. These convergence sessions are open to students of all backgrounds and provide ongoing life coaching, peer accountability, and direct guidance from MindSpark mentors.`,
    },
    {
      id: 'prog_ce',
      slug: 'ce',
      title: 'Community Enlightenment',
      tagline: 'Awakening Economic Productivity, Civic Responsibility and Renewed Purpose',
      audience: 'Working class adults, middle aged citizens, and community members',
      objectives: JSON.stringify([
        'Awaken economic productivity and local entrepreneurial initiative',
        'Promote civic responsibility and peaceful community participation',
        'Renew hope, personal dignity, and purpose among adult citizens',
        'Conduct preventive health awareness outreaches and community support'
      ]),
      content: `Community Enlightenment is the third core impact vehicle of MindSpark Hub, extending transformative principles directly into grassroots communities and working class families.

Through targeted workshops, health awareness campaigns, and economic empowerment sessions, Community Enlightenment strengthens community bonds, encourages self reliance, and inspires adults to become proactive contributors to national renewal.`,
    },
  ];

  const insertProg = db.prepare(`
    INSERT OR REPLACE INTO programmes (id, slug, title, tagline, audience, objectives_json, content, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  for (const p of programmes) {
    insertProg.run(p.id, p.slug, p.title, p.tagline, p.audience, p.objectives, p.content, now);
  }

  console.log('--- Seeding Executive Council Members (Excos) ---');
  // As confirmed by the user, the files in images/ represent the active excos
  const excos = [
    {
      id: 'exco_dir',
      name: 'Chukwuebuka James Obochi',
      role_title: 'Hub Director and Founder',
      unit_slug: 'executive',
      bio: 'Visionary founder and institutional leader of MindSpark Hub, steering the mission to spark growth, ignite mindset, and transform lives across classrooms, campuses, and communities throughout Nigeria.',
      image_url: '/exco/chukwuebuka_james_obochi.jpg',
      order_index: 1,
    },
    {
      id: 'exco_acad',
      name: 'Daniel Joseph Ayomide',
      role_title: 'Academic Excellence Advocacy Unit Head',
      unit_slug: 'academic_excellence',
      bio: 'Leads the Academic Excellence Advocacy Unit, championing intellectual discipline, study strategies, and academic productivity across all MindSpark outreaches.',
      image_url: '/exco/daniel_joseph_ayomide.jpg',
      order_index: 2,
    },
    {
      id: 'exco_comm',
      name: 'Gladness Adeduni',
      role_title: 'Communication and Editorial Unit Head',
      unit_slug: 'communication_editorial',
      bio: 'Shapes the voice, narrative, and brand integrity of MindSpark Hub, directing all publications, seminar materials, and official communications.',
      image_url: '/exco/gladness_adeduni.jpg',
      order_index: 3,
    },
    {
      id: 'exco_fin',
      name: 'Kayode Mary Ayomide',
      role_title: 'Financial Secretary',
      unit_slug: 'finance',
      bio: 'Oversees the prudent management, strict accountability, and transparent documentation of financial resources across all programmes and operations.',
      image_url: '/exco/kayode_mary_ayomide.jpg',
      order_index: 4,
    },
    {
      id: 'exco_gender',
      name: 'Bekwapu Lucy Beshiunim',
      role_title: 'Gender Based Vices and Sexual Purity Advocacy Unit Head',
      unit_slug: 'gender_purity',
      bio: 'Promotes moral discipline, personal dignity, and ethical conduct, leading educational seminars addressing harassment, abuse prevention, and respect.',
      image_url: '/exco/bekwapu_lucy_beshiunim.jpg',
      order_index: 5,
    },
    {
      id: 'exco_logistics',
      name: 'Samuel Daberechukwu Oputa',
      role_title: 'Logistics Coordinator',
      unit_slug: 'logistics',
      bio: 'Directs the operational execution, transportation planning, venue coordination, and material logistics for all secondary school and campus events.',
      image_url: '/exco/samuel_daberechukwu_oputa.jpg',
      order_index: 6,
    },
    {
      id: 'exco_skills',
      name: 'Adakole Agene Michael',
      role_title: 'Skills Acquisition Advocacy Unit Head',
      unit_slug: 'skills_acquisition',
      bio: 'Drives competence beyond certificates, connecting students to high demand practical skills, digital literacy, and entrepreneurial capability.',
      image_url: '/exco/adakole_agene_michael.jpg',
      order_index: 7,
    },
    {
      id: 'exco_tech',
      name: 'Jeremiah Daniel Baba',
      role_title: 'Technical Director',
      unit_slug: 'technical',
      bio: 'Directs digital systems, audiovisual support, and operational technology for all MindSpark Hub physical seminars and virtual engagements.',
      image_url: '/exco/jeremiah_daniel_baba.jpg',
      order_index: 8,
    },
    {
      id: 'exco_welfare',
      name: 'Omomayowa Eunice Adewuyi',
      role_title: 'Welfare Coordinator',
      unit_slug: 'welfare',
      bio: 'Coordinates the support and stability arm of MindSpark Hub, ensuring member safety, mutual care, and community food bank initiatives.',
      image_url: '/exco/omomayowa_eunice_adewuyi.jpg',
      order_index: 9,
    },
    {
      id: 'exco_agent',
      name: 'MindSpark Agent',
      role_title: 'Field Representative',
      unit_slug: 'field_operations',
      bio: 'Represents the dedicated field agents who mentor students, facilitate seminar workshops, and model the MindSpark philosophy across classrooms.',
      image_url: '/exco/mindspark_agent.jpg',
      order_index: 10,
    },
  ];

  const insertExco = db.prepare(`
    INSERT OR REPLACE INTO exco_members (id, name, role_title, unit_slug, bio, image_url, order_index, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  for (const e of excos) {
    insertExco.run(e.id, e.name, e.role_title, e.unit_slug, e.bio, e.image_url, e.order_index);
  }

  console.log('--- Seeding Structural Units (8 Functional Units + 2 Administrative Arms) ---');
  const units = [
    {
      id: 'unit_acad',
      slug: 'academic_excellence',
      name: 'Academic Excellence Advocacy Unit',
      unit_head_name: 'Daniel Joseph Ayomide',
      description: 'Champions intellectual discipline, structured learning, and academic productivity across all MindSpark engagements, particularly within Secondary Schools Invasion and Campus Sparking.',
      core_functions: JSON.stringify([
        'Design academic excellence presentation slides for SSI and CS',
        'Organize training sessions and study strategy workshops',
        'Develop structured academic mentorship for members and students',
        'Provide academic performance monitoring tools',
        'Promote reading culture, innovation, and critical thinking'
      ]),
      guiding_rules: JSON.stringify([
        'Members must model academic discipline in their personal lives',
        'Members must be available for all SSI outreaches',
        'No promotion of mediocrity or anti intellectual culture',
        'All materials shared must be well researched and credible',
        'Punctuality and thorough preparation are mandatory for all outreaches'
      ]),
      order_index: 1,
    },
    {
      id: 'unit_skills',
      slug: 'skills_acquisition',
      name: 'Skill Acquisition Advocacy Unit',
      unit_head_name: 'Adakole Agene Michael',
      description: 'Drives competence beyond certificates. Ensures students and community members acquire relevant, in demand skills early in life, bridging the gap between knowledge and economic productivity.',
      core_functions: JSON.stringify([
        'Identify high demand skills relevant to Nigeria economy and global trends',
        'Organize practical skill based seminars and workshops',
        'Partner with certified trainers and industry professionals',
        'Promote entrepreneurial awareness and innovation among youth',
        'Connect students to internships and practical digital literacy initiatives'
      ]),
      guiding_rules: JSON.stringify([
        'Only verified and credible trainers must be invited for major outings',
        'No exploitation or financial manipulation of participants in CS, SSI and CE',
        'Skill programmes must strictly align with MindSpark values',
        'Continuous self development is compulsory for unit members'
      ]),
      order_index: 2,
    },
    {
      id: 'unit_gender',
      slug: 'gender_purity',
      name: 'Gender Based Vices and Sexual Purity Advocacy Unit',
      unit_head_name: 'Bekwapu Lucy Beshiunim',
      description: 'Promotes moral discipline, respect, dignity, and responsible conduct. Addresses issues of harassment, abuse awareness, and self control especially in secondary schools and campuses.',
      core_functions: JSON.stringify([
        'Organize awareness programmes against gender based vices and violence',
        'Educate students on respect, boundaries, and responsible conduct',
        'Promote moral discipline and healthy relationships',
        'Advocate against teenage marriage and school dropouts',
        'Provide guidance and ethical counselling referral support'
      ]),
      guiding_rules: JSON.stringify([
        'Members must model moral integrity and emotional maturity',
        'No victim blaming or insensitive communication during school engagements',
        'Strict confidentiality in sensitive matters is non negotiable',
        'Discussions must remain educational, respectful, and age appropriate'
      ]),
      order_index: 3,
    },
    {
      id: 'unit_comm',
      slug: 'communication_editorial',
      name: 'Communication and Editorial Unit',
      unit_head_name: 'Gladness Adeduni',
      description: 'Shapes the voice, narrative, and public perception of MindSpark Hub. Ensures clarity, consistency, brand integrity, and excellence across all publications and communications.',
      core_functions: JSON.stringify([
        'Develop official publications, articles, and educational content',
        'Design clean graphics and slides for seminar presentations',
        'Manage official messaging and institutional brand tone',
        'Edit seminar materials of all units prior to public release',
        'Document verified impact stories, programme reports, and archives'
      ]),
      guiding_rules: JSON.stringify([
        'No unauthorized public statements shall be made',
        'Accuracy, fact checking, and editorial review are compulsory',
        'Respectful and professional Nigerian English in all publications',
        'Strict adherence to writing rules prohibiting em dashes and copy hyphens'
      ]),
      order_index: 4,
    },
    {
      id: 'unit_tech',
      slug: 'technical',
      name: 'Technical Unit',
      unit_head_name: 'Jeremiah Daniel Baba',
      description: 'Provides digital, audiovisual, and operational tech support for all MindSpark Hub programmes, ensuring smooth execution and professional technical delivery.',
      core_functions: JSON.stringify([
        'Coordinate audiovisual projection and sound setup for seminars',
        'Maintain digital systems, website infrastructure, and media equipment',
        'Ensure seamless technical operations during school and campus outreaches',
        'Safeguard digital assets and technical documentation'
      ]),
      guiding_rules: JSON.stringify([
        'Technical setup must be fully completed before programme start time',
        'Equipment must be handled responsibly with care',
        'Members must remain calm and solution oriented under technical pressure',
        'No unauthorized access to digital systems or administrative files'
      ]),
      order_index: 5,
    },
    {
      id: 'unit_welfare',
      slug: 'welfare',
      name: 'Welfare Unit',
      unit_head_name: 'Omomayowa Eunice Adewuyi',
      description: 'The support and stability arm of MindSpark Hub. Ensures every member feels valued, supported, and protected, while coordinating community support and food bank efforts.',
      core_functions: JSON.stringify([
        'Coordinate welfare support and mutual care among members',
        'Manage community food bank donations for vulnerable students',
        'Facilitate outreach hospitality and logistics support',
        'Foster an encouraging and emotionally healthy community environment'
      ]),
      guiding_rules: JSON.stringify([
        'All personal matters shared within welfare counselling remain private',
        'Welfare support must never be abused, manipulated, or politicized',
        'Documentation of every welfare intervention must be accurately preserved'
      ]),
      order_index: 6,
    },
    {
      id: 'unit_logistics',
      slug: 'logistics',
      name: 'Logistics Unit',
      unit_head_name: 'Samuel Daberechukwu Oputa',
      description: 'Manages operational planning, venue booking, transportation, and physical execution of programmes, ensuring that ideas translate into well executed reality.',
      core_functions: JSON.stringify([
        'Coordinate seminar venues for SSI and CS with institutional authorities',
        'Plan transport logistics for volunteer agents and guest facilitators',
        'Manage distribution of outreach materials and seminar guides',
        'Oversee timeline enforcement and operational checklists'
      ]),
      guiding_rules: JSON.stringify([
        'Rigorous planning must precede every field execution',
        'Timelines must be strictly respected and enforced',
        'Complete accountability for materials and equipment is compulsory',
        'Proactive communication with all coordinating units'
      ]),
      order_index: 7,
    },
    {
      id: 'unit_evangelism',
      slug: 'evangelism',
      name: 'Evangelism Unit',
      unit_head_name: 'Victory Aleburu',
      description: 'Promotes spiritual consciousness, moral integrity, and Christlike character, ensuring that personal transformation is holistic across intellectual, moral, and spiritual dimensions.',
      core_functions: JSON.stringify([
        'Promote spiritual consciousness and character integrity within the Hub',
        'Coordinate prayer and intercession for all outreaches and state initiatives',
        'Conduct follow up and spiritual encouragement for participants seeking guidance',
        'Ensure holistic transformation across intellectual, moral, and spiritual life'
      ]),
      guiding_rules: JSON.stringify([
        'Live a life of genuine holiness and moral integrity',
        'Preach with love, humility, and deep respect for every individual',
        'Avoid doctrinal extremism, divisiveness, or controversial debates',
        'Maintain strict confidentiality in spiritual counselling'
      ]),
      order_index: 8,
    },
    {
      id: 'unit_secretariat',
      slug: 'secretariat',
      name: 'The Hub Secretariat',
      unit_head_name: 'Dimas Mercy (General Secretary)',
      description: 'The administrative backbone of MindSpark Hub. Ensures effective coordination, official correspondence, documentation, meeting minutes, and seamless inter unit communication.',
      core_functions: JSON.stringify([
        'Maintain official records of activities, meetings, and attendance',
        'Record and circulate meeting minutes promptly',
        'Handle official correspondence, memos, and institutional invitations',
        'Safeguard sensitive organizational records and constitutional guidelines'
      ]),
      guiding_rules: JSON.stringify([
        'Absolute confidentiality regarding executive council discussions',
        'Prompt documentation and distribution of approved directives',
        'Meticulous record keeping and digital archiving'
      ]),
      order_index: 9,
    },
    {
      id: 'unit_finance',
      slug: 'finance',
      name: 'The Financial Department',
      unit_head_name: 'Kayode Mary Ayomide (Financial Secretary)',
      description: 'Responsible for the prudent management, strict transparency, and strategic allocation of financial resources to ensure long term institutional sustainability.',
      core_functions: JSON.stringify([
        'Manage institutional income, contributions, and approved expenditures',
        'Prepare and present periodic transparent financial reports',
        'Develop and monitor programme based budgets for SSI and CS',
        'Ensure rigorous documentation for every financial transaction'
      ]),
      guiding_rules: JSON.stringify([
        'All financial dealings must strictly follow approved executive procedures',
        'Complete transparency, receipting, and auditing are mandatory',
        'Zero tolerance for financial mismanagement'
      ]),
      order_index: 10,
    },
  ];

  const insertUnit = db.prepare(`
    INSERT OR REPLACE INTO units (id, slug, name, unit_head_name, description, core_functions_json, guiding_rules_json, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of units) {
    insertUnit.run(u.id, u.slug, u.name, u.unit_head_name, u.description, u.core_functions, u.guiding_rules, u.order_index);
  }

  console.log('--- Seeding Verified Authentic Gallery Items ---');
  const gallery = [
    {
      id: 'gal_ssi_fgc_pano',
      title: 'SSI 1.0 Panoramic Assembly at Federal Government College Wukari',
      caption: 'Full college assembly hall during Secondary Schools Invasion 1.0 at Federal Government College Wukari, Taraba State.',
      alt_text: 'Panoramic view of students gathered in the assembly hall at Federal Government College Wukari during MindSpark Hub outreach',
      category: 'ssi',
      image_url: '/gallery/ssi_fgc_wukari_panoramic.jpg',
      is_minor_depicted: 1,
      consent_verified: 1,
      consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
    },
    {
      id: 'gal_ssi_agents',
      title: 'MindSpark Agents Deborah and Anna',
      caption: 'MindSpark Hub field agents Deborah and Anna engaging students on character discipline and academic excellence at FGC Wukari.',
      alt_text: 'MindSpark Hub agents Deborah and Anna addressing students during school seminar session',
      category: 'ssi',
      image_url: '/gallery/ssi_agents_deborah_anna.jpg',
      is_minor_depicted: 0,
      consent_verified: 1,
      consent_reference: 'STAFF-AUTH-2026',
    },
    {
      id: 'gal_ssi_godwin',
      title: 'MindSpark Agent Godwin Addressing the Assembly',
      caption: 'MindSpark Agent Godwin facilitating the practical skills and personal development session for senior students.',
      alt_text: 'MindSpark Agent Godwin standing before students facilitating an interactive learning session',
      category: 'ssi',
      image_url: '/gallery/ssi_agent_godwin.jpg',
      is_minor_depicted: 0,
      consent_verified: 1,
      consent_reference: 'STAFF-AUTH-2026',
    },
    {
      id: 'gal_ssi_interact1',
      title: 'Interactive Question and Answer Session at FGC Wukari',
      caption: 'Students asking thought provoking questions during the interactive dialogue session on overcoming regional limitations.',
      alt_text: 'Students participating enthusiastically in question and answer dialogue during seminar session',
      category: 'ssi',
      image_url: '/gallery/ssi_interactive_session_1.jpg',
      is_minor_depicted: 1,
      consent_verified: 1,
      consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
    },
    {
      id: 'gal_ssi_interact2',
      title: 'Seminar Engagement on Rejecting Anti Social Vices',
      caption: 'Secondary school students participating in the anti social vices educational session at Federal Government College Wukari.',
      alt_text: 'Secondary school students listening intently during the anti social vices awareness seminar',
      category: 'ssi',
      image_url: '/gallery/ssi_interactive_session_2.jpg',
      is_minor_depicted: 1,
      consent_verified: 1,
      consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
    },
    {
      id: 'gal_ssi_hall',
      title: 'Full Assembly Engagement at FGC Wukari',
      caption: 'Broad view of students and teachers gathered for the closing session and MindSpark Hub chant at Federal Government College Wukari.',
      alt_text: 'Large student body seated attentively during MindSpark Hub school invasion programme',
      category: 'ssi',
      image_url: '/gallery/ssi_hall_assembly.jpg',
      is_minor_depicted: 1,
      consent_verified: 1,
      consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
    },
    {
      id: 'gal_cs_fuw_pano',
      title: 'Campus Sparking at Federal University Wukari',
      caption: 'Panoramic view of undergraduate students gathered for Campus Sparking at Federal University Wukari, Taraba State.',
      alt_text: 'Undergraduate students seated in university lecture hall during Campus Sparking seminar',
      category: 'cs',
      image_url: '/gallery/cs_fu_wukari_panoramic.jpg',
      is_minor_depicted: 0,
      consent_verified: 1,
      consent_reference: 'FUW-CS-EVENT-VERIFIED',
    },
    {
      id: 'gal_cs_lecture',
      title: 'Beyond CGPA Seminar Session at FU Wukari',
      caption: 'Undergraduates exploring practical skills, value creation mentality, and career readiness at Federal University Wukari.',
      alt_text: 'University students listening intently to presentation on skills and career preparedness',
      category: 'cs',
      image_url: '/gallery/cs_lecture_hall_session.jpg',
      is_minor_depicted: 0,
      consent_verified: 1,
      consent_reference: 'FUW-CS-EVENT-VERIFIED',
    },
    {
      id: 'gal_cs_convergence',
      title: 'Participants Convergence and Mentorship Discussion',
      caption: 'Campus Sparking participants convening for small group mentorship and purpose alignment discussions.',
      alt_text: 'Undergraduate participants engaged in community mentorship dialogue after seminar session',
      category: 'cs',
      image_url: '/gallery/cs_participants_convergence.jpg',
      is_minor_depicted: 0,
      consent_verified: 1,
      consent_reference: 'FUW-CS-EVENT-VERIFIED',
    },
  ];

  const insertGallery = db.prepare(`
    INSERT OR REPLACE INTO gallery_items (
      id, title, caption, alt_text, category, image_url, is_minor_depicted, consent_verified, consent_reference, is_published, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  for (const g of gallery) {
    insertGallery.run(g.id, g.title, g.caption, g.alt_text, g.category, g.image_url, g.is_minor_depicted, g.consent_verified, g.consent_reference, now);
  }

  console.log('--- Seeding Verified Scheduled Events ---');
  const events = [
    {
      id: 'evt_cs_biweekly_1',
      programme_slug: 'cs',
      title: 'Bi Weekly Campus Sparking Convergence',
      venue: 'Selected Campus Hub Center, Federal University Wukari',
      start_time: '2026-11-14T10:00:00Z',
      end_time: '2026-11-14T12:00:00Z',
      description: 'General community coaching session held bi weekly on Saturdays from 10 AM to 12 PM. Open to undergraduates of all backgrounds for life mentorship, question addressing, and leadership skills development.',
      status: 'APPROVED',
      created_by: 'usr_prog_mgr',
      approved_by: 'usr_admin',
    },
    {
      id: 'evt_ssi_planning',
      programme_slug: 'ssi',
      title: 'Secondary Schools Invasion 2.0 Preparatory Outreach',
      venue: 'Designated Secondary College Hall',
      start_time: '2026-12-05T09:00:00Z',
      end_time: '2026-12-05T13:00:00Z',
      description: 'Proposed secondary school outreach focusing on early skills acquisition, study productivity, and anti social vices lifestyle prevention.',
      status: 'DRAFT',
      created_by: 'usr_prog_mgr',
      approved_by: null,
    },
  ];

  const insertEvent = db.prepare(`
    INSERT OR REPLACE INTO events (
      id, programme_slug, title, venue, start_time, end_time, description, status, created_by, approved_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const ev of events) {
    insertEvent.run(ev.id, ev.programme_slug, ev.title, ev.venue, ev.start_time, ev.end_time, ev.description, ev.status, ev.created_by, ev.approved_by, now, now);
  }

  console.log('--- Seeding Insights and Educational Articles ---');
  const articles = [
    {
      id: 'art_beyond_cgpa',
      slug: 'beyond-cgpa-unlocking-skills-and-purpose',
      title: 'Beyond CGPA: Why Nigerian Undergraduates Must Build Practical Competence Early',
      excerpt: 'Higher education is shifting globally. For Nigerian university students, academic excellence must be complemented with problem solving capability and practical relevance.',
      content: `<p>A high cumulative grade point average represents academic discipline and consistency. Yet, as thousands of graduates enter the economy annually, a certificate alone is no longer sufficient capital.</p>
<h2>The Transition from Certificate Mentality to Value Mentality</h2>
<p>MindSpark Hub advocates a decisive shift from certificate mentality to value mentality. Employers and communities do not reward paper qualifications in isolation; they reward solutions to urgent societal challenges.</p>
<p>Through Campus Sparking, undergraduates learn to identify high demand skills, cultivate digital literacy, and align their academic studies with real world economic productivity.</p>
<h2>Building Multidimensional Competence</h2>
<p>True career readiness requires four pillars: intellectual rigour, practical technical competence, emotional maturity, and strong character capital. When students pursue these deliberately, they graduate not merely educated, but genuinely empowered.</p>`,
      author_name: 'Gladness Adeduni',
      category: 'Skills and Career',
      featured_image: '/gallery/cs_lecture_hall_session.jpg',
      reading_time_mins: 4,
      published_at: '2026-10-15T09:00:00Z',
    },
    {
      id: 'art_catch_them_young',
      slug: 'catch-them-young-instilling-vision-in-teenagers',
      title: 'Catch Them Young: Instilling Academic Discipline Before Doubt Takes Root',
      excerpt: 'Secondary school represents the most critical developmental stage for teenagers. Planting seeds of purpose early transforms their trajectory for life.',
      content: `<p>The teenage years represent a pivotal window. It is during secondary school that young minds either embrace purposeful ambition or succumb to apathy, mediocre expectations, and negative peer influences.</p>
<h2>Destiny Alignment at an Early Stage</h2>
<p>Our Secondary Schools Invasion is not merely outreach; it is destiny alignment at an early stage. When we introduce teenagers to structured learning habits and practical skills, we dismantle the false belief that their geographical background dictates their ceiling.</p>
<p>Students learn that regional barriers cannot prevent greatness when matched with disciplined habits, curiosity, and ethical conviction.</p>
<h2>The Shield of Character</h2>
<p>Academic brilliance without moral grounding leaves young people vulnerable to destructive lifestyles. By openly addressing anti social vices and peer pressure, we equip students with the courage to make honourable choices.</p>`,
      author_name: 'Daniel Joseph Ayomide',
      category: 'Academic Excellence',
      featured_image: '/gallery/ssi_fgc_wukari_panoramic.jpg',
      reading_time_mins: 5,
      published_at: '2026-10-20T10:00:00Z',
    },
    {
      id: 'art_character_capital',
      slug: 'character-as-capital-rejecting-anti-social-vices',
      title: 'Character as Capital: The Urgent Need to Reject Anti Social Lifestyles',
      excerpt: 'Talent may open doors, but character preserves enduring impact. A deep look into building moral resilience among youth.',
      content: `<p>In modern society, young people encounter immense social pressure. The glamorization of shortcut wealth, cyber misconduct, and substance abuse has derailed many promising futures.</p>
<h2>The True Price of Compromise</h2>
<p>Compromising one personal dignity for temporary social approval is an expensive trade. Anti social lifestyles erode trust, destroy focus, and dismantle promising careers before they even begin.</p>
<p>MindSpark Hub maintains that character is foundational capital. Young people who cultivate self discipline, honesty, and emotional maturity stand out in every professional and civic arena.</p>`,
      author_name: 'Bekwapu Lucy Beshiunim',
      category: 'Character and Ethics',
      featured_image: '/gallery/ssi_interactive_session_2.jpg',
      reading_time_mins: 4,
      published_at: '2026-10-25T11:00:00Z',
    },
  ];

  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO articles (
      id, slug, title, excerpt, content, author_name, category, featured_image, reading_time_mins, is_published, published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);
  for (const art of articles) {
    insertArticle.run(art.id, art.slug, art.title, art.excerpt, art.content, art.author_name, art.category, art.featured_image, art.reading_time_mins, art.published_at, now);
  }

  console.log('--- Initializing Genesis Audit Log Entry ---');
  const genesisPayload = `GENESIS_HASH_MINDSPARK_HUB_2026|sys_bootstrap|SYSTEM|SYSTEM_INIT|mindspark_db|all|127.0.0.1|SUCCESS|${now}`;
  const genesisHash = crypto.createHash('sha256').update(genesisPayload).digest('hex');

  db.prepare(`
    INSERT OR REPLACE INTO audit_logs (
      id, actor_id, actor_role, action, target_entity, target_id, ip_address, details, outcome, previous_hash, entry_hash, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'log_genesis',
    'sys_bootstrap',
    'SYSTEM',
    'SYSTEM_INIT',
    'database',
    'mindspark_db',
    '127.0.0.1',
    'Initial database seed and verification complete with authentic orientation assets',
    'SUCCESS',
    'GENESIS_HASH_MINDSPARK_HUB_2026',
    genesisHash,
    now
  );

  console.log('Database seed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
