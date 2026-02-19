# BUG B — Search returns incorrect results with diacritics

## Title
Search: Incorrect results when querying attractions with diacritics (e.g., “Café Rouge”) — diacritic marks are ignored

## Description
Search returns incorrect or unexpected results when users search for attractions containing diacritical marks (e.g., “Café Rouge”). The system appears to ignore diacritics (treating “Café” as “Cafe”), which negatively impacts matching accuracy and relevance.

## Environment
- Platform: Mobile app (as per prompt; confirm if also reproducible on web)
- OS/Device: N/A in prompt
- App version/build: N/A in prompt
- Frequency: High / reproducible

## Steps to Reproduce
1. Open the app search.
2. Search for: `Café Rouge`
3. Compare results to searching: `Cafe Rouge`

## Expected Result
- Search should return accurate and relevant matches for the intended entity.
- If accent-insensitive search is intended, ranking should still prioritize correct matches and not return irrelevant results.

## Actual Result
- Search results are incorrect/irrelevant; diacritic marks appear to be ignored in a way that reduces accuracy.

## Severity
Medium

## Priority
High

## Impact
- Poor search experience for international users/languages with diacritics.
- Reduced ability to discover specific places by name.

## Recommendations / Possible Root Cause
- Review text normalization and analyzers/tokenizers:
  - Unicode normalization (NFD/NFKD) handling
  - accent folding strategy (e.g., asciifolding) and ranking
- Add i18n test data and automated coverage for diacritic queries.
- Verify whether diacritics are stripped on the client (pre-processing) vs. backend search index.
