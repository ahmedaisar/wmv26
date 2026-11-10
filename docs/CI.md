# Continuous integration

Every pull request runs GitHub Actions on Node.js 22 and checks ESLint, TypeScript, Vitest and the Next.js production build. The workflow installs dependencies with npm 11 to avoid the npm 10 dependency-tree failure encountered in the initial bootstrap run. No CI result is considered successful until all four quality steps complete.