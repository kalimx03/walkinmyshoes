# Design Document: Walk in My Shoes

## 1. System Architecture

### 1.1 Architecture Overview

Walk in My Shoes is a **client-side single-page application (SPA)** with no backend server. The architecture follows a **serverless, browser-first design** where all computation, state management, and data persistence occur in the user's browser.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application Layer                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Simulation  │  │  AR Auditor  │  │  Dashboard   │ │ │
│  │  │  Components  │  │  Component   │  │  Component   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │           │                │                │           │ │
│  │           └────────────────┴────────────────┘           │ │
│  │                          │                               │ │
│  │              ┌───────────▼──────────┐                   │ │
│  │              │   State Management   │                   │ │
│  │              │   (React useState)   │                   │ │
│  │              └───────────┬──────────┘                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                             │                                │
│  ┌──────────────────────────┴──────────────────────────┐   │
│  │           Browser APIs & Storage Layer              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │
│  │  │ localStorage │  │  MediaDevices│  │  WebGL    │ │   │
│  │  │  (Persist)   │  │   (Camera)   │  │ (A-Frame) │ │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS API Calls
                             ▼
              ┌──────────────────────────────┐
              │   Google Gemini API Cloud    │
              │  ┌────────────────────────┐  │
              │  │  Gemini 3 Pro Preview  │  │
              │  │  (Vision + Reasoning)  │  │
              │  └────────────────────────┘  │
              │  ┌────────────────────────┐  │
              │  │ Gemini 2.5 Flash Image │  │
              │  │   (Image Editing)      │  │
              │  └────────────────────────┘  │
              └──────────────────────────────┘
```

### 1.2 Key Architectural Decisions

**Decision 1: No Backend Server**
- Rationale: Reduces infrastructure costs, simplifies deployment, eliminates server maintenance
- Trade-off: No user authentication, no cross-device sync, limited to browser storage

**Decision 2: Direct Gemini API Integration**
- Rationale: Leverage cutting-edge multimodal AI without building custom ML infrastructure
- Trade-off: API costs scale with usage, requires API key management, external dependency

**Decision 3: localStorage for Persistence**
- Rationale: Simple, synchronous, no network latency, works offline
- Trade-off: ~5-10MB limit, single-device only, no backup/recovery

**Decision 4: A-Frame for 3D Rendering**
- Rationale: Declarative WebGL framework, VR-ready, extensive ecosystem
- Trade-off: Bundle size, learning curve for custom interactions

## 2. Technology Stack

### 2.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 19.2.4 | UI component architecture |
| **Language** | TypeScript | 5.8.2 | Type safety and developer experience |
| **Build Tool** | Vite | 6.2.0 | Fast dev server, optimized production builds |
| **3D Engine** | A-Frame | (via CDN) | WebGL-based VR/3D scenes |
| **AI/ML** | Google Gemini API | 1.38.0 | Vision analysis, chat, image editing |
| **Charts** | Recharts | 3.7.0 | Data visualization for dashboard |
| **Styling** | Tailwind CSS | (via CDN) | Utility-first CSS framework |

### 2.2 Browser APIs Used

- **MediaDevices API**: Camera access for AR auditor
- **Canvas API**: Image capture and manipulation
- **localStorage API**: Persistent data storage
- **WebGL**: 3D rendering via A-Frame
- **Clipboard API**: Export transcripts and reports

### 2.3 External Dependencies

**Google Gemini API Models:**
- `gemini-3-pro-preview`: High-reasoning vision model for accessibility audits and chat
- `gemini-2.5-flash-image`: Image editing for visual remediation

**CDN Resources:**
- A-Frame library (3D framework)
- Tailwind CSS (styling)
- Custom fonts and textures


## 3. Module Breakdown

### 3.1 Application Core (`App.tsx`)

**Responsibilities:**
- Root component and application orchestrator
- Global state management (empathy stats, chat histories)
- View routing and navigation logic
- localStorage persistence layer
- Onboarding flow control

**State Structure:**
```typescript
interface EmpathyStats {
  scenariosCompleted: number;
  empathyScore: number;
  auditReportsGenerated: number;
  timeSpentMinutes: number;
  chatHistories: Record<string, ChatMessage[]>;
}
```

**Key Methods:**
- `completeScenario(score)`: Updates stats when user finishes simulation
- `updateChatHistory(scenarioId, messages)`: Persists AI conversations
- `renderContent()`: View router based on currentView state

### 3.2 Simulation Modules

**Components:**
- `VisualImpairmentScene.tsx`: City block navigation with vision filters
- `HearingLossScene.tsx`: Presentation with audio degradation
- `MotorDisabilityScene.tsx`: Office building with movement restrictions
- `ColorBlindnessScene.tsx`: Marketplace with color vision deficiency filters

**Common Pattern:**
```typescript
interface SimulationProps {
  onComplete: (score: number) => void;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
}
```

**A-Frame Integration:**
- Declarative 3D scenes using custom JSX elements
- Entity-component-system architecture
- Camera controls and movement restrictions
- Visual filters (blur, color matrices, contrast)

### 3.3 AR Auditor Module (`ARAuditor.tsx`)

**Responsibilities:**
- Camera stream management
- Image capture and analysis orchestration
- AR overlay rendering (SVG-based)
- Visual remediation workflow
- Audit report generation

**State Management:**
```typescript
{
  isScanning: boolean;           // Camera active
  isLiveMode: boolean;           // Continuous vs manual scan
  results: AuditResults | null;  // Detected issues
  capturedFrame: string | null;  // Base64 image
  remediatedImage: string | null; // AI-edited image
  activeIssue: number | null;    // Hover state for overlay
}
```

**Key Features:**
- Real-time camera feed with WebRTC
- Manual scan button (single capture)
- Live mode (auto-scan every 15 seconds)
- SVG overlay with normalized coordinates (0-1000 scale)
- Interactive issue cards on hover
- Before/after image comparison

### 3.4 AI Guide Module (`AIGuide.tsx`)

**Responsibilities:**
- Contextual AI chat interface
- Conversation history management
- Suggested questions
- Transcript export

**Integration Points:**
- Embedded in simulations (sidebar)
- Standalone in AR auditor
- Context-aware system instructions

**Chat Flow:**
```
User Input → geminiService.createGuideChat() → Gemini API
                                              ↓
                                         Response
                                              ↓
                                    Update History
                                              ↓
                                    Persist to App State
```

### 3.5 Dashboard Module (`ImpactDashboard.tsx`)

**Responsibilities:**
- Progress visualization (Recharts)
- Empathy metrics display
- Certification tracking
- Conversation log viewer

**Data Visualization:**
- Bar chart: Knowledge, Awareness, Empathy, Action scores
- Progress bars: Certification completion
- Stat cards: Scenarios, score, audits, time

### 3.6 Gemini Service (`services/gemini.ts`)

**API Methods:**

**1. `analyzeAccessibility(imageBase64: string)`**
- Model: `gemini-3-pro-preview`
- Input: Base64 JPEG image
- Output: Structured JSON with issues and compliance score
- Features: Spatial reasoning, bounding box detection, cost estimation
- Thinking budget: 24,000 tokens for deep reasoning

**2. `editImage(imageBase64: string, prompt: string)`**
- Model: `gemini-2.5-flash-image`
- Input: Base64 image + remediation prompt
- Output: Base64 PNG of edited image
- Use case: Visual "before/after" for accessibility fixes

**3. `createGuideChat(context: string, history: [])`**
- Model: `gemini-3-pro-preview`
- Returns: Chat session object
- Features: Context-aware responses, persistent history

**Response Schema (Accessibility Audit):**
```typescript
{
  issues: Array<{
    type: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
    description: string;
    recommendation: string;
    costEstimate: string;
    coordinates: [ymin, xmin, ymax, xmax]; // 0-1000 scale
  }>;
  overallComplianceScore: number; // 0-100
}
```

### 3.7 Layout & Navigation (`Layout.tsx`)

**Responsibilities:**
- Persistent header navigation
- Logo and branding
- View switching
- Responsive mobile menu

### 3.8 Onboarding Module (`Onboarding.tsx`)

**Responsibilities:**
- First-time user tutorial (4 steps)
- Feature introduction
- Skip option
- Completion state persistence

## 4. Data Storage Design

### 4.1 localStorage Schema

**Key: `walkinmyshoes_stats`**
```json
{
  "scenariosCompleted": 2,
  "empathyScore": 75,
  "auditReportsGenerated": 3,
  "timeSpentMinutes": 45,
  "chatHistories": {
    "VISION_SCENE": [
      {
        "role": "user",
        "text": "Why is this so difficult?",
        "timestamp": 1234567890,
        "isHidden": false
      },
      {
        "role": "model",
        "text": "Vision impairment creates...",
        "timestamp": 1234567891
      }
    ],
    "AR_AUDITOR": [...]
  }
}
```

**Key: `walkinmyshoes_onboarding_v1`**
```json
"true"  // Simple flag for completion
```

### 4.2 Data Flow Patterns

**Pattern 1: Simulation Completion**
```
User completes scenario
    ↓
SimulationComponent.onComplete(score)
    ↓
App.completeScenario(score)
    ↓
Update stats state (increment, calculate average)
    ↓
useEffect triggers localStorage.setItem()
    ↓
Navigate to Dashboard
```

**Pattern 2: AI Chat Interaction**
```
User types message
    ↓
AIGuide.handleSendMessage(text)
    ↓
Update local history state
    ↓
geminiService.chat.sendMessage()
    ↓
Receive AI response
    ↓
Update history with response
    ↓
AIGuide.onUpdateHistory(messages)
    ↓
App.updateChatHistory(scenarioId, messages)
    ↓
Persist to localStorage
```

**Pattern 3: AR Audit Workflow**
```
User clicks "SCAN"
    ↓
Capture video frame to canvas
    ↓
Convert to base64 JPEG
    ↓
geminiService.analyzeAccessibility(image)
    ↓
Parse JSON response
    ↓
Update results state
    ↓
Render SVG overlay with bounding boxes
    ↓
User hovers issue → Show detail card
    ↓
User clicks "Visual Fix" → Navigate to remediate tab
    ↓
geminiService.editImage(image, prompt)
    ↓
Display before/after comparison
```

### 4.3 State Management Strategy

**Global State (App.tsx):**
- Empathy statistics
- Chat histories
- Current view
- Onboarding status

**Local Component State:**
- UI interactions (hover, loading, expanded)
- Form inputs
- Temporary data (camera stream, canvas)

**No State Management Library:**
- Rationale: Application complexity doesn't justify Redux/Zustand
- React's built-in useState + props drilling is sufficient
- Performance is acceptable for current scale


## 5. API Structure

### 5.1 Gemini API Integration

**Authentication:**
- API key stored in `.env.local` as `GEMINI_API_KEY`
- Injected at build time via Vite's `define` config
- Exposed as `process.env.API_KEY` in client code

**Security Considerations:**
- ⚠️ API key is exposed in client bundle (visible in browser DevTools)
- Mitigation: Use API key restrictions (HTTP referrer, rate limits)
- Production recommendation: Proxy through serverless function (Vercel, Netlify)

### 5.2 API Call Patterns

**Accessibility Audit API Call:**
```typescript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent

Headers:
  Content-Type: application/json
  Authorization: Bearer {API_KEY}

Body:
{
  "contents": {
    "parts": [
      { "text": "PERFORM ARCHITECTURAL ACCESSIBILITY AUDIT..." },
      { "inlineData": { "mimeType": "image/jpeg", "data": "{base64}" } }
    ]
  },
  "config": {
    "systemInstruction": "You are a World-Class Accessibility Consultant...",
    "responseMimeType": "application/json",
    "thinkingConfig": { "thinkingBudget": 24000 },
    "responseSchema": { ... }
  }
}

Response:
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\"issues\": [...], \"overallComplianceScore\": 85}"
      }]
    }
  }]
}
```

**Image Edit API Call:**
```typescript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent

Body:
{
  "contents": {
    "parts": [
      { "inlineData": { "data": "{base64}", "mimeType": "image/jpeg" } },
      { "text": "YOU ARE AN ARCHITECTURAL VISUALIZATION ENGINE..." }
    ]
  }
}

Response:
{
  "candidates": [{
    "content": {
      "parts": [{
        "inlineData": {
          "mimeType": "image/png",
          "data": "{base64_edited_image}"
        }
      }]
    }
  }]
}
```

**Chat API Call:**
```typescript
// Initial chat creation
const chat = ai.chats.create({
  model: 'gemini-3-pro-preview',
  history: [...],
  config: { systemInstruction: "..." }
});

// Send message
const response = await chat.sendMessage({ message: "User question" });
const aiText = response.text;
```

### 5.3 Rate Limiting & Error Handling

**Rate Limits (Gemini API):**
- Free tier: 15 requests/minute, 1500 requests/day
- Paid tier: Higher limits based on plan

**Error Handling Strategy:**
```typescript
try {
  const result = await geminiService.analyzeAccessibility(image);
  // Success path
} catch (error) {
  console.error("API Error:", error);
  // Fallback: Return empty results
  return { issues: [], overallComplianceScore: 0 };
}
```

**User-Facing Error Messages:**
- Camera permission denied: Alert with instructions
- API failure: "I encountered a connectivity issue. Please try again."
- Network timeout: Graceful degradation, retry option

## 6. UI Flow & User Journey

### 6.1 First-Time User Flow

```
Landing Page
    ↓
Onboarding Modal (4 steps)
    ↓ [Skip or Complete]
Landing Page (onboarding dismissed)
    ↓ [Start Training]
Simulation Selector
    ↓ [Select scenario]
Simulation Scene (with AI Guide)
    ↓ [Complete]
Dashboard (stats updated)
```

### 6.2 Returning User Flow

```
Landing Page (no onboarding)
    ↓ [Start Training]
Simulation Selector
    ↓ [Select scenario]
Simulation Scene
    ↓ [Complete]
Dashboard
    ↓ [View progress, chat logs]
```

### 6.3 AR Auditor Flow

```
Landing Page
    ↓ [AR Auditor]
AR Auditor (camera off)
    ↓ [Initialize Lens]
Camera Permission Request
    ↓ [Allow]
Live Camera Feed
    ↓ [SCAN button or Live Mode]
AI Analysis (loading state)
    ↓
Results with AR Overlay
    ↓ [Hover issue]
Detail Card Popup
    ↓ [Visual Fix]
Remediate Tab
    ↓ [Enter prompt, Synthesize]
Before/After Comparison
    ↓ [Export or Flush]
```

### 6.4 Navigation Structure

```
┌─────────────────────────────────────────┐
│         Persistent Header Nav            │
│  [Logo] [Simulations] [AR] [Dashboard]  │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    Landing    Simulations   AR Auditor
        │           │
        │       ┌───┴───┬───────┬────────┐
        │       ▼       ▼       ▼        ▼
        │    Vision  Hearing  Motor  ColorBlind
        │       │       │       │        │
        │       └───────┴───────┴────────┘
        │                 │
        └─────────────────┼─────────────────┐
                          ▼                 ▼
                      Dashboard         Results
```

### 6.5 Component Hierarchy

```
App
├── Layout
│   ├── Header (persistent)
│   └── Main Content (dynamic)
│       ├── Landing
│       ├── SimulationSelector
│       ├── VisualImpairmentScene
│       │   └── AIGuide (sidebar)
│       ├── HearingLossScene
│       │   └── AIGuide
│       ├── MotorDisabilityScene
│       │   └── AIGuide
│       ├── ColorBlindnessScene
│       │   └── AIGuide
│       ├── ARAuditor
│       │   ├── Camera Feed
│       │   ├── AR Overlay (SVG)
│       │   ├── Sidebar (Report/Remediate tabs)
│       │   └── AIGuide
│       └── ImpactDashboard
│           ├── Stats Cards
│           ├── Charts (Recharts)
│           └── Conversation Logs
└── Onboarding (conditional overlay)
```

## 7. Data Flow Diagrams

### 7.1 Application Initialization

```
Browser loads index.html
    ↓
Load React bundle (Vite)
    ↓
ReactDOM.render(<App />)
    ↓
App.tsx useState initialization
    ↓
Check localStorage for 'walkinmyshoes_stats'
    ↓
    ├─ Found → Parse and load into state
    └─ Not found → Initialize default stats
    ↓
Check localStorage for 'walkinmyshoes_onboarding_v1'
    ↓
    ├─ 'true' → showOnboarding = false
    └─ Not found → showOnboarding = true
    ↓
Render Layout + Landing Page
    ↓
    └─ If showOnboarding → Overlay Onboarding modal
```

### 7.2 Simulation Interaction Flow

```
User selects scenario
    ↓
App.setCurrentView(VISION_SCENE)
    ↓
VisualImpairmentScene mounts
    ↓
Load A-Frame scene (WebGL initialization)
    ↓
User navigates 3D environment
    ↓
    ├─ User opens AI Guide
    │   ↓
    │   geminiService.createGuideChat(context, history)
    │   ↓
    │   User asks question
    │   ↓
    │   chat.sendMessage(message)
    │   ↓
    │   Gemini API response
    │   ↓
    │   Update chat history
    │   ↓
    │   onUpdateHistory → App.updateChatHistory
    │   ↓
    │   Persist to localStorage
    │
    └─ User completes scenario
        ↓
        onComplete(score)
        ↓
        App.completeScenario(score)
        ↓
        Update stats (increment, calculate)
        ↓
        useEffect → localStorage.setItem
        ↓
        Navigate to Dashboard
```

### 7.3 AR Audit Data Flow

```
User clicks "Initialize Lens"
    ↓
navigator.mediaDevices.getUserMedia({ video: {...} })
    ↓
    ├─ Permission granted
    │   ↓
    │   videoRef.srcObject = stream
    │   ↓
    │   setSensorStatus('ACTIVE')
    │   ↓
    │   Display live camera feed
    │
    └─ Permission denied
        ↓
        setSensorStatus('DENIED')
        ↓
        Show error alert

User clicks "SCAN" (or Live Mode triggers)
    ↓
canvas.getContext('2d').drawImage(video, 0, 0)
    ↓
canvas.toDataURL('image/jpeg', 0.8)
    ↓
Extract base64 string
    ↓
setCapturedFrame(base64)
    ↓
setLoading(true)
    ↓
geminiService.analyzeAccessibility(base64)
    ↓
    ├─ API Success
    │   ↓
    │   Parse JSON response
    │   ↓
    │   Validate coordinates (filter invalid)
    │   ↓
    │   setResults({ issues, score })
    │   ↓
    │   setLoading(false)
    │   ↓
    │   Render AR overlay (SVG with bounding boxes)
    │   ↓
    │   User hovers issue
    │   ↓
    │   setActiveIssue(index)
    │   ↓
    │   Show detail card (foreignObject in SVG)
    │
    └─ API Failure
        ↓
        console.error
        ↓
        setResults({ issues: [], score: 0 })
        ↓
        setLoading(false)

User clicks "Visual Fix"
    ↓
setRemediationPrompt(auto-generated)
    ↓
setSidebarTab('remediate')
    ↓
User edits prompt (optional)
    ↓
User clicks "Synthesize Visual Fix"
    ↓
setIsRemediating(true)
    ↓
geminiService.editImage(capturedFrame, prompt)
    ↓
    ├─ Success
    │   ↓
    │   setRemediatedImage(base64PNG)
    │   ↓
    │   setIsRemediating(false)
    │   ↓
    │   Display before/after comparison
    │
    └─ Failure
        ↓
        console.error
        ↓
        setIsRemediating(false)
```

### 7.4 State Synchronization Flow

```
Component State Change
    ↓
setState(newValue)
    ↓
React re-renders component
    ↓
    ├─ Local state only → No propagation
    │
    └─ Needs persistence
        ↓
        Call parent callback (e.g., onUpdateHistory)
        ↓
        App.tsx receives update
        ↓
        Update global stats state
        ↓
        useEffect detects stats change
        ↓
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
        ↓
        Data persisted
```


## 8. Security & Privacy Design

### 8.1 Data Privacy

**Client-Side Only Architecture:**
- No user data transmitted to any server (except Gemini API)
- All progress, stats, and chat histories stored in browser localStorage
- No user authentication or account system
- No analytics or tracking (privacy-first)

**Camera Access:**
- Explicit permission request via browser API
- Camera stream never recorded or stored
- Only single frames captured for analysis
- User can revoke permission at any time

**Image Transmission:**
- Captured images sent only to Google Gemini API
- Transmitted over HTTPS
- Not stored on any server after analysis
- User controls when images are captured

### 8.2 API Key Security

**Current Implementation (Development):**
- API key in `.env.local` file
- Injected at build time via Vite
- ⚠️ Exposed in client bundle (visible in DevTools)

**Production Recommendations:**
```
Option 1: Serverless Proxy (Recommended)
┌─────────┐      ┌──────────────┐      ┌─────────────┐
│ Browser │─────▶│ Vercel Edge  │─────▶│ Gemini API  │
│         │      │ Function     │      │             │
└─────────┘      │ (API key     │      └─────────────┘
                 │  hidden)     │
                 └──────────────┘

Option 2: API Key Restrictions
- Restrict by HTTP referrer (your domain only)
- Set daily quota limits
- Monitor usage in Google Cloud Console

Option 3: Backend Service
- Build Node.js/Python backend
- Store API key server-side
- Implement rate limiting per user
```

### 8.3 Content Security

**Input Validation:**
- Image size limits (prevent memory exhaustion)
- Base64 validation before API calls
- Sanitize user prompts for image editing

**XSS Prevention:**
- React's built-in escaping for text content
- No `dangerouslySetInnerHTML` except for controlled CSS
- SVG overlay uses React components (not raw HTML)

## 9. Performance Optimization

### 9.1 Bundle Size Optimization

**Current Bundle Strategy:**
- Vite code splitting (automatic)
- React lazy loading (not implemented yet)
- A-Frame loaded via CDN (not in bundle)
- Tailwind CSS via CDN (not in bundle)

**Optimization Opportunities:**
```typescript
// Lazy load simulation components
const VisualImpairmentScene = React.lazy(() => 
  import('./components/VisualImpairmentScene')
);

// Lazy load dashboard
const ImpactDashboard = React.lazy(() => 
  import('./components/ImpactDashboard')
);
```

### 9.2 Image Processing Optimization

**Camera Capture:**
- Target resolution: 1920x1080 (balance quality vs. size)
- JPEG compression: 0.8 quality (reduces base64 size)
- Canvas reuse (single canvas element)

**Base64 Encoding:**
- ~33% size increase from binary
- 1920x1080 JPEG @ 0.8 quality ≈ 200-400KB
- Base64 ≈ 270-530KB
- Acceptable for API transmission

### 9.3 API Call Optimization

**Rate Limiting:**
- Live mode: 15-second intervals (4 calls/minute)
- Manual mode: User-controlled
- Prevents API quota exhaustion

**Caching Strategy (Not Implemented):**
```typescript
// Potential optimization: Cache recent analyses
const analysisCache = new Map<string, AuditResults>();

async function analyzeWithCache(imageHash: string, imageBase64: string) {
  if (analysisCache.has(imageHash)) {
    return analysisCache.get(imageHash);
  }
  const result = await geminiService.analyzeAccessibility(imageBase64);
  analysisCache.set(imageHash, result);
  return result;
}
```

### 9.4 Rendering Performance

**3D Scenes (A-Frame):**
- Target: 30+ FPS on mid-range devices
- Optimization: Low-poly models, texture atlases
- Limitation: WebGL performance varies by device

**AR Overlay (SVG):**
- Lightweight vector graphics
- CSS transforms for animations
- Conditional rendering (only when scanning)

**React Rendering:**
- Minimal re-renders (useState scoped to components)
- No unnecessary parent re-renders
- useCallback/useMemo not needed at current scale

## 10. Accessibility Considerations

### 10.1 Irony Acknowledgment

This is an accessibility training app that must itself be accessible. Key considerations:

**Keyboard Navigation:**
- All interactive elements focusable
- Tab order logical
- Enter/Space for button activation

**Screen Reader Support:**
- Semantic HTML (header, nav, main, button)
- ARIA labels for icon-only buttons
- Alt text for images (where applicable)

**Visual Accessibility:**
- High contrast UI (slate-900 bg, white text)
- Focus indicators (Tailwind's focus: ring)
- Text size: 14px+ for body, scalable

**Limitations:**
- 3D simulations not screen-reader accessible (by design)
- AR overlay visual-only (no audio descriptions)
- Color-coded severity (also uses icons for redundancy)

### 10.2 WCAG Compliance

**Target: WCAG 2.1 Level AA**

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.4.3 Contrast | ✅ Pass | Slate-900 bg + white text = 15:1 ratio |
| 2.1.1 Keyboard | ✅ Pass | All controls keyboard accessible |
| 2.4.7 Focus Visible | ✅ Pass | Tailwind focus rings |
| 3.2.3 Consistent Navigation | ✅ Pass | Persistent header |
| 4.1.2 Name, Role, Value | ⚠️ Partial | Some ARIA labels missing |

## 11. Deployment Architecture

### 11.1 Build Process

```bash
# Development
npm run dev
  ↓
Vite dev server (port 3000)
  ↓
Hot module replacement (HMR)

# Production
npm run build
  ↓
Vite build (TypeScript → JavaScript)
  ↓
Tree shaking, minification
  ↓
Output: dist/ folder
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   └── index-[hash].css
  └── ...
```

### 11.2 Hosting Options

**Option 1: Static Hosting (Recommended)**
- Vercel, Netlify, GitHub Pages
- Zero configuration
- Automatic HTTPS
- CDN distribution
- Cost: Free tier sufficient

**Option 2: Cloud Storage + CDN**
- AWS S3 + CloudFront
- Google Cloud Storage + Cloud CDN
- Azure Blob Storage + CDN
- Cost: ~$1-5/month for low traffic

**Deployment Steps (Vercel Example):**
```bash
1. Connect GitHub repository
2. Configure build command: npm run build
3. Set output directory: dist
4. Add environment variable: GEMINI_API_KEY
5. Deploy (automatic on git push)
```

### 11.3 Environment Configuration

**.env.local (Development):**
```bash
GEMINI_API_KEY=your_api_key_here
```

**Vercel Environment Variables:**
```
GEMINI_API_KEY = [secret value]
```

**Vite Config Injection:**
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

## 12. Testing Strategy

### 12.1 Current Testing Status

**Reality Check:**
- ❌ No unit tests implemented
- ❌ No integration tests
- ❌ No E2E tests
- ✅ Manual testing only

### 12.2 Recommended Testing Approach

**Unit Tests (Vitest + React Testing Library):**
```typescript
// Example: geminiService.test.ts
describe('geminiService', () => {
  it('should handle API errors gracefully', async () => {
    const result = await geminiService.analyzeAccessibility('invalid');
    expect(result).toEqual({ issues: [], overallComplianceScore: 0 });
  });
});

// Example: App.test.tsx
describe('App', () => {
  it('should load stats from localStorage', () => {
    localStorage.setItem('walkinmyshoes_stats', JSON.stringify({
      scenariosCompleted: 2,
      empathyScore: 75
    }));
    render(<App />);
    // Assert stats displayed correctly
  });
});
```

**Integration Tests:**
- Test full user flows (simulation → completion → dashboard)
- Mock Gemini API responses
- Verify localStorage persistence

**E2E Tests (Playwright):**
- Camera permission flow
- AR audit workflow
- Chat interaction
- Navigation between views

### 12.3 Manual Testing Checklist

**Browser Compatibility:**
- [ ] Chrome 90+ (primary)
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

**Device Testing:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad landscape)
- [ ] Mobile (camera features)

**Feature Testing:**
- [ ] All 4 simulations completable
- [ ] Camera access (allow/deny)
- [ ] AR overlay rendering
- [ ] Image editing
- [ ] Chat functionality
- [ ] Dashboard charts
- [ ] localStorage persistence
- [ ] Onboarding flow

## 13. Known Limitations & Trade-offs

### 13.1 Technical Limitations

**1. No Backend = No Multi-Device Sync**
- User progress tied to single browser/device
- Clearing browser data = lost progress
- No backup/recovery mechanism

**2. localStorage Size Limit**
- ~5-10MB per domain
- Chat histories can grow large
- No automatic cleanup strategy

**3. API Key Exposure**
- Client-side API calls expose key
- Risk: Malicious users could extract and abuse
- Mitigation: API restrictions, monitoring

**4. Camera Quality Dependency**
- AR audit accuracy depends on image quality
- Poor lighting = poor results
- No depth sensing (2D image analysis only)

**5. 3D Performance Variability**
- WebGL performance device-dependent
- Low-end devices may struggle
- No fallback for non-WebGL browsers

### 13.2 Design Trade-offs

**Trade-off 1: Simplicity vs. Features**
- Chose: Simple architecture (no backend)
- Gained: Fast development, low cost, easy deployment
- Lost: User accounts, cloud sync, analytics

**Trade-off 2: AI Accuracy vs. Cost**
- Chose: Gemini 3 Pro (high reasoning, expensive)
- Gained: Better spatial analysis, detailed recommendations
- Lost: Higher API costs per audit

**Trade-off 3: Realism vs. Accessibility**
- Chose: Simplified 3D environments
- Gained: Better performance, clearer learning objectives
- Lost: Photorealistic immersion

**Trade-off 4: Privacy vs. Insights**
- Chose: No analytics, no tracking
- Gained: User privacy, GDPR compliance
- Lost: Usage data, error monitoring, optimization insights

### 13.3 Future Scalability Concerns

**If User Base Grows:**
- API costs scale linearly with usage
- No rate limiting per user (all share quota)
- No abuse prevention mechanisms

**If Features Expand:**
- localStorage may become insufficient
- Need backend for team features
- Need authentication system

## 14. Future Architecture Evolution

### 14.1 Phase 2: Backend Integration

**Proposed Architecture:**
```
┌─────────┐      ┌──────────────┐      ┌─────────────┐
│ Browser │─────▶│ Next.js API  │─────▶│ Gemini API  │
│ (React) │      │ Routes       │      │             │
└─────────┘      └──────────────┘      └─────────────┘
     │                  │
     │                  ▼
     │           ┌──────────────┐
     │           │  PostgreSQL  │
     │           │  (User Data) │
     │           └──────────────┘
     │
     ▼
┌─────────────┐
│ localStorage│
│ (Cache)     │
└─────────────┘
```

**Benefits:**
- User authentication (Auth0, Clerk)
- Cross-device sync
- Team dashboards
- Usage analytics
- API key security

### 14.2 Phase 3: Native Mobile Apps

**React Native Architecture:**
- Shared business logic with web
- Native camera APIs (better performance)
- Offline-first with sync
- Push notifications for team training

### 14.3 Phase 4: VR Headset Support

**WebXR Integration:**
- A-Frame already VR-ready
- Add VR controller support
- Deeper immersion for simulations
- Requires WebXR-compatible browsers

## 15. Development Workflow

### 15.1 Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd walkinmyshoes

# Install dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

### 15.2 Code Organization

```
walkinmyshoes/
├── components/          # React components
│   ├── AIGuide.tsx
│   ├── ARAuditor.tsx
│   ├── ColorBlindnessScene.tsx
│   ├── HearingLossScene.tsx
│   ├── ImpactDashboard.tsx
│   ├── Layout.tsx
│   ├── MotorDisabilityScene.tsx
│   ├── Onboarding.tsx
│   └── VisualImpairmentScene.tsx
├── services/            # API integrations
│   └── gemini.ts
├── App.tsx              # Root component
├── constants.tsx        # Scenarios, system instructions
├── types.ts             # TypeScript interfaces
├── index.tsx            # Entry point
├── index.html           # HTML template
├── vite.config.ts       # Build configuration
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
├── .env.local           # Environment variables (gitignored)
└── README.md            # Documentation
```

### 15.3 Git Workflow

**Branch Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes

**Commit Convention:**
```
feat: Add visual remediation to AR auditor
fix: Resolve camera permission handling on Safari
docs: Update README with deployment instructions
refactor: Extract chat logic into custom hook
```

## 16. Monitoring & Maintenance

### 16.1 Error Monitoring (Recommended)

**Sentry Integration:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Key Metrics to Track:**
- API failure rate
- Camera permission denial rate
- localStorage quota exceeded errors
- 3D scene load failures

### 16.2 Analytics (Privacy-Respecting)

**Plausible Analytics (Recommended):**
- No cookies, GDPR compliant
- Track page views, not users
- Understand feature usage without invasion

**Key Events to Track:**
- Simulation completions
- AR audits performed
- Chat interactions
- Onboarding completion rate

### 16.3 Maintenance Tasks

**Weekly:**
- Monitor Gemini API usage and costs
- Check error logs (if Sentry enabled)
- Review user feedback (if feedback form added)

**Monthly:**
- Update dependencies (`npm outdated`)
- Review and optimize bundle size
- Test on latest browser versions

**Quarterly:**
- Audit accessibility compliance
- Review and update content
- Evaluate new Gemini model versions

## 17. Conclusion

Walk in My Shoes is a **client-first, AI-powered accessibility training platform** that prioritizes simplicity, privacy, and user experience. The architecture is intentionally minimal to enable rapid development and deployment while maintaining high-quality immersive experiences.

**Key Strengths:**
- Zero infrastructure costs (static hosting)
- Privacy-first (no user tracking)
- Cutting-edge AI integration (Gemini)
- Immersive 3D simulations (A-Frame)
- Real-world utility (AR auditor)

**Key Weaknesses:**
- No multi-device sync
- API key security concerns
- Limited scalability without backend
- Device-dependent performance

**Recommended Next Steps:**
1. Implement unit tests (Vitest)
2. Add error monitoring (Sentry)
3. Migrate API calls to serverless proxy (Vercel Functions)
4. Optimize bundle size (lazy loading)
5. Add feedback mechanism
6. Consider backend for Phase 2 (user accounts, sync)

This design document reflects the **actual implementation** and provides a realistic foundation for future development and scaling decisions.
