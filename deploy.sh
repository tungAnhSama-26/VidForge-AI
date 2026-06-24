#!/bin/bash
set -e

echo "=========================================="
echo "🚀 STARTING VIDFORGE-AI DEPLOYMENT"
echo "=========================================="

echo "📥 1. Cloning / Updating Repository..."
cd ~
if [ ! -d "VidForge-AI" ]; then
  git clone https://github.com/tungAnhSama-26/VidForge-AI.git
  cd VidForge-AI
else
  cd VidForge-AI
  git pull origin main
fi

echo "🔨 2. Building Application with Docker Compose..."
sudo docker compose -f docker-compose.prod.yml build

echo "🚀 3. Starting Application..."
sudo docker compose -f docker-compose.prod.yml up -d

echo "🗄️ 4. Pushing Database Schema Migrations..."
# Run drizzle-kit push using a temporary node container in the same network
sudo docker run --rm \
  --network vidforge-ai_default \
  -v $(pwd):/app \
  -w /app/packages/db \
  -e DATABASE_URL=postgres://postgres:password@db:5432/vidforge \
  node:20-alpine sh -c "npm install && npx drizzle-kit push" || echo "⚠️ Migration warning: Please check DB schema."

echo "=========================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "Your app should now be running on port 80/3000."
echo "=========================================="