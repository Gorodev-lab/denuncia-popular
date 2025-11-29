# Contributing to Denuncia Popular

Thank you for your interest in contributing to **Denuncia Popular**! This document will help you get started with the development environment and understand our contribution workflow.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Project Architecture](#project-architecture)
4. [Development Workflow](#development-workflow)
5. [Submitting Pull Requests](#submitting-pull-requests)
6. [Code Quality Standards](#code-quality-standards)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 20.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 10.x or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- A **Supabase account** for backend services ([Sign up](https://supabase.com/))
- A **Google AI API key** for Gemini integration ([Get key](https://ai.google.dev/))

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Gorodev-lab/denuncia-popular.git
cd denuncia-popular
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# EmailJS (for email notifications)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

**Important:** Never commit the `.env.local` file to version control. It's already included in `.gitignore`.

### 4. Set Up Supabase Database

1. Log in to your Supabase dashboard
2. Create a new project (if you haven't already)
3. Navigate to the SQL Editor
4. Run the SQL script from `SUPABASE_FULL_SETUP.sql` to create the necessary tables and policies

### 5. Start the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

---

## Project Architecture

### Overview

**Denuncia Popular** is a React-based web application that allows citizens to report civic issues on an interactive map. The application integrates with Supabase for backend services and Google's Gemini AI for intelligent features.

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Map Library**: Leaflet via `react-leaflet`
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI Integration**: Google Gemini via `@google/genai`
- **Build Tool**: Vite
- **Styling**: CSS with custom styles
- **Email Service**: EmailJS

### Directory Structure

```
denuncia-popular/
├── components/          # React components
│   ├── steps/          # Wizard step components
│   ├── ChatBot.tsx     # AI chatbot component
│   ├── FeedbackWidget.tsx
│   └── Wizard.tsx      # Main wizard controller
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── services/           # External service integrations
│   ├── supabase.ts    # Supabase client
│   └── geminiService.ts # Gemini AI service
├── utils/              # Utility functions
├── types.ts            # TypeScript type definitions
├── translations.ts     # i18n translations
└── App.tsx             # Main application component
```

### How React-Leaflet and Supabase Interact

1. **Map Rendering**: `react-leaflet` provides React components that wrap Leaflet.js functionality
2. **Data Flow**:
   - User interacts with the map (clicks to place a pin)
   - Form data is collected through the multi-step wizard
   - Data is submitted to Supabase via the `supabase.ts` client
   - Real-time updates are received through Supabase's real-time subscriptions
3. **State Management**: The `useMapReports` hook manages fetching and state for map markers

---

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `development`: Integration branch for features
- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/bug-description`

### Creating a Feature Branch

```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test thoroughly locally
3. Ensure code quality (see [Code Quality Standards](#code-quality-standards))
4. Commit with clear, descriptive messages

```bash
git add .
git commit -m "feat: add marker clustering for better performance"
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

---

## Submitting Pull Requests

### Before Submitting

✅ **Checklist:**

- [ ] Code builds successfully (`npm run build`)
- [ ] All tests pass (if applicable)
- [ ] Code follows the project's style guidelines
- [ ] TypeScript has no errors (`npm run type-check` or IDE verification)
- [ ] No console errors or warnings in the browser
- [ ] Changes have been tested on both desktop and mobile viewports
- [ ] Environment variables are not hardcoded
- [ ] Documentation has been updated (if needed)

### Creating a Pull Request

1. Push your branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the GitHub repository and create a new Pull Request

3. Fill out the PR template with:
   - **Description**: What does this PR do?
   - **Motivation**: Why is this change needed?
   - **Testing**: How was this tested?
   - **Screenshots**: If UI changes, include before/after screenshots

4. Request a review from at least one team member

5. Address any feedback from reviewers

---

## Code Quality Standards

We maintain high standards for code quality. Please adhere to the following:

### TypeScript

- **Use strict typing**: Avoid `any` types whenever possible
- **Define interfaces**: For all data structures
- **Use type inference**: Where it improves readability

### React Best Practices

- **Use functional components** with hooks
- **Memoize expensive operations** with `useMemo` and `useCallback`
- **Avoid prop drilling**: Use Context API when appropriate
- **Keep components small**: Single responsibility principle

### Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Naming**:
  - Components: PascalCase (`MyComponent.tsx`)
  - Files: camelCase or PascalCase
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

### Performance

- Avoid unnecessary re-renders
- Use lazy loading for heavy components
- Optimize images and assets
- Minimize bundle size

### Security

- Never commit API keys or secrets
- Sanitize user inputs
- Use Supabase RLS policies for data access control
- Validate all form inputs

---

## Questions or Issues?

If you have questions or run into issues:

1. Check existing [Issues](https://github.com/Gorodev-lab/denuncia-popular/issues)
2. Search the [Documentation](./README.md)
3. Ask in the project's discussion forum
4. Create a new issue with detailed information

---

**Thank you for contributing to Denuncia Popular! Together, we're building a tool to empower citizens and improve our communities.** 🚀
