#!/bin/bash
# UniCore Quick Start Script
# Run this once to set up everything from scratch
# Owner: Frank Darko

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       UniCore — Quick Start Setup        ║"
echo "║       Owner: Frank Darko                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌  Node.js is not installed."
  echo "    Please install Node.js v18+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌  Node.js v18+ required. You have $(node -v)."
  echo "    Please upgrade at https://nodejs.org"
  exit 1
fi

echo "✅  Node.js $(node -v) detected"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo ""
  echo "📋  Creating backend/.env from example..."
  cp backend/.env.example backend/.env
  echo "✅  backend/.env created"
  echo ""
  echo "⚠️   IMPORTANT: Open backend/.env and update:"
  echo "    - MONGO_URI (your MongoDB connection string)"
  echo "    - JWT_SECRET (change to a long random string)"
  echo "    - EMAIL_* settings (optional, for notifications)"
  echo ""
  read -p "    Press ENTER once you've updated .env to continue..."
fi

# Install backend
echo ""
echo "📦  Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then echo "❌  Backend install failed"; exit 1; fi
echo "✅  Backend dependencies installed"

# Install frontend
echo ""
echo "📦  Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then echo "❌  Frontend install failed"; exit 1; fi
echo "✅  Frontend dependencies installed"

# Seed database
echo ""
read -p "🌱  Seed the database with sample data? (y/n): " seed_confirm
if [ "$seed_confirm" == "y" ] || [ "$seed_confirm" == "Y" ]; then
  cd ../backend && npm run seed
  echo "✅  Database seeded"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Setup Complete! Next Steps:            ║"
echo "║                                          ║"
echo "║   Terminal 1:                            ║"
echo "║     cd backend && npm run dev            ║"
echo "║                                          ║"
echo "║   Terminal 2:                            ║"
echo "║     cd frontend && npm run dev           ║"
echo "║                                          ║"
echo "║   Open: http://localhost:5173            ║"
echo "║                                          ║"
echo "║   Admin: admin@unicore.edu.gh            ║"
echo "║   Pass:  Admin@123                       ║"
echo "╚══════════════════════════════════════════╝"
echo ""
