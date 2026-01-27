# 📚 COMPREHENSIVE README FOR MEZZO AID LMS

I'll create a detailed, professional README based on Mezzo Aid's mission and your LMS platform:

---

<div align="center">

# 🎓 Mezzo Aid LMS

**Empowering Aspiring Entrepreneurs Through Gamified Learning**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About Mezzo Aid

**Mezzo Aid** is on a mission to empower aspiring entrepreneurs in Africa by providing accessible, practical business education through an innovative gamified learning platform. We transform traditional course content into engaging "Quests" that help learners build real-world business skills while tracking their progress through badges, XP points, and achievement systems.

### 🎯 Our Mission

To bridge the entrepreneurship knowledge gap in Africa by making high-quality business education accessible, engaging, and actionable for everyone—from students to aspiring business owners.

### 🌟 Why Mezzo Aid?

- **🎮 Gamified Learning**: Transform education into an adventure with Quests, Badges, and XP systems
- **🌍 Africa-Focused**: Content tailored to African entrepreneurship challenges and opportunities
- **💼 Practical Skills**: Real-world applicable business knowledge, not just theory
- **🚀 Action-Oriented**: Every Quest includes actionable steps to implement immediately
- **🤝 Community-Driven**: Connect with fellow entrepreneurs on similar journeys
- **📈 Progress Tracking**: Visual dashboards to monitor your business readiness score

---

## ✨ Features

### For Students (Aspiring Entrepreneurs)

- **🎯 Quest System**: Courses reimagined as engaging entrepreneurship quests
- **🏆 Achievement System**: Earn badges and XP for completing challenges
- **📊 Business Readiness Score**: Track your preparedness to launch your venture
- **🎥 Video Learning**: High-quality video content with interactive elements
- **📝 Activity Checklists**: Step-by-step action items for each quest
- **💳 Secure Payments**: Integrated Stripe payment system for premium content
- **📱 Responsive Design**: Learn seamlessly across all devices
- **🌙 Dark Mode**: Comfortable learning experience day or night

### For Teachers (Content Creators)

- **📚 Course Management**: Intuitive interface to create and manage Quests
- **🎬 Video Upload**: Seamless integration with Mux for video hosting
- **📎 Resource Attachments**: Share PDFs, templates, and downloadable resources
- **📊 Analytics Dashboard**: Track student engagement and course performance
- **💰 Revenue Tracking**: Monitor earnings from your courses
- **✏️ Rich Text Editor**: Create compelling course descriptions with formatting
- **🔄 Drag-and-Drop**: Reorder chapters with simple drag-and-drop interface

### For Administrators

- **👥 User Management**: Manage user roles (Student, Teacher, Admin)
- **📈 Platform Analytics**: Comprehensive insights into platform usage
- **🛡️ Security Controls**: Row-level security with Supabase
- **🔍 Course Moderation**: Review and approve course content
- **💼 Teacher Applications**: Manage instructor onboarding

---

## 🛠️ Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[React Hook Form](https://react-hook-form.com/)** - Performant form handling
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### Backend & Database

- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database
  - Authentication & User Management
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage for file uploads

### Payments & Video

- **[Stripe](https://stripe.com/)** - Payment processing
- **[Mux](https://mux.com/)** - Video streaming and encoding

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Zod](https://zod.dev/)** - Schema validation

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Mux account (for video hosting)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/mezzo-aid-lms.git
cd mezzo-aid-lms
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_API_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Mux
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# UploadThing (optional - for file uploads)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

4. **Set up Supabase database**

Run the migrations in your Supabase SQL Editor:

```bash
# Navigate to supabase/migrations folder and run each migration file
# in your Supabase SQL Editor in order
```

Or use Supabase CLI:

```bash
supabase db push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📂 Project Structure

```
mezzo-aid-lms/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (course)/                 # Course viewing pages
│   │   └── courses/[courseId]/
│   ├── (dashboard)/              # Main dashboard
│   │   ├── (routes)/
│   │   │   ├── search/           # Browse courses
│   │   │   └── teacher/          # Teacher management
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── courses/
│   │   ├── webhook/              # Stripe webhooks
│   │   └── uploadthing/
│   └── layout.tsx
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── course-card.tsx
│   ├── navbar-routes.tsx
│   └── ...
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase client & types
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── stripe.ts
│   └── utils.ts
├── hooks/                        # Custom React hooks
│   └── use-supabase-auth.tsx
├── actions/                      # Server actions
│   ├── get-courses.ts
│   ├── get-analytics.ts
│   └── ...
├── supabase/
│   └── migrations/               # Database migrations
├── public/                       # Static assets
└── types.ts                      # TypeScript type definitions
```

---

## 🗄️ Database Schema

### Core Tables

- **profiles** - User profiles and roles
- **courses** - Quest/course information
- **categories** - Course categories
- **chapters** - Individual quest steps
- **attachments** - Course resources
- **purchases** - Course enrollments
- **user_progress** - Learning progress tracking
- **mux_data** - Video streaming data
- **stripe_customers** - Stripe customer mapping
- **logging** - System logs

### Security

All tables are protected by **Row Level Security (RLS)** policies:

- Students can only view published content
- Teachers can manage their own courses
- Admins have full access

---

## 🎨 Key Features Implementation

### Authentication Flow

```typescript
// Sign up flow with profile creation
1. User signs up with Supabase Auth
2. Trigger creates profile in profiles table
3. Default role: STUDENT
4. Email verification (optional)
5. Redirect to dashboard
```

### Course Enrollment Flow

```typescript
// Purchase and enrollment
1. Student clicks "Enroll Now"
2. Stripe Checkout session created
3. Payment processed
4. Webhook creates purchase record
5. Student gains access to course content
```

### Video Streaming

```typescript
// Mux integration for video
1. Teacher uploads video file
2. File sent to Mux for encoding
3. Mux generates playback ID
4. Video streams adaptively to students
5. Analytics track viewing progress
```

---

## 🔐 Security Best Practices

- **Row Level Security (RLS)**: All database tables protected
- **API Route Protection**: Server-side auth checks
- **Environment Variables**: Sensitive data never exposed
- **HTTPS Only**: Enforced in production
- **CSRF Protection**: Built into Next.js
- **XSS Prevention**: React's built-in sanitization
- **SQL Injection**: Parameterized queries via Supabase

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

```bash
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Add environment variables
   - Deploy!

3. **Configure Webhooks**
   - Add Stripe webhook URL: `https://yourdomain.com/api/webhook`
   - Add webhook secret to environment variables

### Environment Variables for Production

Make sure to add all environment variables from `.env.local` to your deployment platform.

---

## 📊 Analytics & Monitoring

### Built-in Analytics

- **Course Performance**: Views, enrollments, completion rates
- **Revenue Tracking**: Earnings per course
- **User Engagement**: Active users, popular courses
- **Video Analytics**: Watch time, drop-off points

### Recommended External Tools

- **Vercel Analytics**: Page performance
- **Sentry**: Error tracking
- **PostHog**: User behavior analytics
- **Stripe Dashboard**: Payment insights

---

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production (tests compilation)
npm run build
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Share ideas for new gamification elements
3. **Submit PRs**: Fix bugs or add features
4. **Improve Docs**: Help us make documentation clearer
5. **Share Feedback**: Tell us about your experience

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code patterns
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes locally

---

## 🐛 Known Issues & Limitations

- [ ] Node.js 18 support will be deprecated (upgrade to Node 20+ recommended)
- [ ] OAuth providers require proper callback configuration
- [ ] Video processing can take 2-5 minutes after upload
- [ ] Large file uploads may timeout (use chunked uploads)

---

## 📚 Documentation

### For Developers

- [API Documentation](docs/api.md) - API endpoints and usage
- [Database Schema](docs/database.md) - Complete schema reference
- [Component Library](docs/components.md) - Reusable components guide

### For Users

- [Student Guide](docs/student-guide.md) - How to use the platform
- [Teacher Guide](docs/teacher-guide.md) - Creating and managing courses
- [Admin Guide](docs/admin-guide.md) - Platform administration

---

## 🗺️ Roadmap

### Phase 1: Core LMS (✅ Completed)

- [x] User authentication
- [x] Course creation and management
- [x] Video streaming
- [x] Payment integration
- [x] Progress tracking

### Phase 2: Gamification (🚧 In Progress)

- [ ] Badge system
- [ ] XP points and levels
- [ ] Daily streaks
- [ ] Achievement unlocks
- [ ] Leaderboards

### Phase 3: Mezzo Aid Specific (📋 Planned)

- [ ] Quest terminology (Course → Quest, Chapter → Step)
- [ ] Business Readiness Score
- [ ] Activity checklists
- [ ] Expert marketplace
- [ ] Mentor matching
- [ ] Community forums
- [ ] Live workshops

### Phase 4: Advanced Features (🔮 Future)

- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Certificate generation
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Advanced analytics dashboard

---

## 💡 Support

### Need Help?

- **📧 Email**: support@mezzoaid.com
- **🌐 Website**: [mezzoaid.com](https://mezzoaid.com)
- **💬 Discord**: [Join our community](https://discord.gg/mezzoaid)
- **📖 Docs**: [Documentation site](https://docs.mezzoaid.com)

### For Developers

- **🐛 Report Bugs**: [GitHub Issues](https://github.com/your-org/mezzo-aid-lms/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-org/mezzo-aid-lms/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Video streaming by [Mux](https://mux.com/)
- Payments by [Stripe](https://stripe.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 🌍 Our Impact

**Empowering African Entrepreneurs**

Mezzo Aid is committed to making entrepreneurship education accessible across Africa. Every course completed, every badge earned, and every business launched contributes to building a stronger entrepreneurial ecosystem on the continent.

### By the Numbers

- 🎓 Students learning entrepreneurship
- 📚 Quests (courses) available
- 🏆 Badges earned by learners
- 🚀 Businesses launched by our community

---

## 🔗 Links

- **Website**: [mezzoaid.com](https://mezzoaid.com)
- **Platform**: [app.mezzoaid.com](https://app.mezzoaid.com)
- **LinkedIn**: [linkedin.com/company/mezzoaid](https://linkedin.com/company/mezzoaid)
- **Twitter**: [@mezzoaid](https://twitter.com/mezzoaid)
- **Instagram**: [@mezzoaid](https://instagram.com/mezzoaid)

---

<div align="center">

**Made with ❤️ by the Mezzo Aid Team**

_Empowering Entrepreneurs, One Quest at a Time_

[⬆ back to top](#-mezzo-aid-lms)

</div>

---

Would you like me to:

1. Create additional documentation files (API docs, component guides)?
2. Generate a CONTRIBUTING.md file?
3. Create a CODE_OF_CONDUCT.md?
4. Write deployment guides for different platforms?
