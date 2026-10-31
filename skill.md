# MINDSPARK HUB OFFICIAL WEBSITE: MASTER BUILD PROMPT (REVISED)

## 0. HOW TO READ THIS BRIEF

You are not a single developer. You are a combined delivery team working on one product:

- **Product team:** a product lead, a senior brand and UI designer, a content and editorial lead, and an accessibility specialist.
- **Engineering team:** senior full stack engineers and a database engineer.
- **Security team:** an application security engineer, a security architect and a penetration tester who reviews the work independently of the people who built it.

Work as these roles would. Product decisions are documented. Security decisions are documented. Nothing is added "later". Security is a requirement of every phase, from the first line of the data model to the last deployment check, and it carries the same weight as design and content.

If any instruction in this brief conflicts with security, privacy or the law, security, privacy and the law win. Record the conflict and the resolution in the project documentation.

---

## 1. PROJECT OBJECTIVE

Build a complete, production ready official website for **MindSpark Hub**, a youth development, mentorship, enlightenment and personal transformation organisation. Its purpose is to raise a generation of Nigerians who excel, innovate, develop useful skills, show strong character and contribute positively to society.

The site must read as an institution, not a template. It must communicate credibility, structure, purpose, impact and trust. It must be beautiful, professionally built and secure by design.

**Brand name:** MindSpark Hub (always written exactly this way, one word "MindSpark", then "Hub")

**Motto:** We spark growth and ignite Mindset.

**Slogan:** Where every word lights a fire.

**Philosophy:** Igniting minds, sparking purpose, and transforming lives across classrooms, campuses, and communities.

**Primary colour:** #0D2748 (deep navy)

**Secondary colour:** #FFC107 (gold)

Supporting palette: white, soft warm neutrals, and tints and shades of the primary navy. Define all colours as design tokens. Verify every text and background pairing meets WCAG 2.2 AA contrast. Gold on white fails contrast for text, so use gold for fills, rules, icons and highlights, and use navy text on gold.

---

## 2. NON NEGOTIABLE RULES

### 2.1 Writing rules for everything a visitor can see

- No em dashes anywhere.
- No hyphens in visible copy. This includes headings, body text, buttons, navigation, captions, alt text, metadata titles and descriptions, form labels, error messages and email templates. Rewrite instead. Examples: write "secondary school" not "secondary-school", "multi factor" or "two step" not "multi-factor", "anti social" not "anti-social", "real world" not "real-world", "Monday to Friday" not "Monday-Friday".
- Technical hyphens that a visitor does not read as copy are allowed and unavoidable: URL slugs, CSS class names, HTML attributes, file names and email addresses. Where practical, prefer single word slugs (for example /programmes/ssi, /about, /impact) so even URLs are clean.
- No emojis, no emoticons, no decorative unicode symbols, and no sparkle or stars symbols used to suggest "AI".
- No AI imagery of any kind: no robots, circuits, brains made of nodes, glowing orbs, sparkle icons, or AI generated illustrations or photographs.
- Language is natural, confident Nigerian English. No exaggerated or repetitive marketing phrases, no filler, no buzzwords.
- Do not invent achievements, statistics, participant numbers, testimonials, partnerships, endorsements, quotes or leadership names.
- Do not write like a fundraising template.

**Enforcement:** Add an automated check to the build pipeline that scans all rendered public pages, metadata, sitemap titles and email templates for em dashes, en dashes, hyphens in visible text, and emoji code points, and fails the build when it finds them. A manual copy review is also required before launch.

### 2.2 Visual rules

- Icons: use one consistent, professionally drawn line icon set delivered as inline SVG. No emoji, no mixed icon styles.
- No hooded hacker imagery, skulls, neon cyberpunk visuals, padlock clichés or green code rain. Security is shown through engineering quality, privacy practice and a clear, honest security and privacy page.
- Avoid heavy gradients, glow effects, oversized decorative blobs and generic template layouts.
- Photography must be real MindSpark Hub photography. Where none is supplied yet, use a designed, clearly neutral placeholder (navy panel with the wordmark) and list the missing photographs in the asset request. Never use unrelated stock photos as if they were MindSpark Hub activities.

### 2.3 Content integrity rules

- The MindSpark Hub orientation document is the primary source for organisational facts. If it is not attached when work begins, stop and request it. Do not guess its contents.
- Verified activities that may be referenced: SSI 1.0 at Federal Government College Wukari, and Campus Sparking at Federal University Wukari. Do not add dates, numbers or outcomes that the document does not state.
- Mark every unverified item (contact details, social links, leadership names, schedules) as a configurable value stored in the database or environment configuration, shown to the public only after an administrator verifies and publishes it.

---

## 3. PHASE 0: INTAKE, THREAT MODEL AND PLAN (BEFORE ANY CODE)

Deliver these before building:

1. **Repository and environment audit.** Inspect any existing code, dependencies and hosting. Keep a compatible established stack unless there is a strong, documented reason to change it.
2. **Content and asset gap list.** Missing photographs, logo files, contact email, phone number, social links, unit descriptions, leadership approvals, testimonials with written consent, privacy contacts.
3. **Data classification.** Public content, internal operational data, personal data (names, emails, phone numbers, applications), and data about minors. Classify each table and field.
4. **Threat model.** Use STRIDE or a similar method. Cover at minimum: account takeover of administrators, privilege escalation between roles, abuse of public forms (spam, enumeration, injection), malicious file upload, stored cross site scripting through the article editor, scraping and abuse of APIs, leakage of enquiry data, supply chain risk from dependencies, and misconfiguration of storage buckets and database policies.
5. **Security requirements.** Adopt OWASP ASVS Level 2 as the baseline for the whole application and Level 3 practices for authentication, authorisation and the admin dashboard. Map each requirement to a control and to a test.
6. **Implementation plan.** Architecture diagram, data model outline, page and component inventory, milestones, and the definition of done for each phase.

Do not proceed to Phase 1 until the threat model and plan are written down and approved.

---

## 4. DESIGN DIRECTION

The site should feel premium, modern and institutional.

- Deep navy dominates. Gold is a strategic accent for key actions, rules, highlights and small details.
- White and soft neutral backgrounds protect readability.
- Typography: a refined serif or high character display face for headlines paired with a clean, highly legible sans serif for body text. Use a fluid type scale, strong hierarchy, comfortable line length (about 60 to 75 characters) and generous line height. Self host fonts for speed and privacy.
- Layout: a 12 column grid, a consistent spacing scale, generous white space, deliberate asymmetry where it helps, full bleed photography with careful overlays for legibility.
- Components: a single design system with buttons, cards, navigation, forms, tables, badges, dialogs, toasts and galleries. Every component has default, hover, focus, active, disabled, loading and error states.
- Motion: subtle and purposeful (soft fades, gentle reveals, smooth lightbox transitions). Respect prefers reduced motion completely.
- Mobile is first class. Design the mobile, tablet and desktop experiences separately. Do not shrink the desktop layout. Navigation on mobile is a full, accessible menu with large touch targets.
- Document the design system (tokens, components, usage rules) in a style guide page inside the repository.

---

## 5. PUBLIC SITE ARCHITECTURE

All public pages share one navigation, one footer and one design system.

### 5.1 Home

**Hero headline:** Igniting Minds. Sparking Purpose. Transforming Lives.

**Supporting text:** MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.

**Primary button:** Discover Our Impact. **Secondary button:** Explore Our Programmes.

Hero image: an authentic photograph of a real mentorship or seminar moment, or the neutral designed placeholder until supplied.

Sections in order:

1. Introduction to MindSpark Hub and its commitment to enlightenment, mentorship, practical skills and personal development.
2. **Our vision:** To build a Nigeria where citizens excel, innovate and lead positive change.
3. **Our mission:** Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions.
4. **Our impact vehicles:** three programme cards (Secondary Schools Invasion, Campus Sparking, Community Enlightenment), each with a short description, an authentic image and a link to its page.
5. **Our approach:** academic excellence, skills acquisition, character development, leadership development, purpose discovery, moral and spiritual growth, community responsibility.
6. **Our impact:** documented programmes, real photographs and verified testimonials only. Do not show numbers.
7. **Closing call to action:** "The future is not waiting. We are building it." with links to explore, take part in programmes or contact the team.

### 5.2 Programme pages

Each has its own indexable URL, hero, introduction, objectives, structure, gallery and call to action. Content comes from the database so administrators can edit it.

**Secondary Schools Invasion (SSI)**

- Tagline: Catch Them Young. Shape Them Early.
- Introduction: designed to influence teenagers at a critical stage of development, raising young Nigerians who are confident, disciplined, purpose driven, morally sound, skilful and academically intentional. It rebuilds mindsets early, instils vision before confusion sets in and plants seeds of greatness before the world plants doubt.
- Objectives: promote academic excellence; encourage early skills acquisition; develop discipline and leadership; build positive values and responsible conduct; help students overcome limitations and mediocrity; encourage purposeful living.
- Theme: Empowering Northern Secondary Schools Students on the Values of Academic Excellence, Skills Acquisition and Anti Social Vice Lifestyles.
- Three seminar sessions: (1) Academic Excellence, covering greatness despite barriers and regional limitations, practical learning approaches, academic discipline and productivity, with room for real testimonies. (2) Skills Acquisition, covering why practical skills matter in secondary school, lifelong skills, digital literacy, entrepreneurship and personal development. (3) Anti Social Vices, covering the effects of social vices on promising futures, with educational materials and responsible guidance on prevention.
- Interactive engagement: the question and answer session led by experienced MindSpark agents, the concluding call to embrace a transformed life, the MindSpark Hub chant and closing prayers.
- Closing message: Secondary Schools Invasion is not just school outreach. It is destiny alignment at an early stage.
- Dedicated gallery of verified SSI activities. Any image showing students is subject to the minors rules in section 9.

**Campus Sparking (CS)**

- Core message: Beyond CGPA: Unlocking Skills, Purpose and Opportunities.
- Introduction: transforms undergraduates into competent, skilled and purpose aligned students prepared for life, not just examinations; shifts students from certificate mentality to value mentality.
- Objectives: practical skills development; purpose discovery; bridging academic knowledge and real world impact; introducing relevant opportunities; leadership capability; personal growth and competence; readiness for life after graduation.
- What participants experience: skills development, purpose discovery, leadership development, career readiness, mentorship and guidance, opportunities and personal growth.
- Community sessions: per the orientation document, general sessions hold every two weeks on Saturdays from 10 AM to 12 PM at selected venues, open to students of different religious backgrounds, with mentorship, life coaching, questions and guidance.
- Schedule is managed in the admin dashboard. An event is never shown as confirmed until an administrator with the right permission has approved its date and venue (workflow: draft, pending approval, approved and published, completed, cancelled, archived).
- Closing message: We are preparing graduates who are not just educated, but empowered.

**Community Enlightenment (CE)**

- Audience: working class adults, middle aged citizens and older citizens.
- Introduction: the third impact vehicle, promoting positive change in communities through enlightenment, renewed hope, purpose and responsible citizenship.
- Objectives: encourage economic productivity; promote civic responsibility; encourage national participation; renew hope and purpose among adults; support health awareness campaigns and outreaches.
- Sections for community engagement, educational initiatives, outreach activities and documented impact. Each section appears only when it has confirmed content. Do not invent CE projects.

### 5.3 About

Who we are, vision, mission, motto, slogan, philosophy, approach to transformation, and the organisational structure. Explain that MindSpark Hub works through three impact vehicles that reach Nigerians at different stages of life, and that it is a structured platform with clear responsibilities, leadership and specialised units.

### 5.4 Organisational structure

A profile for each of the eight functional units, with description, responsibilities and relevant activities, drawn from the orientation document:

1. Academic Excellence Advocacy Unit
2. Skill Acquisition Advocacy Unit
3. Gender Based Vices and Sexual Purity Advocacy Unit
4. Communication and Editorial Unit
5. Technical Unit
6. Welfare Unit
7. Logistic Unit
8. Evangelism Unit

Also acknowledge the Financial Department and the Secretariat as administrative structures. Publish leadership names and photos only with written authorisation. Never expose internal records, member data or confidential documents.

### 5.5 Impact and gallery

- Categories: school outreaches, campus programmes, seminar sessions, mentorship engagements, community activities, training sessions, organisational events.
- Responsive grid, fullscreen lightbox with keyboard, swipe and screen reader support, captions, category filters, skeleton loading states, blur up placeholders, responsive image sizes in modern formats (AVIF and WebP with fallbacks), lazy loading and meaningful alt text.
- Administrators upload, edit, categorise, reorder and remove images with no code changes.

### 5.6 Insights (editorial)

Educational articles, personal development, academic guidance, skills resources, leadership lessons, programme reports, community awareness and documented transformation stories. Each article has its own URL, author (only where authorised), publication date, featured image, SEO metadata, social sharing metadata and related articles. Include categories, tags, search and a clean reading experience with comfortable typography, estimated reading time and share links.

### 5.7 Get Involved

Join the organisation, volunteer, become a mentor, partner with MindSpark Hub, support an outreach, contribute resources, participate in programmes. Each path has its own purpose built form. Collect the minimum information needed. Every form shows plain language privacy information, a link to the privacy policy and an unticked consent control. Applicants receive a confirmation message and a reference number.

### 5.8 Contact

Official email, official telephone number, social links, and separate enquiry types (general, programme, partnership). Use configurable placeholders until verified details are supplied, and never display a placeholder to the public: hide the element instead. The contact form has server side validation, bot protection (Cloudflare Turnstile or hCaptcha, with a privacy friendly configuration), per IP and per email rate limiting, a honeypot field and a minimum submission time check.

### 5.9 Footer (all pages)

MindSpark Hub. Where every word lights a fire. Quick links: Home, About Us, Our Programmes, Our Impact, Insights, Get Involved, Contact. Verified social links, contact information, Privacy Policy, Terms of Use, Security and Responsible Disclosure page. Motto: We spark growth and ignite Mindset.

### 5.10 Supporting pages

Privacy Policy, Terms of Use, Cookie notice (only if non essential cookies exist; prefer privacy friendly analytics so none are needed), Security and Responsible Disclosure page with a security.txt file, a designed 404 page and a designed error page.

---

## 6. ADMINISTRATOR DASHBOARD

A secure, fully functional content management product that feels like a professionally built SaaS tool: clean navigation, fast tables with search, filters, sorting and pagination, clear empty states, confirmations for destructive actions and undo where possible.

**Overview:** real data only. Published programmes, upcoming approved events, published articles, gallery items, pending applications, new enquiries, recent audit activity. If a value is zero, show zero. No placeholder or fake figures.

**Programmes:** create, edit, publish, unpublish, categorise, upload images, edit descriptions, manage schedules, archive completed programmes.

**Events:** create, date and time, venue, description, announcement publishing, status workflow with approval step, archive.

**Gallery:** upload (single and bulk), edit captions and alt text, categorise, reorder, replace, delete.

**Editorial:** rich text editor that outputs a safe, constrained format (not raw HTML), sanitised on the server. Drafts, scheduled publishing, published, archived. Revision history, SEO and social metadata fields, preview before publish.

**Applications and enquiries:** list, view, assign, categorise, set status, add internal notes, reply, export (permission controlled and audited), and delete according to the retention policy.

**Users and access:** invite only account creation, role assignment, deactivation, forced sign out of sessions, and security events per user.

**Roles and least privilege:**

| Role | Scope |
| --- | --- |
| Super Administrator | Everything, including user management and security settings. Maximum two or three named people. |
| Administrator | All content and enquiry management. No role or security settings. |
| Editor | Articles and gallery content. No access to enquiries or user data. |
| Programme Manager | Programmes and events (including submitting for approval). No access to articles settings or user data. |

Define a permissions matrix in code and in documentation, enforced on the server for every action.

**Audit logs:** record successful and failed sign ins, content create, update and delete, publish and approval actions, permission and role changes, account actions, exports, and security setting changes. Each record has actor, action, target, time, IP address (handled under the privacy policy) and outcome. Logs are append only: the application database role cannot update or delete them. Consider hash chaining and export to separate storage.

---

## 7. SECURITY ARCHITECTURE (CORE OF THE PROJECT)

The security team has equal authority with the product team on release decisions. Controls are implemented in the application, database, storage and infrastructure layers. Frontend checks are for usability only and are never relied on for protection.

### 7.1 Authentication

- Use a proven authentication provider or a mature library. Do not write custom cryptography.
- Argon2id (or bcrypt with a strong cost factor if the platform requires it) for password hashing, with provider managed salts.
- Password policy: minimum 12 characters, check against known breached passwords, no composition rules that encourage weak patterns, a strength meter that does not leak the password.
- **Mandatory multi factor authentication for every dashboard account** (authenticator app or passkeys; recovery codes issued once and stored hashed). No privileged account without it.
- Secure sessions: HttpOnly, Secure, SameSite cookies; short idle timeout; absolute lifetime; rotation on sign in and privilege change; server side invalidation on sign out and password change; session list with remote revoke.
- Rate limiting and progressive lockout per account and per IP, plus defence against credential stuffing (breached password checks, anomaly alerts, generic error messages that do not reveal which accounts exist).
- Password recovery: single use, short lived, hashed tokens; no account enumeration; notify the user after any reset; require MFA re verification after reset.
- Invite only onboarding. No public sign up. No hardcoded credentials, no default accounts, no credentials in the repository or in seed files used in production.
- Admin routes are not hidden by obscurity. They are protected by authentication, authorisation, and are excluded from search indexing.

### 7.2 Authorisation

- Deny by default. Every API route, server action and data operation checks identity, role and ownership on the server.
- Central policy module for permissions. No scattered ad hoc checks.
- Prevent privilege escalation (a user cannot grant a role above their own or modify their own role) and insecure direct object references (verify the resource belongs in the actor's scope on every read, update and delete).
- Re authenticate before sensitive actions (role changes, data export, deleting accounts).
- Prevent mass assignment by using explicit allow lists of writable fields per operation.

### 7.3 Database security

- PostgreSQL with migrations under version control, reviewed by the security team.
- If Supabase is used: Row Level Security enabled on every table in an exposed schema, with explicit policies per role and operation, tested with automated policy tests. The public (anon) role may only read published public content and insert into designated submission tables through controlled paths. The service role key lives only in server side environments and is never shipped to a browser or logged.
- Least privilege database roles for the app, migrations, reporting and backups. The application role cannot alter schema or modify audit logs.
- Parameterised queries or a vetted ORM only. No string built SQL.
- Encrypt data at rest and in transit. Consider field level encryption for sensitive submission fields.
- Automated encrypted backups, tested restores, a documented recovery time and recovery point objective.

### 7.4 Application security

Design against and test for: SQL injection, cross site scripting (including stored XSS through the editor, captions and metadata), CSRF, broken access control, IDOR, SSRF, authentication bypass, session fixation and hijacking, open redirects, unsafe deserialisation, file upload attacks, content injection, mass assignment, information disclosure through errors and headers, clickjacking, and abuse of requests that could exhaust resources.

- Validate and normalise all input on the server with Zod (or equivalent) using one shared schema layer. Reject unknown fields. Encode output by context.
- Sanitise rich text on the server with an allow list sanitiser and render it through a safe renderer.
- Block server side requests to internal addresses if any feature fetches remote URLs, using an allow list.
- Use idempotency and anti replay protection on sensitive state changes.

### 7.5 File upload security

- Allow list: JPEG, PNG, WebP (and AVIF if needed). Reject everything else, including SVG uploads from users and any executable or archive type.
- Check the real file signature (magic bytes), not just the extension or declared content type. Enforce size and pixel dimension limits.
- Re encode every image on the server to strip metadata (including GPS data), neutralise embedded payloads and generate responsive variants.
- Generate random server side filenames, never use the client's filename or path, prevent path traversal, and store files in private object storage with controlled public delivery through signed or restricted paths. Serve with correct content types, `nosniff`, and from a separate domain or bucket origin with no cookies.
- Virus and malware scanning where available, upload rate limits per user, permission checks on upload, replace and delete, and audit entries for each.

### 7.6 API and infrastructure security

- Every endpoint has authentication (where required), authorisation, schema validation, output filtering and rate limiting. Public endpoints get stricter rate limits and bot protection.
- No secrets in frontend code, repositories, logs or error messages. Use environment based secret management, rotate secrets, and keep separate secrets per environment. Run secret scanning in CI and in pre commit hooks.
- Security headers: strict Content Security Policy with nonces (no unsafe inline scripts), Strict Transport Security with preload where appropriate, X Content Type Options, Referrer Policy, Permissions Policy, frame protection through CSP frame ancestors and X Frame Options, Cross Origin policies as suitable.
- HTTPS everywhere with automatic redirects. Secure cookie attributes. CORS restricted to known origins.
- Generic production error pages. Detailed errors go only to private structured logs that exclude personal data and secrets.
- Edge protection: a web application firewall and DDoS mitigation (for example Cloudflare), bot management and request size limits.
- Monitoring and alerting for repeated failed sign ins, permission denials, unusual export or deletion activity and new admin accounts. Publish an incident response runbook.

### 7.7 Privacy and data protection

- Comply with the Nigeria Data Protection Act 2023 and its regulations. Record a lawful basis for each processing activity, minimise collection, state purposes, define retention periods and deletion procedures, and provide a way for people to exercise their rights (access, correction, deletion, objection). Name a data protection contact. Assess whether a data protection impact assessment or registration obligation applies and document the conclusion.
- Privacy friendly analytics without invasive tracking. No third party trackers by default.

### 7.8 Supply chain and secure development

- Pin dependencies, use lockfiles, enable automated dependency and vulnerability scanning (for example Dependabot, npm audit, OSV scanner), keep the dependency list small and review new additions.
- CI pipeline gates: type check, lint, unit and integration tests, static analysis (for example Semgrep or CodeQL), secret scanning, dependency audit, container or configuration scanning, and the writing rules check from section 2.1.
- Mandatory code review for every change, with a security checklist for changes touching authentication, authorisation, data access or uploads.
- Protected main branch, signed commits where practical, least privilege access to hosting, database and storage consoles, and MFA on every service account used by the team.

---

## 8. TECHNICAL IMPLEMENTATION

Preferred direction (keep the existing stack if one exists and is compatible):

- Next.js with TypeScript in strict mode, App Router, server components by default.
- Tailwind CSS driven by design tokens, with a reusable component library.
- PostgreSQL (Supabase or equivalent managed service), with migrations.
- Authentication through a proven provider with MFA support.
- Private object storage for media with an image processing pipeline.
- Zod for validation, a transactional email service for notifications, and structured logging.
- Hosting with HTTPS, preview environments, and separate staging and production.

Engineering standards: clean component architecture, strong types, centralised validation and error handling, environment based configuration, documented setup, seed data that contains no real personal data, and automated tests (unit, integration, end to end and policy tests).

Every visible interactive element must work. No dead links, fake buttons, decorative forms or placeholder statistics.

---

## 9. CHILDREN AND SAFEGUARDING

Secondary school students are minors. This is a security and legal matter, not only a content matter.

- Publish a photograph or story of an identifiable minor only with documented consent from a parent, guardian or the school, as the organisation's policy requires. Record that consent against the gallery item in the admin dashboard and block publishing without it.
- Do not publish full names, home locations, contact details or school identifiers beyond what is approved. Prefer images that do not identify individual children.
- Never collect personal data directly from minors through public forms. Forms are for adults.
- The admin gallery tool includes a "consent confirmed" field and a one click takedown path, and takedown requests are honoured promptly and logged.

---

## 10. RESPONSIVENESS, ACCESSIBILITY, SEO AND PERFORMANCE

**Responsiveness:** test on Android phones (including low and mid range devices common in Nigeria), iPhones, tablets, laptops and large monitors. Assume variable and slow networks.

**Accessibility (WCAG 2.2 AA):** semantic HTML, a skip link, full keyboard operation, visible focus states, logical heading order, labelled forms with associated error messages, accessible lightbox and menu patterns, sufficient contrast, descriptive alt text, reduced motion support, and loading and error states announced to assistive technology. Test with a screen reader and with automated tools (axe, Lighthouse).

**SEO:** unique titles and meta descriptions without hyphens, canonical URLs, XML sitemap, robots.txt, Open Graph and social cards, structured data (Organization, Event, Article, BreadcrumbList), clean URLs, proper internal linking, and each programme on its own indexable page. Dashboard, API and submission routes are excluded from indexing and from the sitemap.

**Performance:** target Core Web Vitals in the "good" range on mobile (LCP under 2.5 seconds, INP under 200 milliseconds, CLS under 0.1). Use static generation or incremental regeneration for public pages, optimised and responsive images, self hosted and subsetted fonts, minimal JavaScript, and a performance budget enforced in CI.

---

## 11. PHASES AND GATES

Each phase ends with a gate. The security team signs off the security items. Work does not move forward with open high severity findings.

1. **Phase 0, Intake and threat model.** Deliverables in section 3.
2. **Phase 1, Design system and brand foundation.** Tokens, typography, components, navigation, footer, accessibility checks on every component, and a style guide.
3. **Phase 2, Public website.** All pages in section 5 built against the real data model, with the writing rules check passing.
4. **Phase 3, Database, backend and storage.** Schema, migrations, validation layer, policies, storage pipeline, email, rate limiting, and policy tests.
5. **Phase 4, Administrator dashboard.** Authentication with MFA, role based access, every module in section 6, audit logging, and the approval workflow for events.
6. **Phase 5, Security hardening and independent testing.** The penetration tester, who did not write the code, performs manual testing against the threat model: authentication and session attacks, access control and IDOR across every role, RLS and database policy tests, API fuzzing, input validation, XSS in all rich content paths, upload abuse, rate limit bypass, header and CSP review, dependency and secret scanning, and storage permission review. Fix findings, retest, and record results.
7. **Phase 6, SEO, performance and accessibility.** Lighthouse, Web Vitals, accessibility audit, and cross device testing.
8. **Phase 7, Acceptance testing and launch.** Test as a visitor, an editor, a programme manager and an administrator. Verify every form, upload, permission boundary, email, backup restore and error path. Prepare production environment variables, deployment steps, monitoring, backup and restore procedures, incident response and maintenance documentation.

---

## 12. DOCUMENTATION DELIVERABLES

- Architecture overview and data model.
- Threat model and security control map.
- Permissions matrix.
- Security test plan, results, residual risks and known limitations. Do not claim the site is "secure" because tests pass. State what was tested, how, what was found, what was fixed, and what remains.
- Privacy policy, retention schedule and data subject request procedure.
- Deployment, backup, restore and incident response runbooks.
- Administrator guide written in plain language for non technical staff.
- Content and asset request list for MindSpark Hub.

---

## 13. FINAL ACCEPTANCE CRITERIA

The project is complete only when all of the following are true:

- Every page and programme in this brief is implemented, with accurate content drawn from the orientation document.
- The three impact vehicles are properly represented, each on its own indexable page.
- The brand colours, typography and spacing are consistent across every page, and the site looks polished and professionally built on mobile and desktop.
- No em dashes, hyphens in visible copy, emojis, AI symbols or AI style imagery appear anywhere public, and the automated check passes.
- No invented statistics, testimonials, partnerships, achievements or contact details appear anywhere.
- Administrators can manage all public content without code changes, and every dashboard module works end to end.
- MFA, role based access and server side authorisation are enforced and tested for every role.
- Database policies, storage permissions and upload handling have been tested by someone other than their author.
- All forms are functional, validated on the server, rate limited, bot protected and carry privacy information and consent.
- Minors' images and data are handled under the safeguarding rules in section 9.
- SEO, accessibility and performance targets are met and measured.
- Security testing is documented, high and critical findings are closed, and residual risks are recorded and accepted by the organisation in writing.
- There are no broken links, dead buttons, unfinished components or fake dashboard numbers.

**The final standard:** MindSpark Hub is a credible institution with a strong digital identity, a professional public presence and a secure operational foundation. The site shows what the organisation believes, what it does, who it serves and how people can take part, and it protects everyone who trusts it with their information.

We are a great house. We will keep igniting minds, sparking purpose and transforming lives across classrooms, campuses and communities.

the logo is mindspark.jpg, use it where necessary, also the seo must be professionally built
