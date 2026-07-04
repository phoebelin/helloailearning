'use client';

import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

/**
 * App-wide client providers. Mounts Astryx's <Theme> so every migrated
 * component reads the same token set. Uses the /built theme object because the
 * theme CSS is already imported in globals.css (pre-compiled path).
 *
 * mode is pinned to "light" during migration to preserve the current look —
 * the app has no dark-mode toggle yet. Switch to a stateful 'system'|'light'|
 * 'dark' here once dark mode becomes a real feature.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={neutralTheme} mode="light">
      {children}
    </Theme>
  );
}
