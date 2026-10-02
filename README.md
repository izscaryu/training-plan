# Training plan

A phone-first site for my semester block, Oct 5 – Dec 31, 2026: strength training next to Muay Thai.

**Live:** https://izscaryu.github.io/training-plan/

## What's in it

- **Today**: this week's type (A, B or C), the day's session with the planned kg for every main lift, the plates to load per side, the full workout, technique notes and this cycle's skill drills. Muay Thai days and rest days get their own checklists.
- **Plan**: the whole plan, from the weekly layout and rotation calendar to every workout, the week-by-week progression, test week, adjustment rules, nutrition and the evidence behind it. Print it or save it as a PDF from there.
- **Log**: log a whole session in one go (prefilled with the planned numbers), or single sets, bodyweight, skill results and Muay Thai classes. Every top set with an RPE gets an estimated max.
- **Progress**: your weekly best estimated max against the plan's curve and your goals, bodyweight against the 72.5–74 kg band, a week-by-week table and skill bests. Suggestions from the plan's rules show up when a top set is much easier or harder than planned.
- **Settings**: plan adjustments (for example squat +5 kg from week 4, which moves every later number), bar and plates, sync, backup and import.

Add it to your phone's home screen (Share → Add to Home Screen on iPhone, menu → Install app on Android). It works offline at the gym once it has been opened once.

## Where the log lives

Your log is saved in the browser you use, nothing is stored in this repo. This repo is public, so it only holds the site's code and the plan.

To see the same log on your phone and laptop, turn on sync in Settings. It keeps a copy in a private repo of your choice (default `training-log`) using a fine-grained GitHub token that can only touch that one repo. The token stays in your browser.

Use **Settings → Download backup** now and then either way.

## Changing the plan

- Planned numbers, sessions and weeks: `assets/js/plan.js`
- Plan text: `assets/js/content.js`
- After changing files, bump `VERSION` in `sw.js` so phones pick up the new version.

No build step: it's plain HTML, CSS and JavaScript modules served by GitHub Pages. Font: Archivo (SIL Open Font License, see `assets/fonts`).
