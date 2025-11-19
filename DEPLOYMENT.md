# Deployment Guide - Perplexity Clone

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps with zero configuration.

### Option A: Deploy from GitHub

1. **Push to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: Perplexity clone"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/perplexity-clone.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy" (no configuration needed!)

3. **Get Your Live URL**
   - Vercel will provide a URL like: `https://perplexity-clone-abc123.vercel.app`
   - Share this link in your assignment submission!

### Option B: Deploy with Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (run from project root)
vercel

# Deploy to production
vercel --prod
```

## Alternative: Deploy to Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

## Build Configuration

All platforms should auto-detect Next.js. If manual config needed:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

## Environment Variables

This project doesn't require any environment variables. The API endpoint is hardcoded since it's a public mock API.

If you wanted to make it configurable:

```env
NEXT_PUBLIC_API_URL=https://mock-askperplexity.piyushhhxyz.deno.net
```

## Pre-Deployment Checklist

- [ ] All files committed to git
- [ ] `npm run build` succeeds locally
- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] Test the production build: `npm run build && npm start`

## Post-Deployment

After deploying:

1. **Test the live app**:
   - Visit your deployed URL
   - Test the landing page search
   - Send a message in chat
   - Verify streaming works
   - Check sources load correctly

2. **Update README**:
   - Add your live demo link
   - Add your GitHub repo link

3. **Share Links**:
   - GitHub Repository: `https://github.com/YOUR_USERNAME/perplexity-clone`
   - Live Demo: `https://your-app.vercel.app`

## Troubleshooting

**Build fails with TypeScript errors**:
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` is present
- Run `npm run type-check` locally first

**Streaming doesn't work on deployed site**:
- Check browser console for CORS errors
- Verify the API endpoint is accessible from your deployed domain
- The mock API should work from any domain

**Site loads but looks broken**:
- Ensure TailwindCSS processed correctly (check build logs)
- Verify `styles/globals.css` is imported in `app/layout.tsx`

## Performance Optimization

The app is already optimized with:
- ✅ Next.js 14 App Router (automatic code splitting)
- ✅ TailwindCSS (purged unused styles)
- ✅ TypeScript (type safety)
- ✅ No external dependencies for streaming (native Fetch API)

## Monitoring

After deployment, monitor:
- **Vercel Analytics**: Automatic with Vercel deployment
- **Browser Console**: Check for any client-side errors
- **Network Tab**: Verify SSE streaming works correctly

---

Need help? Check the main README.md for detailed documentation.
