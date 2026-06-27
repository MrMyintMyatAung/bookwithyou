---
marp: true
theme: default
paginate: true
backgroundColor: #1a1a2e
color: #e0e0e0
style: |
  section {
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  h1 {
    color: #f5c518;
    font-size: 2.8em;
  }
  h2 {
    color: #f5c518;
    font-size: 2em;
  }
  strong {
    color: #f5c518;
  }
  a {
    color: #61dafb;
  }
  table {
    font-size: 0.85em;
    margin: 0 auto;
  }
  th {
    background-color: #16213e;
    color: #f5c518;
  }
  td {
    background-color: #0f3460;
  }
  blockquote {
    border-left: 4px solid #f5c518;
    background-color: #16213e;
    padding: 0.5em 1em;
    font-style: italic;
  }
  code {
    background-color: #16213e;
    padding: 0.2em 0.4em;
    border-radius: 4px;
  }
  .columns {
    display: flex;
    gap: 2em;
  }
  .col {
    flex: 1;
  }
---

# 📚 BooksWithYou

**Read together. Stay accountable.**

A social reading tracker for book lovers who want to read with others.

---

# The Problem

- 📖 Reading is often a **solo activity**
- 😴 Hard to stay motivated without accountability
- 🤫 No easy way to share progress or discuss a book with friends
- 📱 Existing apps track *what* you read, not *who* you read with

> "I keep starting books but never finishing them."

---

# What is BooksWithYou?

A **social reading platform** where members:

- 📚 Create **reading sessions** around a book
- 👥 Invite friends or join **public sessions**
- 📊 Log **chapter-by-chapter progress**
- 💬 Discuss in a **shared comment thread**
- ❤️ React with **emojis** to celebrate milestones

---

# Who Is It For?

| Audience | Use Case |
|----------|----------|
| **Book clubs** | Organize reads, track everyone's pace |
| **Friends** | Read the same book together, stay connected |
| **Students** | Study groups tackling course material |
| **Solo readers** | Join public sessions for motivation |
| **Online communities** | Coordinate group reads across time zones |

---

# Core Features

### Session Management
- Create a session → pick a book, add chapters, set visibility
- **Public** sessions: anyone can browse & join
- **Private** sessions: invite-only via link or code

### Progress Tracking
- Each member logs chapters completed
- Visual progress bars show where everyone stands
- Host can mark session as active / paused / completed

---

# Core Features

### Discussion & Reactions
- Flat **comment thread** per session
- React with 👍 ❤️ 😂 🎉 and more
- Toggle reactions on and off

### Profiles
- Choose a username & display name
- Upload an avatar
- See shared sessions with other members

---

# How It Works

```
1. Sign up  ──→  2. Create / Join a session
                      │
                      ▼
              3. Add book & chapters
                      │
                      ▼
              4. Read & log progress
                      │
                      ▼
              5. Discuss & react 💬❤️
```

Simple flow, no bloat — just reading together.

---

# Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Mobile** | React Native (Expo) |
| **Backend** | Supabase (Postgres, Auth, Realtime, Storage) |
| **Database** | PostgreSQL with Row-Level Security |
| **Realtime** | Live updates for comments, progress, reactions |

---

# Why Supabase?

- 🔐 **Auth** — email/password out of the box
- 🗄️ **Postgres** — powerful, relational, RLS policies
- ⚡ **Realtime** — live subscriptions for progress & comments
- 📦 **Storage** — avatar uploads with minimal setup
- 🚀 **Edge Functions** — serverless triggers for profile creation

---

# What's Next (v2+)

- 🔔 Notifications (email, push, in-app)
- 🔍 Search across books, sessions, comments
- 📅 Reading schedules & milestones
- 🏷️ Per-chapter progress tracking
- 📨 Direct messaging between members
- 🔗 Social OAuth (Google, GitHub)

---

# Let's Read Together

**BooksWithYou** — track your reading, share the journey.

🌐 `bookwithyou.com` (coming soon)
📂 `github.com/nashy/bookwithyou`

> *"A book read alone is a story. A book read together is an experience."*
