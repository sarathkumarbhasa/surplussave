#!/bin/bash

echo "🚀 SurplusSave Deployment Script"
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "📝 Please create .env file with Firebase credentials"
    echo "💡 Copy .env.example to .env and fill in your values"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Show build size
    echo "📊 Build size:"
    du -sh dist/
    
    echo ""
    echo "🌐 Choose your deployment platform:"
    echo "1. Vercel (vercel --prod)"
    echo "2. Netlify (netlify deploy --prod --dir=dist)"
    echo "3. Firebase (firebase deploy)"
    echo "4. Preview locally (npm run preview)"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo "🚀 Deploying to Vercel..."
            vercel --prod
            ;;
        2)
            echo "🚀 Deploying to Netlify..."
            netlify deploy --prod --dir=dist
            ;;
        3)
            echo "🚀 Deploying to Firebase..."
            firebase deploy
            ;;
        4)
            echo "👀 Starting preview server..."
            npm run preview
            ;;
        *)
            echo "❌ Invalid choice. Build files are ready in 'dist' folder."
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment complete!"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    echo "🔧 Please check the error messages above"
    exit 1
fi
