#!/bin/bash
# AI-Based Digital Road Register - Local Startup Script
# This script starts both the Backend API server (port 4000) and Frontend Vite server (port 5173).

export PATH="$HOME/.local/bin:$HOME/.local/nodejs/bin:$PATH"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "=========================================================="
echo "  🏛️  Starting AI-Based Digital Road Register Locally"
echo "=========================================================="

# Kill any existing processes on ports 4000 or 5173
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 1. Start Backend
echo "--> Starting Backend API on http://localhost:4000..."
cd "$BACKEND_DIR"
if [ -f ".venv/bin/python" ]; then
    .venv/bin/python main.py &
    BACKEND_PID=$!
else
    uv run --with flask python3 main.py &
    BACKEND_PID=$!
fi

# Wait for backend to be ready
sleep 2

# 2. Start Frontend
echo "--> Starting Frontend on http://localhost:5173..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both services are now running locally!"
echo "   🌐 Frontend UI:  http://localhost:5173"
echo "   ⚙️  Backend API:  http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait

