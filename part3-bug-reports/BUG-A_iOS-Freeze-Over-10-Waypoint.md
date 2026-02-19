# BUG A — iOS freezes after adding >10 waypoints

## Title
iOS: App becomes unresponsive for 3–5 seconds after adding more than 10 waypoints to a trip

## Description
When a user adds more than 10 waypoints to a trip, the iOS app becomes unresponsive (freezes) for ~3–5 seconds before rendering the waypoints. This occurs consistently on iOS (tested on iPhone 12 and iPhone 14) and does not reproduce on Android.

## Environment
- Platform: iOS mobile app
- Devices: iPhone 12, iPhone 14
- OS: iOS (version N/A in prompt)
- App version/build: N/A in prompt
- Network: N/A
- Frequency: 100% (consistent)

## Steps to Reproduce
1. Log in on an iOS device.
2. Create a new trip (or open an existing one).
3. Add waypoints until the total is 11+.
4. Observe the UI after adding the 11th waypoint (and subsequent ones).

## Expected Result
- UI remains responsive during waypoint addition.
- Waypoints appear without noticeable blocking.
- If processing is required, a loading indicator is shown (spinner/progress) without blocking the main UI thread.

## Actual Result
- UI becomes unresponsive for 3–5 seconds (no taps/scroll responses).
- After the freeze, waypoints are displayed.

## Severity
High

## Priority
High

## Impact
- Degrades core trip planning flow for long trips.
- Users may retry actions during the freeze, causing potential duplicate operations and frustration.

## Recommendations / Possible Root Cause
- Likely main-thread blocking during:
  - route recalculation / polyline rendering
  - list re-rendering/layout for waypoints
  - inefficient algorithmic complexity when appending items (e.g., O(n²))
- Suggested next steps:
  - profile with Instruments (Time Profiler) during waypoint addition
  - virtualize or optimize waypoint list rendering
  - move heavy computation off the main thread (async/background)
