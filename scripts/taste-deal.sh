#!/usr/bin/env bash
set -euo pipefail

PAGE="${1:-software}"
TRADE="${2:-saas}"
SKILL_REF="f6b76575f949707b4e3c37cd86cb44b0b98643e8"
SKILL_DIR=".taste-skill/source"
mkdir -p .taste-skill

if [[ ! -f "$SKILL_DIR/skills/taste-skill/scripts/start.mjs" ]]; then
  mkdir -p "$SKILL_DIR"
  git -C "$SKILL_DIR" init
  git -C "$SKILL_DIR" remote add origin https://github.com/Leonxlnx/taste-skill.git
  git -C "$SKILL_DIR" fetch --depth 1 origin "$SKILL_REF"
  git -C "$SKILL_DIR" checkout --detach FETCH_HEAD
fi

if [[ "${TASTE_SKIP_DEAL:-}" != "1" ]]; then
  node "$SKILL_DIR/skills/taste-skill/scripts/start.mjs" deal \
    --page "$PAGE" \
    --trade "$TRADE" \
    --history .taste-skill/history.json
fi

if [[ -n "${TASTE_PALETTE:-}" && -n "${TASTE_TYPE:-}" ]]; then
  css_args=(css --page "$PAGE" --palette "$TASTE_PALETTE" --type "$TASTE_TYPE" --radius soft --history .taste-skill/history.json)
  if [[ -n "${TASTE_AXIS:-}" ]]; then
    css_args+=(--axis "$TASTE_AXIS")
  fi
  node "$SKILL_DIR/skills/taste-skill/scripts/start.mjs" "${css_args[@]}"
fi

if [[ "${TASTE_MOMENT:-}" == "1" ]]; then
  moment_args=(pick --page "$PAGE" --count 1 --fits section --history .taste-skill/history.json)
  if [[ -n "${TASTE_MOMENT_SEED:-}" ]]; then
    moment_args+=(--seed "$TASTE_MOMENT_SEED")
  fi
  node "$SKILL_DIR/skills/taste-skill/scripts/moments.mjs" "${moment_args[@]}"
fi
