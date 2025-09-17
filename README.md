# 🎭 StageFlow

> Church service scheduling made simple

StageFlow is a comprehensive SaaS platform designed to streamline church service planning and scheduling. Built with modern web technologies and a multi-tenant architecture.

## ✨ Features

- **Multi-Service Scheduling** - Plan and coordinate multiple services
- **iTunes Integration** - Search and include song information with timing
- **Export Capabilities** - Generate bulletins and AV versions in PDF/Word
- **Multi-Tenant SaaS** - Secure, isolated environments for each church
- **Mobile Responsive** - Works seamlessly on desktop and mobile
- **OAuth Integration** - Login with Google or Microsoft accounts

## 🚀 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form

**Backend:**
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Deployment:**
- Frontend: Vercel
- Backend: Railway
- Database: Supabase

## 🏗️ Project Structure

```
stageflow/
├── backend/          # Node.js API
├── frontend/         # Next.js App
├── docs/            # Documentation
└── .github/         # CI/CD workflows
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/stephenfdavis3/stageflow.git
cd stageflow

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start development servers
cd backend && npm run dev    # Port 3001
cd frontend && npm run dev   # Port 3000
```

## 📋 Roadmap

- [x] Project setup and architecture
- [ ] Authentication system
- [ ] Service management CRUD
- [ ] Calendar scheduling interface
- [ ] iTunes API integration
- [ ] PDF/Word export functionality
- [ ] Mobile app (React Native)
- [ ] Advanced reporting

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the development team.

## 📄 License

Private - All rights reserved

---

**StageFlow** - Orchestrating worship, one service at a time 🎵
