# CI/CD delivery model

## Goals
Keep coding-agent feedback fast while retaining a strong production safety net. GitHub Actions does not repeat a full Supabase stack, production build and browser suite for every feature-branch push. Vercel owns build/preview/production deployment.

## Delivery flow

| Event | GitHub Actions | Vercel |
|---|---|---|
| Feature branch push without a PR | No GitHub Actions run | Automatic Preview deployment |
| PR opened/reopened/updated against `main` | Lightweight `PR checks / PR quality`: install, server-only boundary guard, lint, typecheck, unit tests | Automatic Preview deployment and production build |
| PR merged to `main` | No second full CI run; the PR's required check is the merge gate | Automatic Production deployment from `main` |
| Weekly schedule, manual dispatch or `v*` tag | Full app build + full local Supabase reset, staged SQL and pgTAP | No deployment is initiated by this workflow |

Vercel Preview is the deployment/build check for a PR. A preview URL being created is not enough: its deployment must reach READY. The browser visual/accessibility pass remains a separate product-stage review, not a GitHub CI job.

## Lightweight PR gate
The required check name is **`PR checks / PR quality`**. It runs on PR open, synchronize, reopen and ready-for-review events, with concurrency cancellation so stale commits stop consuming runners. It performs:
- Dependency install
- Guard against browser Supabase clients and public Supabase key usage
- ESLint
- TypeScript typecheck
- Vitest unit tests

The PR gate intentionally does not start Docker/Supabase, apply migrations, run pgTAP, or repeat `next build`. Vercel runs the production build for the Preview deployment.

## Comprehensive validation
`.github/workflows/release-validation.yml` runs:
- On manual `workflow_dispatch`
- On a deliberate one-off push to `release-validation/**` (used when the full gate is needed before a release without running it on every feature branch)
- Weekly (Monday 03:17 UTC)
- On a `v*` release tag

It runs lint, typecheck, unit tests, a production build, a clean local Supabase migration reset, the staged server-only access SQL, and pgTAP. It never connects to or migrates hosted Supabase.

Before production promotion, run this workflow manually against the release commit and review the Vercel Production deployment. Browser smoke/visual checks and authenticated canaries remain explicit release evidence, not implicit CI claims.

## Branch and deployment policy
- Feature branches and PRs are merged through review.
- `main` is the Vercel Production branch; feature branches and PRs are Preview-only.
- Merging a PR is the event that allows Vercel to create a Production deployment.
- Do not create production deployments from feature branches or use Vercel CLI to bypass Git.
- The required PR check must be enforced by GitHub branch protection or a ruleset on `main`, with PRs required and direct pushes restricted.
- At the time this document was prepared, the GitHub integration could read repository rulesets (none returned) but did not have permission to read or administer classic branch protection (HTTP 403). Therefore the required-check configuration is documented but **not verified as enforced**. A repository admin must set the required status check to `PR checks / PR quality` in GitHub Settings → Branches, or grant the integration the appropriate administration permission so it can be configured and read back.

## Cost and iteration controls
- No workflow runs on raw feature-branch pushes.
- PR checks are one lightweight job and cancel stale runs.
- Vercel handles preview builds; GitHub Actions does not duplicate the build.
- Full Docker-backed database validation is scheduled, manual or release-tagged.
- Keep manual release validation before a production promotion even when the weekly run is green; the weekly run validates the current default branch, not necessarily the candidate release commit.
- Avoid adding E2E/browser suites to the PR gate unless measured regressions justify the cost; run them at the product-stage/release gate instead.
