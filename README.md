# FitMind Care

A comprehensive AI-powered health companion that helps users monitor, track, and improve their physical and mental well-being through voice logging, symptom tracking, mood monitoring, nutrition logging, cognitive training, and real-time AI insights.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Why FitMind Care](#why-fitmind-care)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Edge Functions](#edge-functions)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security & Privacy](#security--privacy)
- [Roadmap](#roadmap)

## Problem Statement

Managing personal health today is fragmented and reactive. People struggle with:

- **Disjointed health tracking**: Symptoms, mood, nutrition, vitals, and medical reports live in separate apps, spreadsheets, or notebooks.
- **No early warning system**: Users often notice health issues only after they become serious, missing early patterns.
- **Limited access to insights**: Raw data is rarely turned into actionable, personalized advice.
- **Mental health overlooked**: Physical health apps rarely integrate mood, stress, anxiety, and sleep tracking.
- **Emergency preparedness**: Critical health information and emergency contacts are not centrally available during urgent moments.
- **Wearable data silos**: Fitness tracker data often stays locked in proprietary platforms without context.

FitMind Care addresses these gaps by combining health tracking, AI analysis, and emergency tools in one unified platform.

---

## Why FitMind Care

- **Holistic view**: Integrates voice health logs, symptoms, mood, nutrition, medical reports, brain games, and emergency contacts.
- **AI-powered guidance**: Uses AI to transcribe voice notes, extract health data, generate insights, and provide empathetic health chat support.
- **Real-time database sync**: All data is stored securely in the cloud with row-level security, replacing fragile localStorage-based solutions.
- **Privacy-first**: Every user sees only their own data. Authentication, encrypted sessions, and strict RLS policies protect sensitive health information.
- **Proactive wellness**: Tracks trends over time to help users identify patterns before they become problems.
- **Accessible interface**: Clean, responsive UI with intuitive navigation and smooth error handling for a reliable user experience.

---

## Solution Overview

FitMind Care is a modern React web application backed by a cloud database and serverless edge functions. Users sign up or log in, then interact with a suite of health tools that persist data in real time. AI edge functions analyze voice recordings, chat messages, and health metrics to generate insights. A dashboard aggregates recent activity and AI-generated recommendations. Emergency contacts and critical vitals monitoring provide safety features when anomalies are detected.

---

## Key Features

### 1. Interactive Body Dashboard
- Visual body model with clickable sections: Heart, Lungs, Stomach, Head, and Eyes.
- Displays key health metrics per section such as heart rate, BMI, blood oxygen, and sleep duration.
- Generates AI-powered suggestions tailored to the selected body area and current metrics.
- Automatically triggers a nearby-care map when emergency thresholds are detected.

### 2. Voice Health Logger
- Records voice descriptions of how the user is feeling.
- Uploads audio to a secure edge function that transcribes the recording using Whisper and extracts structured health data with AI.
- Stores the transcription, extracted health data, and AI agent response in the database.
- Displays a searchable history of past voice logs with real-time updates.

### 3. Symptoms Tracker
- Logs symptoms with severity, body area, duration, and notes.
- Stores entries in the cloud with real-time synchronization.
- Provides a history view and identifies commonly tracked symptoms.
- Helps users discover patterns over time.

### 4. Mental Health & Mood Tracker
- Logs mood, mood score, energy, stress, anxiety, sleep quality, activities, triggers, and notes.
- Provides a comprehensive mood history view and trend analysis.
- Encourages daily mental wellness check-ins and habit building.

### 5. Nutrition Care Taker
- Logs meals with meal type, food items, calories, and notes.
- Tracks nutrition history to support healthier eating habits.
- Supports daily meal planning and calorie awareness.

### 6. Brain Boost Buddy
- Interactive cognitive games: Memory Game, Math Challenge, and Pattern Game.
- Progress tracker to monitor improvement in memory, focus, and problem solving.
- Designed to keep the mind sharp and engaged.

### 7. AI Health Chat
- Conversational AI assistant for health and wellness questions.
- Saves chat history to the database for continuity.
- Provides empathetic, general wellness advice without diagnosing or prescribing.

### 8. Medical Report Upload
- Uploads CSV medical reports.
- Parses sections, metrics, values, and units.
- Stores extracted health metrics and AI-generated insights in the database.
- Validates file type and required fields with smooth error handling.

### 9. Emergency Contacts
- Stores personal emergency contacts with name, phone, and relationship.
- Includes a built-in list of public emergency numbers (911, Poison Control, Suicide Prevention Lifeline, etc.).
- Allows adding, viewing, and deleting contacts with authentication checks.
- Integrates with emergency detection on the body dashboard.

### 10. User Dashboard
- Aggregates counts of voice logs, symptoms, mood entries, and recent AI insights.
- Shows recent activity across all tracking modules.
- Provides a single-page overview of health status and trends.

### 11. Real-Time Data Synchronization
- Database-backed storage for all health features.
- Replaces localStorage with authenticated, cloud-persistent records.
- Row-level security ensures users access only their own data.

---

## How It Works

1. **Sign up / Log in** using the authentication system. A profile is automatically created.
2. **Explore the body dashboard** and select an area to view metrics and AI suggestions.
3. **Log voice health notes** to transcribe and extract health data automatically.
4. **Track symptoms and mood** daily to build a personal health timeline.
5. **Upload medical reports** in CSV format to enrich metrics and insights.
6. **Chat with the AI assistant** for wellness guidance.
7. **Review the dashboard** to see recent activity and AI-generated health insights.
8. **Add emergency contacts** for safety during critical health events.

---

## Architecture

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Vite + TypeScript + Tailwind CSS) │
└─────────────┬───────────────────────┘
              │
              │ Supabase JS Client
              ▼
┌─────────────────────────────────────┐
│         Lovable Cloud Backend         │
│   (Database, Auth, Edge Functions)  │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
┌──────────┐      ┌──────────────┐
│ Postgres │      │ Edge Functions│
│ Database │      └──────────────┘
└──────────┘
```

The frontend is a single-page React application using React Router for navigation. State management uses TanStack Query and React hooks. Supabase provides authentication, the Postgres database, and serverless edge functions for AI processing. Edge functions communicate with the Lovable AI Gateway and external transcription services when needed.

---

## Database Schema

The application uses a normalized Postgres schema with row-level security on every table. Key tables include:

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information (first name, last name). |
| `voice_logs` | Voice recordings, transcriptions, extracted health data, and AI responses. |
| `symptoms` | Symptom entries with severity, body area, duration, and notes. |
| `mood_entries` | Mood logs with scores, energy, stress, anxiety, sleep quality, activities, and triggers. |
| `nutrition_entries` | Meal logs with meal type, food items, calories, and notes. |
| `health_metrics` | Extracted biometrics such as heart rate, blood oxygen, BMI, sleep, steps, weight, and blood pressure. |
| `health_insights` | AI-generated insights categorized by type (e.g., heart, lungs, mood). |
| `chat_messages` | Chat history between user and AI assistant. |
| `emergency_contacts` | Personal emergency contacts and relationships. |

All tables reference `auth.users` through a `user_id` foreign key and enforce RLS policies so users can only manage their own records. Indexes on `user_id` and `created_at` optimize dashboard and history queries.

---

## Edge Functions

Serverless functions deployed to the backend handle AI and transcription workloads:

| Function | Purpose |
|----------|---------|
| `voice-to-health-data` | Receives base64 audio, transcribes it with Whisper, and uses AI to extract structured health data. |
| `health-agent` | General health analysis agent that analyzes biometrics and history to provide suggestions and risk assessments. |
| `chat` | Powers the AI health assistant with empathetic, wellness-focused conversation. |
| `mcp-biometric-sync` | Placeholder integration for wearable/MCP biometric data syncing (fetch, upload, get latest). |

Each function validates requests, processes data through the AI gateway, and returns structured JSON with consistent error handling.

---

## Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite 5, React Router 6, TanStack Query 5
- **Styling**: Tailwind CSS 3, Radix UI primitives, shadcn/ui components, Lucide icons, Recharts
- **Forms & Validation**: React Hook Form, Zod, Hookform Resolvers
- **Backend**: Lovable Cloud (Supabase) — Auth, Postgres, Edge Functions
- **AI Services**: Lovable AI Gateway (Google Gemini model) for chat, insights, and data extraction
- **Voice Transcription**: Whisper via OpenAI API
- **Maps**: Google Maps JS API Loader
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority
- **Linting**: ESLint 9 with React Hooks and Refresh plugins

---

## Getting Started

### Prerequisites

- Node.js and a package manager such as `bun` or `npm`
- A Lovable Cloud backend project configured for authentication and database

### Install dependencies

```bash
bun install
```

### Run the development server

```bash
bun run dev
```

The development server will start on the configured port (commonly `8080`).

### Build for production

```bash
bun run build
```

### Lint the project

```bash
bun run lint
```

---

## Project Structure

```
├── public/                 # Static assets, PWA files, service worker
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── body/           # Body dashboard components
│   │   ├── brain/          # Brain Boost games
│   │   ├── contacts/       # Emergency contact components
│   │   ├── mood/           # Mood tracker and history
│   │   ├── nutrition/      # Meal logger and nutrition history
│   │   ├── symptoms/       # Symptom logger and history
│   │   ├── ui/             # shadcn/ui and custom UI components
│   │   └── voice/          # Voice history components
│   ├── contexts/           # AuthContext and global providers
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Supabase client and generated types
│   ├── lib/                # Utility helpers
│   ├── pages/              # Top-level route pages
│   ├── styles/             # Global CSS
│   ├── App.tsx             # Main app with routes
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database schema migrations
├── index.html              # HTML entry
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

---

## Security & Privacy

- **Authentication**: Supabase Auth manages sessions, sign-up, and sign-out.
- **Row-level security**: Every user-facing table has RLS policies ensuring users access only their own data.
- **Database grants**: Public schema tables explicitly grant appropriate permissions to authenticated and service roles.
- **Data minimization**: Health data is stored only when a user explicitly logs it or uploads a report.
- **Safe AI boundaries**: The assistant provides general wellness information and never diagnoses or prescribes medication.

---

## Roadmap

- Wearable device integrations (Fitbit, Apple Health, Garmin, Samsung Health) via MCP protocol.
- Advanced trend analytics and weekly/monthly health reports.
- Medication reminders and adherence tracking.
- Telehealth provider directory integration.
- Push notifications for emergency alerts and wellness reminders.
- Export health records to PDF or share with caregivers.

---

## Disclaimer

FitMind Care is a wellness and health tracking application. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
