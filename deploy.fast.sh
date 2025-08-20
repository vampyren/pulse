#!/bin/bash
set -e

echo "🚀 Pulse Deploy (Fresh Start)"

# Build frontend
cd web
echo "📦 Installing frontend dependencies..."
npm ci

echo "🔍 Type checking..."
npm run typecheck

echo "🏗️ Building frontend..."
npm run build
cd ..

echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

echo "✅ Deploy complete!"
echo "🌍 Frontend: http://localhost:3000"
echo "🌍 Backend: http://localhost:4010"
echo ""
echo "To start development:"
echo "  Frontend: cd web && npm run dev"
echo "  Backend:  cd backend && npm run dev"
