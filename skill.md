# MINDSPARK HUB MOBILE APP: MASTER BUILD PROMPT (EXPO GO)

## 0. HOW TO READ THIS BRIEF

You are a combined delivery team building the official MindSpark Hub mobile app as a companion to the existing website:

- **Product team:** a product lead, a senior mobile UI designer, a content and editorial lead and an accessibility specialist.
- **Engineering team:** senior React Native engineers and a backend engineer who owns the API.
- **Security team:** a mobile application security engineer, a security architect and a penetration tester who reviews the work independently of its authors.

Security is a requirement of every phase, from the first API contract to the last release check. It carries the same weight as design and content. If any instruction conflicts with security, privacy or the law, security, privacy and the law win. Record the conflict and the resolution in the documentation.

The mobile app must feel like it belongs to the same institution as the website: same brand, same voice, same standards. It must not feel like a website in a wrapper.

---

## 1. WHAT ALREADY EXISTS (REPOSITORY FINDINGS)

Repository: https://github.com/abrahamcybertech/mindsparkhub (live site: https://mindspark-hub.vercel.app)

From the repository, the existing web platform is:

- **Framework:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, deployed on Vercel.
- **Data:** PostgreSQL on Supabase through the `postgres` driver and `@supabase/supabase-js`. Supabase Storage bucket named `media`. A local SQLite fallback exists for development only.
- **Auth:** custom signed session using `SESSION_SECRET`, TOTP multi factor authentication (`otpauth`, `qrcode.react`) with `MFA_ENCRYPTION_KEY`, Supabase Auth used for password reset emails, scripts `admin:create` and `db:migrate`.
- **Validation:** Zod.
- **Email:** Nodemailer and an optional Supabase Edge Function `send-email`.
- **Icons:** `lucide-react`.
- **Quality scripts already present:** `test:copy-rules` (writing rules scan, runs before every build), `test:security`, `typecheck`, `lint`.
- **Assets:** the logo is `mindspark.jpg` in the repository root. Photography exists in `images`, `extracted_images`, `public` and `public_assets`. The source content document is `orientation_text.txt`. The earlier web brief is `skill.md` and design and security notes are in `docs`.
- **Supabase boundary:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public by design. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `MFA_ENCRYPTION_KEY`, SMTP credentials and the initial admin credentials are secrets.

**Phase 0 audit instruction:** the folders `src`, `docs`, `scripts` and `supabase` were not fully read when this brief was written. Read them completely before designing anything. Reuse existing schemas, Zod schemas, content, permissions matrix, RLS policies and design tokens. Do not duplicate or contradict them. List every difference between this brief and the real code in the plan.

---

## 2. SCOPE AND PRODUCT DECISIONS

### 2.1 Technology

- **Expo with React Native and TypeScript (strict mode)**, running in **Expo Go** for development and review. Use the latest stable Expo SDK that the current Expo Go app supports. Verify the version before starting and pin it.
- **Expo Router** for file based navigation.
- Use only libraries that work inside Expo Go (the Expo SDK modules and pure JavaScript libraries). Do not add custom native modules or config plugins that Expo Go cannot load, unless a documented decision moves the project to a development build.
- State and data: TanStack Query for server state, Zustand or React context for small client state, Zod for validation, shared where possible with the web project.
- Icons: `lucide-react-native` or an equivalent single line icon set rendered as SVG. No emoji, no mixed icon styles.
- Images: `expo-image` with caching, blur placeholders and responsive sizes.

### 2.2 Honest Expo Go limits (document these in the README)

- Expo Go is a development and review sandbox. It is not how the public will install the app. Production distribution needs an EAS Build (an APK or AAB for Android, and an IPA for iOS), store listings and store review. Plan this as a final phase.
- Remote push notifications are not available inside Expo Go on current SDKs, and some permission flows differ. Design notifications so the app works fully without them, and build push as an enhancement for the development or production build.
- Anything that needs custom native code, or a library Expo Go does not bundle, is out of scope for the Expo Go milestone and must be flagged, not silently replaced.

### 2.3 App sections

**Public experience (no account required):**

1. Home
2. Programmes: Secondary Schools Invasion, Campus Sparking, Community Enlightenment
3. Events and schedule (approved events only)
4. Impact gallery
5. Insights (articles)
6. About and organisational structure (eight units, Financial Department, Secretariat)
7. Get Involved (forms)
8. Contact
9. Legal: Privacy Policy, Terms of Use, Security and Responsible Disclosure

**Staff experience (invite only, sign in required):** a deliberately limited admin area for people who already hold a dashboard role. In version one it covers: viewing enquiries and applications, changing their status, approving or declining submitted events, publishing or unpublishing existing articles and gallery items, and a read only audit view for Super Administrators. Content authoring that needs rich editing and bulk uploads stays on the web dashboard. Every staff action reuses the same server side permissions as the website.

Decide and document this boundary in Phase 0. Do not build anything in the staff area that the web dashboard does not already authorise.

---

## 3. NON NEGOTIABLE RULES

### 3.1 Writing rules for everything a user can see in the app

- No em dashes anywhere.
- No hyphens in visible copy: screen titles, body text, buttons, tab labels, placeholders, alt text, accessibility labels, error messages, notifications, store descriptions and email templates. Rewrite instead (for example "secondary school", "multi factor", "anti social", "real world").
- Technical hyphens that users never read as copy are acceptable: route names, file names, identifiers, package names and email addresses.
- No emojis, emoticons or decorative unicode symbols. No sparkle or star symbols suggesting AI.
- No AI imagery of any kind: no robots, circuits, glowing orbs or AI generated illustrations or photographs.
- Natural, confident Nigerian English. No filler, buzzwords or fundraising template language.
- Do not invent achievements, statistics, participant numbers, testimonials, partnerships, endorsements, quotes or leadership names.

**Enforcement:** reuse the existing `scripts/check-writing-rules.mjs` approach. Add a mobile version that scans every user visible string in the app source, the localisation files, `app.json` display fields, store listing text and notification templates, and fails the build on em dashes, en dashes, hyphens in visible text and emoji code points. Share one rule list between web and mobile so they never drift.

### 3.2 Visual rules

- Brand: primary #0D2748 (deep navy), secondary #FFC107 (gold). Gold is for fills, rules, icons and highlights. Use navy text on gold. Gold text on white fails contrast.
- Use the logo file `mindspark.jpg` from the repository. Create properly cropped and padded variants for the app icon, adaptive icon (foreground on a navy background), splash screen, in app header mark and notification icon. If a vector version exists, use it. If only the JPEG exists, record that quality limit in the asset request and ask for the original artwork. Do not redraw or alter the logo.
- No hacker imagery, skulls, padlock clichés or neon cyberpunk visuals. Security is communicated through quality, privacy practice and an honest security page.
- Photography must be real MindSpark Hub photography from the repository folders. Use a neutral navy placeholder with the logo where a photograph is missing. Never use unrelated stock photos as if they were MindSpark Hub activities.

### 3.3 Content integrity

- `orientation_text.txt` is the primary source of organisational facts.
- Verified activities that may be referenced: SSI 1.0 at Federal Government College Wukari and Campus Sparking at Federal University Wukari. Add nothing the source does not state.
- All content comes from the same backend as the website. Administrators change it once and both the site and app update.
- Unverified contact details and social links are hidden, never shown as placeholders.
- An event is shown as confirmed only after an authorised administrator approves its date and venue.

---

## 4. ARCHITECTURE

### 4.1 The mobile app never talks to the database with privileged credentials

This is the most important architectural rule.

- The app must never contain `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `MFA_ENCRYPTION_KEY`, SMTP credentials or any other secret. Everything in an Expo bundle can be extracted by anyone who installs the app. Treat the bundle as public.
- Public content is read through a **versioned API on the existing Next.js backend** (for example `/api/v1/...`), which uses the server side database access that already exists. Alternatively, public reads may use the Supabase anon key only if Row Level Security restricts it to published public content, and only if the security team signs this off. Prefer the API so there is one enforcement point and one place for rate limiting, caching and logging.
- All writes (forms, staff actions) go through the API with server side validation, authorisation and rate limiting.
- Extend the web project with the API routes the app needs. Do not fork the backend. Document each endpoint in an OpenAPI file and share Zod schemas between web and mobile through a small shared package or a monorepo workspace.
- Version the API from day one and design for old app versions still being installed: additive changes only, and a minimum supported app version check that can force an update screen.

### 4.2 Repository layout

Prefer a monorepo with `apps/web` (the existing Next.js project, moved with history preserved), `apps/mobile` (Expo) and `packages/shared` (Zod schemas, types, constants, copy rules). If moving the web app is too disruptive, add `mobile/` beside it and publish `shared` as a local package. Record the decision in the plan.

### 4.3 Mobile authentication (staff only)

The website uses cookie sessions. Mobile needs a token model designed for it:

- Sign in with email and password, then a mandatory TOTP code, using the same MFA enrolment already in the repository. No staff account without MFA. Passkeys can be added later.
- Server issues a short lived access token (about 10 to 15 minutes) and a rotating refresh token (one time use, with reuse detection that revokes the whole token family). Store tokens only in `expo-secure-store`. Never use AsyncStorage for tokens or any personal data.
- Optional biometric unlock with `expo-local-authentication` to reopen the app, never as a replacement for server authentication.
- Idle timeout, absolute session lifetime, remote sign out from the web dashboard, sign out on password or role change, and secure logout that revokes server side tokens and clears local storage.
- Login and MFA rate limiting per account and per IP with generic errors, and audit entries for every success and failure, using the existing audit log.
- Password recovery reuses the existing flow. Reset links open the web page or a verified universal link, never a custom scheme alone.
- Invite only onboarding. No public sign up in the app. No hardcoded credentials anywhere.

---

## 5. SCREENS AND CONTENT

### 5.1 Navigation

Bottom tabs: Home, Programmes, Impact, Insights, More. The More tab holds About, Get Involved, Contact, Legal and Staff sign in. Use a stack navigator inside each tab, native feeling transitions, large touch targets (at least 44 points), safe area handling and consistent headers with the logo mark on the Home screen.

### 5.2 Home

Hero: Igniting Minds. Sparking Purpose. Transforming Lives.
Supporting text: MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.
Primary button: Discover Our Impact. Secondary button: Explore Our Programmes.

Then: introduction, our vision (To build a Nigeria where citizens excel, innovate and lead positive change), our mission (Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions), the three impact vehicle cards, our approach (academic excellence, skills acquisition, character development, leadership development, purpose discovery, moral and spiritual growth, community responsibility), a verified impact strip drawn from the gallery and approved testimonies only (no numbers), and the closing message: The future is not waiting. We are building it.

### 5.3 Programmes

Each of the three programmes has a list entry and a detail screen with its tagline, introduction, objectives, structure, related events and a related gallery. Take the text from the website content in the database and from `skill.md` section 5.2 so both products stay identical.

- **Secondary Schools Invasion:** Catch Them Young. Shape Them Early. Three seminar sessions (Academic Excellence, Skills Acquisition, Anti Social Vices), the interactive question and answer session, the closing chant and prayers.
- **Campus Sparking:** Beyond CGPA: Unlocking Skills, Purpose and Opportunities. Six participant experiences. General sessions every two weeks on Saturdays, 10 AM to 12 PM, at venues the administrators confirm.
- **Community Enlightenment:** for working adults, middle aged and older citizens. Show only sections that have confirmed content.

### 5.4 Events

List and detail screens, showing approved events only. Add to calendar through `expo-calendar` (request permission at the moment of use, with a clear reason). Local reminders may use `expo-notifications` local scheduling, which works without remote push. Show a clear empty state when there are no confirmed events. Never show a draft or pending event.

### 5.5 Impact gallery

Responsive grid, category filters, skeleton loading, blurred placeholders, full screen viewer with pinch to zoom and swipe, captions and accessible image descriptions. Respect the minors safeguarding rule: only items the server marks as consent confirmed are ever returned by the API. Offer a "report this image" action that sends a takedown request to the administrators.

### 5.6 Insights

Article list with categories, search and pagination, article reader with comfortable typography, author (only if authorised), date, estimated reading time, related articles and a share action through the native share sheet pointing at the canonical website URL. Render article content from the safe constrained format the server provides, never raw HTML in a web view without sanitising and a strict content policy.

### 5.7 About and structure

Who we are, vision, mission, motto (We spark growth and ignite Mindset.), slogan (Where every word lights a fire.), philosophy, approach, the three impact vehicles, and the eight units: Academic Excellence Advocacy Unit, Skill Acquisition Advocacy Unit, Gender Based Vices and Sexual Purity Advocacy Unit, Communication and Editorial Unit, Technical Unit, Welfare Unit, Logistic Unit and Evangelism Unit. Acknowledge the Financial Department and Secretariat. Show leadership names and photos only when the server confirms written authorisation.

### 5.8 Get Involved and Contact

Purpose built forms for joining, volunteering, mentoring, partnering, supporting an outreach, contributing resources and participating in programmes, plus general, programme and partnership enquiries. Each form has plain language privacy information, a link to the privacy policy, an unticked consent control, client side validation for usability and full server side validation. Collect only the minimum personal data. Never collect data directly from minors. Show a confirmation with a reference number. Bot protection uses an approach that works in a mobile context (server issued short lived challenge, attestation where available, and strict rate limits per IP and per device identifier hashed on the server). If the web uses Turnstile or hCaptcha, provide a mobile compatible equivalent through the API and document it.

Offline behaviour: forms can be drafted offline, but submission requires a connection. Never queue personal data in unencrypted storage.

### 5.9 Legal and security pages

Privacy Policy, Terms of Use, Security and Responsible Disclosure, and an About this app screen showing the version, build and a link to the website. These open in app from server hosted content so they stay current.

---

## 6. DESIGN SYSTEM

- Build design tokens (colour, type scale, spacing, radius, elevation, motion) that mirror the web Tailwind tokens. Generate both from one source if possible.
- Typography: a refined serif or high character display face for headlines with a clean sans serif for body text, loaded with `expo-font` or `@expo-google-fonts`. Support system font scaling and test at the largest accessibility size without clipping.
- Components: buttons, cards, list rows, tabs, headers, form fields, checkboxes, toggles, chips, badges, skeletons, empty states, error states, toasts, bottom sheets, image viewer. Every component has default, pressed, focused, disabled, loading and error states.
- Dark mode: support it deliberately with a defined dark palette derived from the navy, not an automatic inversion. Gold stays an accent.
- Motion: subtle and purposeful with `react-native-reanimated` (available in Expo Go). Respect the system reduce motion setting everywhere.
- Layout: design phone, large phone and tablet layouts. Tablet gets a two column layout where it helps. Support both orientations on tablets and portrait on phones unless a screen benefits from landscape (the image viewer does).
- The result must look beautiful and professionally built. Avoid default component library looks, heavy gradients, glows and generic templates.

---

## 7. MOBILE SECURITY (CORE OF THE PROJECT)

Use OWASP MASVS Level 1 as the minimum baseline for the whole app, and the Level 2 controls that apply to the staff area. Use OWASP MASTG for test cases. Combine this with the OWASP ASVS Level 2 and 3 controls the web project already follows for the API.

### 7.1 Data and storage

- No secrets in the bundle, in `app.json`, in `EXPO_PUBLIC_` variables or in source control. Only public configuration (API base URL, public site URL, public Supabase anon key if the security team approves its use) may be embedded.
- Tokens only in `expo-secure-store`. No personal data in AsyncStorage, logs, analytics events, crash reports or screenshots of the task switcher. Blur or hide sensitive staff screens when the app goes to the background.
- Cache only public content. Clear all staff caches on logout. Encrypt anything sensitive that must be cached.
- Disable copy and screenshot behaviour on staff screens where the platform allows, and document platform limits honestly.

### 7.2 Network

- HTTPS only. Reject cleartext traffic. Use certificate validation through the platform. Evaluate certificate pinning against the cost of a pinning outage and the limits of Expo Go. If pinning needs a development build, document that and decide with the security team. Do not claim pinning exists if it does not.
- A single API client wrapper adds the authorisation header, request identifiers, timeouts, retry with backoff for idempotent calls only, and safe error mapping. Raw error bodies are never shown to users.
- Defend against token replay, request tampering and enumeration through server side checks, never client side checks.

### 7.3 API and server controls (extend the existing web backend)

- Every new endpoint has authentication where required, server side authorisation against the existing role permissions, Zod validation that rejects unknown fields, output filtering, rate limiting and audit logging.
- Prevent insecure direct object references and privilege escalation on every staff endpoint, and test each role.
- Row Level Security stays enabled on all tables. The anon role can read only published public content and insert into submission tables through controlled paths. The service role key stays on the server only.
- Upload endpoints (if staff upload photographs from the phone): allow list of JPEG, PNG and WebP, magic byte checks, size limits, server side re encoding to strip GPS and other metadata, random server side filenames, private storage, permission checks and audit entries.
- Add a minimum supported version header and a kill switch for a compromised app version.

### 7.4 App integrity and abuse

- Treat the client as untrusted. The server enforces everything.
- Deep links and universal links: validate every parameter, refuse unknown hosts, never perform a privileged action from a link alone and require authentication for staff routes.
- Web views: avoid them for sensitive flows. If one is unavoidable, restrict it to an allow list of origins, disable JavaScript injection from untrusted content and open external links in the system browser.
- Rooted or jailbroken device and tamper detection: document what Expo Go can and cannot do. Do not claim protections that do not exist.
- Obfuscation and minification through Hermes and release builds are helpful but are not security. State this plainly.

### 7.5 Privacy

- Follow the Nigeria Data Protection Act 2023 and its regulations. Record lawful bases, minimise data, state purposes and retention periods, and provide a way to exercise data rights. Provide in app account and data deletion for staff, and a clear route for the public to request deletion of a submission.
- Complete the Apple App Privacy answers and the Google Play Data safety form from the real behaviour of the app. Do not guess.
- No third party advertising or invasive tracking. If analytics are used, choose a privacy friendly option, avoid personal identifiers, and describe it in the privacy policy.
- Request permissions (calendar, notifications, photos) only at the moment of use with a clear explanation.

### 7.6 Secure development

- Pin dependencies, commit lockfiles, run `npm audit` and an OSV scan in CI, enable Dependabot, and review every new package for maintenance and permissions.
- CI gates: type check, lint, unit and component tests, the writing rules check, secret scanning, static analysis (Semgrep or CodeQL), dependency audit and an Expo Doctor check.
- Mandatory review for changes touching authentication, token handling, storage, deep links or uploads.
- Protected main branch, MFA on every service account (Expo, Apple, Google, Supabase, Vercel, GitHub), and least privilege access.

---

## 8. SEO, DISCOVERY AND APP STORE PRESENCE

Mobile apps do not rank like web pages, so the work is split into three parts. Do all three professionally.

**A. Website SEO that supports the app (extend the existing site):**
- Smart app banner metadata and an "app available" section on the site.
- Universal links and app links: host `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` on the website so shared article, programme and event links open in the app when installed and in the browser otherwise. Each deep link maps to a canonical website URL.
- Keep canonical URLs, Open Graph, structured data (Organization, Event, Article, BreadcrumbList), sitemap and robots.txt strong and consistent with the app routes.

**B. App Store Optimisation (ASO), without keyword stuffing:**
- A distinctive app name and subtitle, a clear short description, a full description in natural Nigerian English that follows the writing rules (no em dashes, no hyphens, no emojis), keyword research for the Nigerian market, localised screenshots with real content and captions, a feature graphic, an accurate category and age rating, support and privacy URLs, and release notes written for people.
- Treat the screenshots as part of the product design. They must show real screens with real content, no fabricated statistics or testimonials.

**C. In app content discoverability:**
- Support deep links for every programme, event and article so search engines can surface them through app indexing where supported, and users can share links that always work.

---

## 9. ACCESSIBILITY, PERFORMANCE AND QUALITY

- **Accessibility (WCAG 2.2 AA mapped to mobile):** screen reader labels and roles for every control (TalkBack and VoiceOver), logical focus order, dynamic text scaling, contrast checks for every token pair, reduce motion, touch targets of at least 44 points, descriptive image labels, announced loading and error states, and no information conveyed by colour alone. Test with real screen readers.
- **Performance:** target a fast cold start on low and mid range Android devices common in Nigeria. Use FlashList or optimised FlatList, image caching and correctly sized images, query caching with sensible stale times, skeleton loading, a small bundle, lazy loaded screens and no blocking work on the JavaScript thread. Assume slow, unreliable networks: stale while revalidate for public content and clear offline states.
- **Resilience:** offline banner, retry, graceful errors in plain language, an error boundary on every route, a minimum version update screen, and crash reporting that scrubs personal data.
- **Testing:** unit tests, component tests (React Native Testing Library), API contract tests, end to end flows with Maestro, and a manual device matrix covering Android phones (low, mid and high), iPhones and a tablet.

---

## 10. PHASES AND GATES

Each phase ends with a gate. Security signs off the security items. No phase advances with open high severity findings.

1. **Phase 0, Audit, threat model and plan.** Read the full repository (`src`, `docs`, `scripts`, `supabase`). Produce the gap list (assets, contact details, approvals), data classification, a mobile threat model (token theft, API abuse, deep link attacks, malicious uploads, reverse engineering, privilege escalation, data leakage through logs and backups) and an implementation plan. Confirm the Expo SDK version and the Expo Go limits.
2. **Phase 1, API foundation.** Add the versioned API to the existing backend, shared schemas, OpenAPI documentation, rate limiting, token authentication with MFA and refresh rotation, audit logging and contract tests.
3. **Phase 2, Design system and app shell.** Tokens, fonts, logo assets, navigation, base components, dark mode, accessibility checks and the writing rules scan.
4. **Phase 3, Public screens.** Home, programmes, events, gallery, insights, about, get involved, contact and legal, all against real data.
5. **Phase 4, Staff area.** Sign in with MFA, role aware screens, enquiry handling, event approval, publish controls and audit view.
6. **Phase 5, Security hardening and independent testing.** The penetration tester, who did not write the code, tests against MASVS and the threat model: token storage and theft, refresh reuse, API access control across every role, IDOR, rate limit bypass, deep link abuse, upload abuse, bundle inspection for secrets, log and cache leakage, and backup extraction. Fix findings, retest and record results.
7. **Phase 6, SEO, ASO and accessibility.** Universal links, store listings, screenshots, accessibility audit with real assistive technology and performance profiling on low end devices.
8. **Phase 7, Acceptance in Expo Go.** Walk through every flow as a visitor, an editor, a programme manager, an administrator and a Super Administrator on real Android and iOS devices through Expo Go.
9. **Phase 8, Production build and release.** Move to EAS Build, set up signing, build the Android and iOS binaries, run the same security checks against the release builds, complete store privacy forms, submit for review, and document the release, rollback and incident response procedures.

---

## 11. DOCUMENTATION DELIVERABLES

- README with Expo Go setup (install Expo Go, run `npx expo start`, scan the QR code, environment configuration, test accounts that contain no real personal data).
- Architecture overview, API reference (OpenAPI) and data flow diagram.
- Threat model, MASVS control map and permissions matrix.
- Security test plan, results, residual risks and known limitations. Do not call the app "secure" because tests pass. State what was tested, how, what was found, what was fixed and what remains.
- Privacy documentation, retention schedule, Apple and Google privacy form answers.
- Store listing pack (text, screenshots, icons) that passes the writing rules check.
- Release, rollback and incident response runbooks.
- Asset and content request list for MindSpark Hub, including the original vector logo.

---

## 12. FINAL ACCEPTANCE CRITERIA

The mobile app is complete only when all of the following are true:

- Every screen in this brief works in Expo Go against real backend data, with no dead buttons, placeholder screens or fake numbers.
- The brand colours, the `mindspark.jpg` logo and the typography are used consistently, and the app looks beautiful and professionally built on phones and tablets.
- The writing rules check passes: no em dashes, no hyphens in visible copy, no emojis, no AI symbols or AI style imagery.
- No invented statistics, testimonials, partnerships, achievements or contact details appear anywhere.
- No secret exists in the app bundle, and the app never uses privileged database credentials.
- Staff authentication requires MFA, tokens live only in secure storage, refresh tokens rotate with reuse detection, and server side authorisation is enforced and tested for every role.
- Forms are validated on the server, rate limited, protected against bots and carry privacy information and consent.
- Minors' images and data follow the safeguarding rules, and only consent confirmed images are served.
- Deep links and universal links work and are validated.
- Accessibility, performance and SEO and ASO targets are met and measured.
- Independent security testing is documented, high and critical findings are closed, and residual risks are recorded and accepted by the organisation in writing.
- Production builds through EAS are signed, tested and ready for store submission.

**The final standard:** the MindSpark Hub app shows what the organisation believes, what it does, who it serves and how people can take part, and it protects everyone who trusts it with their information. It is the same great house, now in every pocket.  this is the folder of the website "mindspark"

also write the script that auto check and update the app if anychanges have been made
