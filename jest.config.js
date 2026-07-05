const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  // .claude/worktrees can contain full nested checkouts of this repo from other
  // sessions; without this, Jest double-discovers every test file inside them.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.claude/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async (...args) => {
  const config = await createJestConfig(customJestConfig)(...args)
  // next/jest APPENDS to transformIgnorePatterns rather than replacing it, and
  // its own default pattern already matches (and thus ignores) node_modules/
  // paths generally — an appended "do transform" pattern can't override an
  // earlier "ignore" match since the array is OR'd. @astryxdesign/* ships pure
  // ESM with no CJS fallback, so its untransformed `export` syntax breaks the
  // CJS module loader Jest uses. Replace the array outright so the exception
  // actually takes effect, while preserving next/jest's own exceptions (geist).
  config.transformIgnorePatterns = ['/node_modules/(?!(geist|@astryxdesign)/)']
  return config
}

