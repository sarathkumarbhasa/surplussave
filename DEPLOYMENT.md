# SurplusSave Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)
**Best for:** Quick deployment, automatic HTTPS, custom domains

#### Steps:
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

4. **Environment Variables**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add your Firebase credentials:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
     VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
     ```

---

### Option 2: Netlify (Free & Easy)
**Best for:** Simple drag-and-drop deployment, form handling

#### Steps:
1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or use Netlify CLI:
     ```bash
     npm i -g netlify-cli
     netlify login
     netlify deploy --prod --dir=dist
     ```

3. **Environment Variables**
   - In Netlify dashboard → Site settings → Build & deploy → Environment
   - Add the same Firebase credentials as above

---

### Option 3: Firebase Hosting (Free)
**Best for:** Integrated with Firebase, easy setup

#### Steps:
1. **Install Firebase Tools**
   ```bash
   npm i -g firebase-tools
   ```

2. **Initialize Firebase Hosting**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

### Option 4: GitHub Pages (Free)
**Best for:** Open source projects, GitHub integration

#### Steps:
1. **Create GitHub Action**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v3
       - uses: actions/setup-node@v3
         with:
           node-version: '18'
       - run: npm ci
       - run: npm run build
       - uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./dist
   ```

2. **Configure vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

---

### Option 5: Traditional Web Hosting
**Best for:** Shared hosting, VPS, dedicated servers

#### Steps:
1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload the entire `dist` folder to your web server
   - Ensure the server supports single-page applications (SPA routing)

3. **Server Configuration**
   - **Apache**: Add `.htaccess` file
     ```apache
     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
     ```
   - **Nginx**: Add to server config
     ```nginx
     location / {
       try_files $uri $uri/ /index.html;
     }
     ```

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create `.env.production` file
- [ ] Add Firebase credentials
- [ ] Test locally with production build

### 2. Build Optimization
- [ ] Run `npm run build`
- [ ] Check `dist` folder size
- [ ] Test `npm run preview` locally

### 3. Firebase Configuration
- [ ] Set up Firebase project
- [ ] Enable Firebase Authentication
- [ ] Enable Firebase Storage
- [ ] Configure Firestore security rules

### 4. Testing
- [ ] Test all user flows (donor, volunteer, admin)
- [ ] Test image uploads
- [ ] Test verification system
- [ ] Test mobile responsiveness

---

## 🌍 Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

### Firebase Hosting
1. Go to Firebase Console → Hosting
2. Add custom domain
3. Verify domain ownership

---

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use environment-specific variables
- Rotate API keys regularly

### Firebase Security Rules
```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Users can read posts, authenticated users can write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

// Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📱 Mobile App Deployment

### Progressive Web App (PWA)
The app can be deployed as a PWA for mobile users:

1. **Add PWA Manifest**
   ```json
   // public/manifest.json
   {
     "name": "SurplusSave",
     "short_name": "SurplusSave",
     "description": "Reduce food waste in Tirupati",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#1DB954"
   }
   ```

2. **Service Worker**
   - Add service worker for offline functionality
   - Enable caching for better performance

---

## 🚀 Quick Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash
echo "🚀 Deploying SurplusSave..."

# Build the project
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to your chosen platform
    echo "📦 Deploying..."
    # vercel --prod
    # or
    # netlify deploy --prod --dir=dist
    # or
    # firebase deploy
    
    echo "🎉 Deployment complete!"
else
    echo "❌ Build failed!"
    exit 1
fi
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 Performance Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Firebase Performance Monitoring**: App performance
- **Sentry**: Error tracking and debugging

### Optimization Tips
- Enable gzip compression
- Use CDN for static assets
- Optimize images and fonts
- Implement lazy loading
- Monitor Core Web Vitals

---

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript configuration
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Routing Issues**
   - Ensure server supports SPA routing
   - Check base URL configuration
   - Verify 404 handling

3. **Firebase Issues**
   - Check API key configuration
   - Verify Firebase project settings
   - Check security rules

4. **Image Upload Issues**
   - Verify Firebase Storage rules
   - Check file size limits
   - Test with different file types

### Debug Commands
```bash
# Check build output
npm run build && npm run preview

# Test environment variables
npm run build -- --mode production

# Check Firebase connection
firebase projects:list
```

---

## 🎯 Production Best Practices

1. **Use HTTPS** - All deployments should use HTTPS
2. **Monitor Performance** - Set up performance monitoring
3. **Regular Backups** - Backup Firebase data regularly
4. **Security Updates** - Keep dependencies updated
5. **User Testing** - Test with real users before launch
6. **Analytics** - Set up user analytics from day one

---

**Choose the deployment option that best fits your needs and budget. For most cases, Vercel or Netlify are the easiest and most reliable options!** 🚀
