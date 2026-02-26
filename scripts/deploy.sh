#!/bin/bash

# 🚀 Quick deploy script for your portfolio
# Usage: npm run deploy

echo ""
echo "🚀 Deploying your portfolio..."
echo ""

# Add all changes
git add .

# Create commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
git commit -m "Update portfolio — $TIMESTAMP"

# Push to GitHub (Vercel auto-deploys)
git push origin main

echo ""
echo "✅ Done! Your changes will be live in ~60 seconds."
echo "   Check: https://portfolio-uttambakori.vercel.app"
echo ""
