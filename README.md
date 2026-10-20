# UnifyTalk 🌐
### *Talk to Anyone. Understood by All.*

> Breaking communication barriers for deaf, mute and blind individuals.
> Built by Team from Cambridge Institute of Technology, Bengaluru.

---

## 🔗 Live Demo
**👉 https://unify-talk.vercel.app**

---

## 📋 Problem Statement
Millions of people with disabilities — deaf, mute, and blind — struggle to communicate in everyday life. UnifyTalk bridges this gap using AI, sign language detection, pictograms, and voice navigation in one unified platform built for accessibility.

---

## ✨ Features
- 💬 **Phase 1 — Chat:** Speech↔Text, Text-to-Speech, 3 disability modes
- 🖼️ **Phase 2 — Pictograms:** 76 symbols, sentence builder
- ⚡ **Phase 3 — Quick Phrases:** Emotion panel, SOS alerts
- 🤟 **Phase 4 — Sign AI:** Real-time sign language detection (MediaPipe)
- 👁️ **Phase 5 — Screen Reader:** Voice navigation, Braille output
- 🌍 **Phase 6 — Community:** Profiles, forum, settings
- 🌐 **Multilingual Support:** Instant switcher for English, Hindi, Tamil, Telugu, and Kannada
- ⌨️ **Accessibility Hotkeys:**
  - `Alt + R`: Toggle Global Screen Reader
  - `Alt + T`: Cycle Theme (Dark, Light, High Contrast)
  - `Alt + H`: Quick Navigate to Home
  - `Alt + E`: Instant Emergency SOS

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Sign Language | MediaPipe Hands |
| Speech | Web Speech API |
| Auth | JWT |
| Media | Cloudinary |
| Deployment | Vercel + Render |

---

## 🗂️ Project Structure
unifytalk-frontend/
├── public/
│   ├── index.html
│   └── logo.svg
├── src/
│   ├── index.js
│   ├── App.jsx
│   ├── components/
│   │   └── Logo.jsx
│   └── pages/
│       ├── Landing.jsx
│       ├── Phase1_Chat.jsx
│       ├── Phase2_Pictograms.jsx
│       ├── Phase3_Phrases.jsx
│       ├── Phase4_SignAI.jsx
│       ├── Phase5_ScreenReader.jsx
│       └── Phase6_Community.jsx
├── package.json
└── README.md
---

## 🌐 Routes
| URL | Page |
|-----|------|
| / | Landing Page |
| /chat | Phase 1 — Chat |
| /board | Phase 2 — Pictograms |
| /phrases | Phase 3 — Phrases |
| /signs | Phase 4 — Sign AI |
| /reader | Phase 5 — Screen Reader |
| /community | Phase 6 — Community |

---

## 🚀 Setup Steps (Windows OS)

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### Frontend Setup
```bash
# Clone the repo
git clone https://github.com/Ansika-Singh/UnifyTalk
cd UnifyTalk

# Install dependencies
npm install

# Start development server
npm start
# Opens at http://localhost:3000
```

### Backend Setup
```bash
# Clone the backend repo
git clone https://github.com/Ansika-Singh/unifytalk-backend
cd unifytalk-backend

# Install dependencies
npm install

# Create .env file with the following values
# (see Environment Variables section below)

# Start development server
npm run dev
# Runs at http://localhost:5000
```

### Environment Variables
Create a `.env` file in the frontend folder:
REACT_APP_API_URL=https://unifytalk-backend.onrender.com
REACT_APP_SOCKET_URL=https://unifytalk-backend.onrender.com
Create a `.env` file in the backend folder:
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
---

## 🔗 Links
| | Link |
|-|------|
| 🌐 Live Demo | https://unify-talk.vercel.app |
| 💻 Frontend Repo | https://github.com/Ansika-Singh/UnifyTalk |
| ⚙️ Backend Repo | https://github.com/Ansika-Singh/unifytalk-backend |
| 🚀 Backend API | https://unifytalk-backend.onrender.com |

---

## 👥 Team
| Name | Role | College |
|------|------|---------|
| Ansika Singh| Lead Developer, Backend Developer, Visionary & Research Lead | Cambridge Institute of Technology |
| Bishnu Kumar Sardar | Backend, Systems & Accessibility Developer | Cambridge Institute of Technology |
| Pallavi | AI Research Lead and Project Management | RNS Institute of Technology |

---

*UnifyTalk — Every Voice. Every Ability. No Limits.* 🚀
