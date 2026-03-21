# AlgoSensei 🥋

AI-powered DSA and technical interview preparation platform.

## Stack
- **Frontend:** React 19 + Vite, React Router DOM v7
- **Backend:** Express 5, Mongoose 9, Passport + Google OAuth 2.0, JWT
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Database:** MongoDB Atlas

## Features
- 100+ DSA problems with filtering and progress tracking
- 120+ tech interview questions across 7 categories
- 14 pre-built algorithm visualizations with bar chart and tree modes
- AI-powered streaming chat with 6 modes (Socratic hints, solution reveal, mock interviews)
- AI animation generator for any algorithm
- Timed quiz engine with weak topic tracking
- Dashboard with streak, accuracy, and heatmap analytics

## Setup
1. `cd server && npm install && node scripts/seedDSA.js && node scripts/seedTech.js && npm run dev`
2. `cd client && npm install && npm run dev`