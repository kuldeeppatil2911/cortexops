#!/bin/bash
# Automated deployment script for CortexOps

set -e

echo "🚀 CortexOps Cloud Deployment Script"
echo "===================================="

# Check prerequisites
if ! command -v git &> /dev/null; then
    echo "❌ Git not installed. Please install Git first."
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm --prefix frontend run build

# Get repository info
echo ""
echo "📝 Repository Information:"
echo "Local repo path: $(pwd)"

echo ""
echo "✅ Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Create new repository on GitHub: https://github.com/new"
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/cortexops.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Go to https://render.com and deploy from GitHub"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
