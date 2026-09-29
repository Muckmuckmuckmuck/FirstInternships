// Pharmaceuticals, medical devices and health care — sourced program batch.
//
// Scaffolded 2026-09-28 so that batches researched in parallel never edit the
// same file. This module is already imported and spread into PROGRAMS in
// src/content.js; filling it requires no change anywhere else.
//
// Assigned employers (research each on its own official pages; skip any whose
// official student page cannot be read or does not establish enough to write
// an accurate guide — never fill a gap from memory or a third-party site):
// Pfizer, Merck, AbbVie, Bristol Myers Squibb, Genentech, Novartis,
// AstraZeneca, Regeneron, Gilead Sciences, Moderna, Abbott, Stryker, Boston
// Scientific, Thermo Fisher Scientific, UnitedHealth Group, CVS Health.
//
// Records follow the program data model in docs/CLAUDE_CODE_PLAYBOOK.md §6.
// A date published without a time of day goes in `deadlineDate` (YYYY-MM-DD)
// with `deadlineDateLabel`; `deadline` is reserved for an exact instant with a
// published time and zone.

export const EMPLOYERS_HEALTH_PROGRAMS = [];
