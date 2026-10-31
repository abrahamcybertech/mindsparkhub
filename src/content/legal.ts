export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: 'privacy' | 'terms' | 'security';
  title: string;
  eyebrow: string;
  updated: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocument['slug'], LegalDocument> = {
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
          'Every person whose personal records are held by MindSpark Hub may exercise the following rights:',
        ],
        bullets: [
          'Right of access and correction: request a copy of your submitted data or ask for inaccurate records to be corrected.',
          'Right to erasure: request permanent deletion of your contact or volunteer records, subject to lawful retention duties.',
          'Right to withdraw consent: withdraw consent for future processing at any time.',
        ],
      },
      {
        heading: '6. Retention',
        paragraphs: [
          'Inquiry and application records are kept for 24 months after resolution, unless a legal or safeguarding duty requires longer retention. Audit records are retained for security and accountability. Photographs of minors are retained only while institutional consent remains active.',
        ],
      },
      {
        heading: '7. Data Protection Contact',
        paragraphs: [
          'To exercise any data protection right or report a safeguarding concern, contact our privacy officer at privacy@mindsparkhub.org.',
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Use',
    eyebrow: 'Legal Terms',
    updated: 'October 2026',
    summary: 'The conditions that govern use of the MindSpark Hub website and mobile app.',
    sections: [
      {
        heading: '1. Institutional Identity',
        paragraphs: [
          'This platform is the official digital service of MindSpark Hub, an educational youth development organisation. All materials, curricula, presentation slides, articles, and photographic media are protected by copyright and institutional ownership.',
        ],
      },
      {
        heading: '2. Acceptable Conduct',
        paragraphs: [
          'Visitors may explore public information, share educational articles with proper attribution, and submit inquiries for legitimate engagement. Any attempt to probe system boundaries, inject malicious code, harvest data without authorisation, or spam contact channels is prohibited.',
        ],
      },
      {
        heading: '3. Protection of Minors',
        paragraphs: [
          'Photographs showing students are published under formal educational consent. Copying, scraping, reproducing, or redistributing images of minors for commercial or unauthorised purposes may lead to legal action under the Child Rights Act and applicable cybercrime laws.',
        ],
      },
      {
        heading: '4. Events and Programme Information',
        paragraphs: [
          'An event is shown as confirmed only after an authorised administrator approves its date and venue. Programme schedules may change. Always check the app or website for the latest confirmed information.',
        ],
      },
      {
        heading: '5. Contact for Legal Inquiries',
        paragraphs: [
          'For legal inquiries about intellectual property or partnerships, contact the Secretariat at secretariat@mindsparkhub.org.',
        ],
      },
    ],
  },
  security: {
    slug: 'security',
    title: 'Security and Responsible Disclosure',
    eyebrow: 'Cybersecurity and Trust',
    updated: 'October 2026',
    summary:
      'Our security approach, the protections in the mobile app, and how to report a vulnerability responsibly.',
    sections: [
      {
        heading: '1. Our Security Philosophy',
        paragraphs: [
          'Security is built into the foundation of every database query, authentication handshake, and media pipeline. We follow OWASP ASVS Level 2 as our system baseline and apply Level 3 practices to staff authentication and access boundaries. The mobile app uses OWASP MASVS Level 1 as its minimum baseline, with the Level 2 controls that apply to the staff area.',
        ],
      },
      {
        heading: '2. Staff Authentication',
        bullets: [
          'Every staff account requires a password and a time based one time password.',
          'The mobile app issues a short lived access token and a rotating refresh token. Refresh tokens are single use and reuse revokes the whole token family.',
          'Tokens are stored only in the operating system secure store. Staff caches are cleared on sign out.',
          'Staff screens are hidden when the app moves to the background. Screenshot prevention is applied where the platform allows it.',
        ],
      },
      {
        heading: '3. Safeguarded Image Pipeline',
        paragraphs: [
          'The public gallery returns only published items. Photographs showing minors are returned only when institutional consent has been verified. Upload processing checks file signatures, strips metadata, and stores files under random names.',
        ],
      },
      {
        heading: '4. Responsible Vulnerability Disclosure',
        paragraphs: [
          'We welcome responsible security researchers who identify potential vulnerabilities. We ask that you:',
        ],
        bullets: [
          'Report suspected vulnerabilities promptly to our security team.',
          'Avoid accessing, copying, or altering personal data belonging to citizens or minors.',
          'Give us at least 30 days to remediate before public disclosure.',
          'Do not run denial of service attacks or degrade public service availability.',
        ],
      },
      {
        heading: '5. Reporting a Vulnerability',
        paragraphs: [
          'Send full technical details, steps to reproduce, and proof of concept to security@mindsparkhub.org. Our machine readable security contact record is published at /.well-known/security.txt.',
        ],
      },
      {
        heading: '6. Honest Limits',
        paragraphs: [
          'No app is perfectly secure. Expo Go is a development and review sandbox, so protections that need custom native code, such as certificate pinning, root detection, and remote push notifications, are not claimed for the Expo Go milestone. They are documented as production build work. Release builds use Hermes bytecode and minification, which raise the cost of reverse engineering but are not a security boundary.',
        ],
      },
    ],
  },
};
