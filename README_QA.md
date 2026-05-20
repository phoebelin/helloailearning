# QA Testing Framework for Zhorai Activity

## Overview

This project now includes automated QA testing using Playwright to catch bugs like infinite loops, UI freezes, and incorrect state transitions in the "How Machines Learn with Zhorai" activity.

## What Was Fixed

### Bug: Infinite Loop in Prediction Step

**Issue**: The `prediction-step.tsx` component had a `useEffect` hook with `speak` in its dependency array. Since `speak` is a callback function that changes on every render, it caused the effect to re-run infinitely.

**Location**: `components/activity/prediction-step.tsx:209`

**Fix**: Removed `speak` from the dependency array and added an eslint-disable comment with explanation.

```typescript
// FIXED: Removed 'speak' from dependencies to prevent infinite loop
// speak is a callback that changes on every render, causing the effect to re-run
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [userQuestion, predictionResult, animalDisplayName, selectedAnimal]);
```

## Running QA Tests

### Prerequisites

```bash
# Install dependencies (already done)
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run only the activity flow QA tests
npm run test:qa

# Run tests with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step-by-step
npm run test:e2e:debug
```

### Test Coverage

The QA suite covers:

1. **Full Activity Flow** - Complete user journey through all 11 steps
2. **Infinite Loop Detection** - Monitors for repeated function calls and console logs
3. **UI Responsiveness** - Ensures UI remains interactive
4. **Speech Recognition Errors** - Tests graceful degradation
5. **State Persistence** - Verifies localStorage saves progress
6. **Bug Regression Tests** - Specific tests for known bugs

## Test Structure

```
tests/
└── e2e/
    ├── activity-flow.spec.ts       # Main test suite
    └── helpers/
        └── activity-helpers.ts     # Reusable test utilities
```

## Helper Utilities

### ActivityFlowHelper

Provides methods to navigate through the activity:

```typescript
const helper = new ActivityFlowHelper(page);

await helper.navigateToActivity();
await helper.selectEcosystem('Rainforest');
await helper.selectAnimal('Bees');
await helper.addSentences(['Bees collect nectar...']);
const { hasInfiniteLoop } = await helper.makePrediction();
```

### PerformanceMonitor

Tracks errors and performance issues:

```typescript
const monitor = new PerformanceMonitor(page);
const hasRepeatedErrors = monitor.hasRepeatedErrors();
```

### BugDetector

Utilities for detecting specific bug patterns:

```typescript
const hasInfiniteLoop = await BugDetector.detectInfiniteLoop(page);
const hasMemoryLeak = await BugDetector.detectMemoryLeak(page);
```

## Writing New Tests

### Example: Test a New Step

```typescript
test('should complete new step without errors', async ({ page }) => {
  const helper = new ActivityFlowHelper(page);

  // Navigate to activity
  await helper.navigateToActivity();

  // ... navigate to your step

  // Your test logic here
  await expect(page.getByText('Expected text')).toBeVisible();
});
```

### Example: Detect a Specific Bug

```typescript
test('should not have memory leak in visualization', async ({ page }) => {
  const helper = new ActivityFlowHelper(page);

  // Navigate to visualization step
  await helper.navigateToActivity();
  // ... navigate to step

  // Check for memory leak
  const hasLeak = await BugDetector.detectMemoryLeak(page, 5000);
  expect(hasLeak).toBe(false);
});
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:
- Test results with screenshots
- Video recordings of failures
- Trace files for debugging
- Performance metrics

## CI/CD Integration

To run tests in CI:

```yaml
- name: Run QA Tests
  run: |
    npm run build
    npm run test:e2e
```

## Common Issues

### Tests Timing Out

Increase timeout in `playwright.config.ts`:

```typescript
timeout: 120 * 1000, // 2 minutes
```

### ML Models Not Loading

The activity uses BERT models which may take time to load. Tests account for this with appropriate timeouts.

### Speech Recognition in CI

Speech recognition tests automatically fall back to text input when microphone is unavailable.

## Best Practices

1. **Use data-testid** attributes for reliable selectors
2. **Wait for network idle** before assertions
3. **Monitor console errors** during critical operations
4. **Take screenshots** before and after key interactions
5. **Use helper functions** for common flows

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Accessibility testing
- [ ] Cross-browser compatibility matrix
- [ ] Load testing for ML models
- [ ] API mocking for faster tests

## Contributing

When adding new activity steps:

1. Add navigation helper to `ActivityFlowHelper`
2. Write test case in `activity-flow.spec.ts`
3. Update this README with new test coverage
4. Run tests locally before committing

## Support

For questions or issues with the QA framework, check:
- Playwright docs: https://playwright.dev
- Test examples in `tests/e2e/`
- Helper utilities documentation above
