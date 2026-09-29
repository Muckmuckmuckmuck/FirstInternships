// Federal government, international institutions, news and sports media —
// sourced program batch.
//
// Scaffolded 2026-09-28 so that batches researched in parallel never edit the
// same file. This module is already imported and spread into PROGRAMS in
// src/content.js; filling it requires no change anywhere else.
//
// Assigned employers (research each on its own official pages; skip any whose
// official student page cannot be read or does not establish enough to write
// an accurate guide — never fill a gap from memory or a third-party site):
// CIA student programs, FBI Honors Internship Program, NSA student programs,
// White House Internship Program, U.S. Department of the Treasury, Federal
// Reserve Bank of New York, United Nations internship programme, World Bank,
// International Monetary Fund, The New York Times, The Washington Post,
// Bloomberg, Dow Jones, Associated Press, NBA, NHL.
//
// Records follow the program data model in docs/CLAUDE_CODE_PLAYBOOK.md §6.
// A date published without a time of day goes in `deadlineDate` (YYYY-MM-DD)
// with `deadlineDateLabel`; `deadline` is reserved for an exact instant with a
// published time and zone.

export const EMPLOYERS_PUBLIC_MEDIA_PROGRAMS = [];
