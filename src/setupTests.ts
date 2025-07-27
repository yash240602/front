import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// This mock intercepts all imports from '@mui/icons-material'
// and replaces them with a valid, empty React component. This prevents the test
// runner from opening hundreds of files for the icons, which fixes
// the "EMFILE: too many open files" error and subsequent test hangs.
vi.mock('@mui/icons-material', async (importOriginal) => {
  // We still want the actual library for non-test environments
  if (process.env.NODE_ENV !== 'test') {
    const original = await importOriginal();
    return original;
  }

  // Use a Proxy to return a dummy React component for any icon requested.
  return new Proxy({}, {
    get: (_target, prop) => {
      // A simple dummy component that renders nothing but can be identified in tests.
      // It's a proper function component, which satisfies React Testing Library.
      const MockIcon = () => React.createElement('svg', { 'data-testid': `mock-icon-${String(prop)}` });
      return MockIcon;
    },
  });
});
