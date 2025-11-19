# Perplexity Clone - Pixel Perfect AI Search Interface

A production-ready, pixel-perfect clone of Perplexity AI's chat interface with functional streaming responses. Built with Next.js 14, TypeScript, and TailwindCSS.

## ✨ Features

- **Pixel-Perfect UI**: Matches Perplexity's design with exact spacing, colors, and animations
- **Streaming Responses**: Real-time SSE (Server-Sent Events) streaming from mock API
- **Progressive States**: Shows "Searching...", plan updates, and source crawling states
- **Word-by-Word Animation**: Smooth text reveal matching Perplexity's UX
- **Source Citations**: Displays web sources with hover effects and external links
- **Multi-Turn Chat**: Support for 5-6+ messages in one conversation
- **TypeScript**: Fully typed for better DX and reliability
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Fade-in, slide-up transitions using TailwindCSS and Framer Motion

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom theme
- **Animations**: Framer Motion + CSS animations
- **Linting**: ESLint (Next.js config)
- **API**: Mock streaming endpoint (https://mock-askperplexity.piyushhhxyz.deno.net)

## 📦 Installation

```powershell
# Clone or navigate to project directory
cd c:\Users\gebin\OneDrive\Desktop\PERPLEX

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
PERPLEX/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page with search
│   └── chat/
│       └── page.tsx        # Chat interface route
├── components/
│   ├── Chat.tsx            # Main chat component with streaming logic
│   └── Message.tsx         # Message component (user/assistant)
├── types/
│   └── index.ts            # TypeScript interfaces
├── styles/
│   └── globals.css         # Global styles and animations
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🎨 UI Components

### Landing Page (`/`)
- Hero section with gradient background
- Search bar with icon and submit button
- Example queries (clickable)
- Smooth hover effects and transitions

### Chat Interface (`/chat`)
- Fixed header with logo and "New chat" button
- Auto-scrolling message container
- User messages (right-aligned, blue background)
- Assistant messages with:
  - Avatar with gradient
  - Loading animation (3 bouncing dots)
  - Plan/search progress indicators
  - Word-by-word text streaming
  - Source citations with hover cards
- Fixed input bar at bottom with loading state

## 🔧 Development

```powershell
# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Vercel

### Method 1: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? perplexity-clone
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Method 2: Deploy via Vercel Dashboard

1. Push code to GitHub:
```powershell
git init
git add .
git commit -m "Initial commit - Perplexity clone"
git remote add origin https://github.com/YOUR_USERNAME/perplexity-clone.git
git push -u origin main
```

2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Click "Deploy"

Your app will be live at: `https://perplexity-clone-XXXXX.vercel.app`

## 🎯 API Integration

The app calls the mock streaming API:

```typescript
POST https://mock-askperplexity.piyushhhxyz.deno.net
Content-Type: application/json

{
  "question": "your question here"
}
```

**Response Format**: SSE (Server-Sent Events) with `data:` prefixed JSON objects containing:
- `blocks`: Array with plan updates, web results, sources
- `text`: Streamed answer text
- `status`: Current state (PENDING, COMPLETED)

## 📝 Key Implementation Details

### Streaming Parser
The `Chat.tsx` component implements a custom SSE parser that:
1. Reads the response stream using `ReadableStream` API
2. Splits chunks by `\n\n` (SSE format)
3. Parses `data:` lines as JSON
4. Extracts plan updates, sources, and text content
5. Progressively updates the UI

### Word-by-Word Reveal
Text is split into words and revealed with a 30ms delay per word for smooth animation:

```typescript
const words = chunk.split(/(\s+)/)
// Reveal each word with setTimeout for visual effect
```

### Auto-Scroll Behavior
Container scrolls to bottom when new messages arrive:

```typescript
containerRef.current.scrollTo({
  top: containerRef.current.scrollHeight,
  behavior: 'smooth'
})
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:

```javascript
colors: {
  perplexity: {
    bg: '#F8F9FA',      // Background
    text: '#202124',    // Text color
    border: '#E8EAED',  // Borders
    accent: '#1A73E8',  // Primary blue
    hover: '#F1F3F4'    // Hover state
  }
}
```

### Animations
Modify `styles/globals.css` for custom keyframes and timings.

## 🐛 Troubleshooting

**TypeScript errors before install**: Run `npm install` first to get type definitions.

**Port already in use**: Change port with `npm run dev -- -p 3001`

**Streaming not working**: Check browser console for CORS or network errors. The mock API should return proper SSE format.

## 📄 License

MIT - Feel free to use for your portfolio or learning!

## 👨‍💻 Author

Built as a frontend engineering assignment to demonstrate:
- Pixel-perfect UI replication
- Complex streaming state management
- TypeScript best practices
- Production-ready code architecture

---

**Live Demo**: [Deploy and add link here]

**GitHub**: [Add your repo link]
