# AI Pulse — Local Development Startup Script
# Run this from the project root: .\start-dev.ps1

Write-Host "=== AI Pulse Dev Setup ===" -ForegroundColor Cyan

# Step 1: Start DB + Redis via Docker
Write-Host "`n[1/4] Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker failed. Make sure Docker Desktop is running." -ForegroundColor Red
    Write-Host "Start Docker Desktop from the taskbar, wait for it to finish loading, then re-run this script." -ForegroundColor Yellow
    exit 1
}

# Wait for DB to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
$retries = 0
do {
    Start-Sleep -Seconds 2
    $retries++
    $check = docker exec aipulse-db pg_isready -U aipulse 2>&1
} while ($check -notlike "*accepting connections*" -and $retries -lt 20)

if ($retries -ge 20) {
    Write-Host "ERROR: PostgreSQL did not start in time." -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL ready!" -ForegroundColor Green

# Step 2: Setup Python venv
Write-Host "`n[2/4] Setting up Python virtual environment..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Virtual environment created."
}

# Activate venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing Python dependencies (this may take a minute)..."
pip install -r requirements.txt --quiet

# Copy .env for local dev
if (-not (Test-Path ".env")) {
    Copy-Item ".env.local" ".env"
    Write-Host "Created .env from .env.local"
}

# Step 3: Start backend in background
Write-Host "`n[3/4] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath ".\.venv\Scripts\python.exe" `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" `
    -WorkingDirectory (Get-Location) `
    -PassThru -WindowStyle Normal
Write-Host "Backend started (PID: $($backendJob.Id))" -ForegroundColor Green

Set-Location ..

# Step 4: Setup and start frontend
Write-Host "`n[4/4] Setting up and starting Next.js frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages (this may take a minute)..."
    npm install --silent
}

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
}

Write-Host "`n=== Everything is starting up ===" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "API docs: http://localhost:8000/api/docs" -ForegroundColor Green
Write-Host "`nRemember to add your ANTHROPIC_API_KEY to backend/.env`n" -ForegroundColor Yellow

npm run dev
