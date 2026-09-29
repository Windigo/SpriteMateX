#!/usr/bin/env bash
# Bouwt de SpritemateX-app, compileert de extensie en pakt het .vsix.
#
# Gebruik:
#   ./build-extension.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Updaten spritematex-submodule..."
git submodule update --init --recursive

echo "==> Installeren root dependencies..."
npm ci

echo "==> Compileren extensie (tsc -> out/)..."
npm run compile

echo "==> Bouwen SpritemateX-app (vite -> dist/)..."
(cd spritematex && npm ci && npm run build)

echo "==> Kopiëren spritematex/dist -> media/spritematex/"
rm -rf media/spritematex
mkdir -p media/spritematex
cp -R spritematex/dist/* media/spritematex/

echo "==> Packagen VSIX..."
npx --yes @vscode/vsce@latest package

echo ""
echo "Klaar: spritematex-vsc-plugin-*.vsix staat in deze map."
