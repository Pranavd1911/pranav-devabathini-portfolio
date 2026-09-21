# Pranav Devabathini · AI & Product

A complete, responsive personal portfolio built with HTML, CSS, and vanilla JavaScript. No build tools or runtime dependencies are required.

## Run locally

Open `index.html` directly, or run:

```sh
python3 scripts/serve.py
```

Visit http://localhost:8000. This local preview server supports HTTP byte ranges so narration seeking works, as well as clipboard and résumé downloads. The basic Python http.server lacks byte-range support, which prevents Chromium from seeking MP3 audio. Google Fonts load when a connection is available; system fonts are the fallback.

## Content

The portfolio uses the provided résumé and the education clarification from the conversation:

- AI product management introduction, Austin location, biography, and opportunity interests.
- Learning Destiny outcomes: three products launched, 40% increase in student retention, and cross-functional teams of 50+.
- AI Resume Reviewer, AI Interview Coach, and Learning Destiny AI, with category filters and project detail dialogs.
- All five professional and leadership roles, including dates, organizations, locations, and accomplishments.
- Product, technology, and leadership skill categories; three education entries; three training certifications.
- Hobbies, six languages, email, phone, LinkedIn, and the original downloadable résumé.
- Webster is current, with expected completion in 2027. Washington is listed as two completed graduate quarters before discontinuing studies, not an awarded degree.

Project descriptions distinguish developed work from designed work as stated in the résumé. Project illustrations are decorative visual concepts, not screenshots or live demos. No public project URLs were supplied.

## Interactions and accessibility

- Large, photo-based avatar leading the opening screen, plus a full-screen avatar stage.
- Wave, thumbs-up, thinking, celebration, and dance gestures with accessible buttons. Keys 1–5 also trigger gestures when the avatar is focused.
- Light and dark themes: defaults to the system preference and remembers an explicit choice locally.
- Draggable floating avatar companion with keyboard movement, greeting links, and minimize/restore controls.
- Spoken introduction, project overview, education journey, and optional gesture/greeting responses.
- Captions, pause/resume/stop, playback speed, and audio-timed mouth movement.
- Global motion pause/resume and operating-system reduced-motion support.
- Project filters, modal project details, Escape/backdrop closing, focus containment, and restored focus.
- Keyboard-accessible skill tabs with arrow keys, Home, and End.
- Native expandable education entries, mobile menu, active navigation, and scroll progress.
- Email copying with a clear fallback if clipboard permission is unavailable.
- Semantic landmarks, skip navigation, visible focus states, and responsive layouts.

## Files

- `index.html`: public content, navigation, project cards, contact links, and metadata.
- `styles.css`: design, responsive rules, illustrations, animations, and print styles.
- `script.js`: project detail content and interactions.
- `recruiter.js` / `recruiter.css`: overview, role highlights, shortlist, search, sharing, prioritization, and contact tools.
- `brief.html`: printable recruiter brief source.
- `assets/pranav-recruiter-brief.pdf` / `assets/pranav-devabathini.vcf`: one-page brief and contact card.
- `assets/pranav-devabathini-resume.pdf`: unchanged copy of the supplied résumé.
- `assets/favicon.svg`: site icon.
- `assets/pranav-avatar-sprite.png`: generated personal avatar, with neutral and two waving poses.
- `assets/avatar-generation.md`: built-in image generation prompt and asset details.
- `avatar.css` / `avatar.js`: large hero, full-screen stage, companion layout, gestures, dragging, and greetings.
- `themes.css` / `theme.js`: theme styles, system preference, and optional local persistence.
- `voice.css` / `voice.js` / `voice-data.js`: narration controls, audio metadata, captions, and mouth timing.
- `assets/audio/`: prerecorded narration and editable scripts.
- `assets/pranav-avatar-talking.png`: three mouth positions generated from the approved avatar.
- `assets/avatar-talking-generation.md`: talking artwork prompt.
- `scripts/render_voice.py`: optional macOS narration regeneration helper.
- `assets/pranav-avatar-gestures.png`: thumbs-up, thinking, and celebration poses.
- `assets/avatar-gestures-generation.md`: generation prompt for the additional poses.

## Personal portrait

The avatar was generated from Pranav’s supplied reference photo using the built-in image generation tool. It preserves his hairstyle, facial hair, checked shirt, and wrist bangle. The public site includes only the generated artwork; the original photo remains outside this folder.

Click the hero or floating avatar to wave and reveal portfolio shortcuts. Use the gesture bar for thumbs-up, thinking, celebration, and dance. The “Full screen” control opens a large avatar stage; Close or Escape returns to the page. Dance uses the celebration artwork with CSS movement, while the wave alternates two illustrated hand poses. Drag the small companion around the screen, or focus it and use the arrow keys; Home returns it to its default position. Minimize it with × and restore it with the Pranav button. Decorative animation honors the global pause control and operating-system reduced-motion preference; direct dragging and keyboard movement remain available. The greeting is a portfolio shortcut, not a chatbot.

DOB and F1 status remain omitted because public visibility was not confirmed. No analytics or backend is configured; the contact composer and email links open drafts in the visitor’s email app.

## Avatar voice

Click **Hear me** or choose a topic in **Listen in**. The default is **Young male · Brian (US English)**, with a slightly brighter delivery generated at +3% rate and +3 Hz pitch. **Prabhat (Indian English)** and **Guy (US English)** remain selectable alternatives. These are synthesized voices, not recordings or clones of Pranav. The user approved sending the portfolio narration scripts to Microsoft to generate these assets. The website itself plays bundled MP3 files and does not call a speech service or request a microphone.

Playback includes sentence-timed captions, a full transcript, pause/resume/stop, seeking, volume, and three speeds. Voice, speed, and volume preferences are saved locally when storage is available. Earlier voice settings migrate to the young-male default at natural playback speed, preserving volume; subsequent selections are remembered. A fresh visit always starts silently. Gesture replies are a separate opt-in switch and never interrupt a selected story, even while it is paused or loading.

Mouth movement follows measured audio loudness at 12 frames per second; it is not phoneme-level lip synchronization. Gestures take visual priority. Reduced-motion and Pause motion keep the mouth still while allowing audio. Audio errors retain the full transcript. Closing the full-screen stage, navigating, opening a project or search dialog, pressing Escape, hiding the tab, or minimizing the avatar stops playback.

All narration MP3s load only when selected. `voice-data.js` contains the voice metadata, speech-service sentence timing, and locally measured mouth cues. Original macOS WAVs are retained as source history and are no longer loaded by the website.

To regenerate, edit `assets/audio/scripts.json`, install `edge-tts==7.2.8` in a Python environment, and run `python scripts/render_neural_voice.py` on macOS (uses `afconvert`). This sends the scripts to Microsoft’s speech service. The build helper needs network access; publishing or visiting the completed site does not require edge-tts. To regenerate only the new voice, add `--voice young`; other voice assets and timing metadata are preserved. The older `scripts/render_voice.py` uses macOS Rishi and would overwrite the neural metadata, so use it only if deliberately reverting to local voice generation.

## Hiring tools

- A 60-second overview with evidence linked to the experience section, plus role-focused highlights for AI Product, Associate PM, and Product Intern opportunities.
- A downloadable, one-page recruiter brief (`assets/pranav-recruiter-brief.pdf`), printable source (`brief.html`), original résumé, copyable introduction, and downloadable contact card (`assets/pranav-devabathini.vcf`).
- Project scope labels, intended audiences, and interview discussion prompts. Prompts are explicitly exploratory; they do not claim past experiments, measurements, or shipped features.
- Project shortlist with local persistence, comparison dialog, copyable shortlist summary, and clear controls. Nothing is sent to a server.
- Shareable project deep links such as `?project=resume`, with direct-load and browser-history support. Links use the current host; share public links after hosting the site.
- Accessible search palette with Command/Control K, arrow navigation, and Enter selection for sections, projects, downloads, theme, and narration.
- Interactive RICE prioritization exercise with live ranking, bounded input validation, invalid/empty states, tie handling, reset, and CSV export. All estimates are clearly illustrative, not company outcomes. The framework links to Intercom’s original explanation.
- Hiring FAQ covering role interests, location, education status, and project scope.
- Introduction composer that opens a prefilled email draft for the visitor to review and send, optionally including their selected projects. There is no backend submission or message sending.
- Structured Person metadata based on the supplied résumé and LinkedIn profile.

`recruiter.js` and `recruiter.css` contain these enhancements. The site requires no build step, database, cookies, or analytics. If the brief changes, regenerate its PDF by printing `brief.html` to A4 with backgrounds enabled (one page).

## Verification

Browser checks cover desktop and touch layouts from 320 to 1440 pixels, themes, project saving/comparison/deep links, search keyboard controls, valid and invalid prioritization estimates, CSV export, contact form validation, actual neural audio playback, captions, pause/seek/volume/rate, voice preference persistence, interruption prevention, full-screen avatar speech, reduced motion, and audio failure transcripts. The brief PDF is one page. Refer to the current task report for any remaining limitations.

## Hosting

Upload `index.html`, `brief.html`, all root `.css` and `.js` files, and `assets/` together to a static host. No build command is needed. Use a host that supports HTTP byte-range requests for audio seeking (standard static hosting/CDNs do). When a public domain and sharing image are available, add the canonical URL and Open Graph image metadata. Hosting and a domain have not been configured.
