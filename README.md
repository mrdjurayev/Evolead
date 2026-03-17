# Evolead

Evolead is a lightweight static learning hub for English practice. It brings together:

- a homework checklist with saved progress
- a vocabulary tracker for Units 1-12
- a guided news practice page
- quick access to translator and grammar tools
- a contact form for feedback and support

## Stack

- HTML
- CSS
- Vanilla JavaScript
- `localStorage` for client-side progress saving

## Pages

- `index.html` - main menu and tool entry point
- `homework.html` - latest homework with progress tracking
- `vocabulary.html` - vocabulary review and random practice
- `news.html` - guided article and discussion practice
- `link.html` - listening practice with transcript
- `about.html` - project overview
- `contact.html` - contact form and feedback entry point

## Notes

- The project does not use a build system.
- Static assets can be served directly from the repo.
- The site is configured for `evolead.site`.

## Quick updates

- Update homework content in `homework-data.js`.
- Update vocabulary entries in `vocabulary-data.js`.
- Shared browser helpers live in `shared.js`.
- Shared analytics setup lives in `analytics.js`.
