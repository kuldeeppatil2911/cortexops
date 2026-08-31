#!/usr/bin/env pwsh

# CortexOps - One-Click Deployment to Render.com
# This script automates the entire deployment process

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CortexOps - Automated Deployment to Render.com            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Git
Write-Host "✓ Step 1: Verifying Git installation..." -ForegroundColor Green
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Git not found. Please install Git from https://git-scm.com" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git is installed" -ForegroundColor Green
Write-Host ""

# Step 2: Build Frontend
Write-Host "📦 Step 2: Building production frontend..." -ForegroundColor Green
npm --prefix frontend run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Commit changes
Write-Host "📝 Step 3: Committing deployment files..." -ForegroundColor Green
git add .
git commit -m "Add production deployment configuration" --allow-empty
Write-Host "✓ Files committed" -ForegroundColor Green
Write-Host ""

# Step 4: Show GitHub instructions
Write-Host "🔗 Step 4: Create GitHub Repository" -ForegroundColor Green
Write-Host ""
Write-Host "1. Open browser: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Create repository named 'cortexops'" -ForegroundColor Yellow
Write-Host "3. DO NOT initialize with README" -ForegroundColor Yellow
Write-Host "4. Copy the HTTPS URL" -ForegroundColor Yellow
Write-Host ""

$githubUrl = Read-Host "Enter GitHub HTTPS URL (e.g., https://github.com/username/cortexops.git)"

if (-not $githubUrl) {
    Write-Host "✗ No URL provided" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing code to GitHub..." -ForegroundColor Green
git remote add origin $githubUrl
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Code pushed to GitHub successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    READY FOR DEPLOYMENT!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Next Steps (2 minutes):" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open: https://dashboard.render.com" -ForegroundColor Yellow
Write-Host "2. Click: New ➜ Web Service" -ForegroundColor Yellow
Write-Host "3. Connect your GitHub account" -ForegroundColor Yellow
Write-Host "4. Select: cortexops repository" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Configure as follows:" -ForegroundColor Yellow
Write-Host "   Name:              cortexops" -ForegroundColor Cyan
Write-Host "   Build Command:     cd frontend && npm ci && npm run build && cd ../backend && npm ci" -ForegroundColor Cyan
Write-Host "   Start Command:     node backend/server-prod.js" -ForegroundColor Cyan
Write-Host "   Instance Type:     Free" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Add Environment Variable:" -ForegroundColor Yellow
Write-Host "   MONGO_URI = mongodb+srv://cortexops:kp29112004@cluster0.cglyv.mongodb.net/?appName=Cluster0" -ForegroundColor Cyan
Write-Host ""
Write-Host "7. Click: Deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Wait 3-5 minutes for deployment to complete" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Your live app will be at: https://cortexops-YOUR-USERNAME.onrender.com" -ForegroundColor Green
Write-Host ""
