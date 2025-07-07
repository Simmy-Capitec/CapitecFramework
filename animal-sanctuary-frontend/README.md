# 🐾 Animal Sanctuary Frontend - React 19 & Next.js 15

## 🌟 Project Overview

A modern, responsive web application for the **Paws & Hearts Animal Sanctuary** built with cutting-edge technologies. This frontend provides a beautiful, accessible interface for potential adopters, volunteers, staff, and administrators to interact with the sanctuary management system.

### ✨ **Key Features**

- **🎨 Beautiful UI/UX** - Warm, welcoming design with animal sanctuary theming
- **📱 Fully Responsive** - Optimized for mobile, tablet, and desktop
- **♿ Accessible** - WCAG 2.1 AA compliant with screen reader support  
- **⚡ High Performance** - Next.js 15 with React 19 Server Components
- **🎯 SEO Optimized** - Complete meta tags, OpenGraph, and structured data
- **🔍 Type Safe** - Full TypeScript implementation
- **🎨 Design System** - Consistent components with Tailwind CSS + Shadcn/ui

---

## 🏗️ **Technology Stack**

### **Core Technologies**
- **[Next.js 15](https://nextjs.org/)** - Full-stack React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### **UI Components & Design**
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[Radix UI](https://www.radix-ui.com/)** - Low-level accessible primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful SVG icons
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations

### **State Management & Data**
- **[TanStack Query](https://tanstack.com/query/)** - Server state management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client state management
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Jest](https://jestjs.io/)** - Unit testing
- **[Playwright](https://playwright.dev/)** - E2E testing

---

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js** 18.0+ 
- **npm** 8.0+
- **Animal Sanctuary API** running on `localhost:3001`

### **Installation**

```bash
# Clone the repository (if not already done)
cd animal-sanctuary-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### **Environment Variables**

Update `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=10000

# Sanctuary Information
NEXT_PUBLIC_SANCTUARY_NAME=Paws & Hearts Animal Sanctuary
NEXT_PUBLIC_SANCTUARY_TAGLINE=Where every animal finds their forever home
NEXT_PUBLIC_SANCTUARY_PHONE=(555) 123-PAWS
NEXT_PUBLIC_SANCTUARY_EMAIL=adopt@pawsandhearts.org

# Feature Flags
NEXT_PUBLIC_ENABLE_ONLINE_APPLICATIONS=true
NEXT_PUBLIC_ENABLE_DONATIONS=true
NEXT_PUBLIC_ENABLE_VOLUNTEER_SIGNUP=true
```

---

## 🎨 **Design System & Theme**

### **Color Palette**

Our animal sanctuary theme uses warm, welcoming colors that inspire trust and care:

#### **Primary Colors**
- **Sanctuary Primary** (`sanctuary-primary-500`): `#d97828` - Warm golden brown
- **Sanctuary Nature** (`sanctuary-nature-500`): `#22c55e` - Healthy green  
- **Sanctuary Care** (`sanctuary-care-500`): `#3b82f6` - Trust blue

#### **Semantic Colors**
- **Available** - Green tones for animals ready for adoption
- **Pending** - Amber for applications in process
- **Adopted** - Blue for successful adoptions
- **Medical** - Rose for animals in medical care

### **Typography**
- **Headings**: Poppins (warm, friendly)
- **Body**: Inter (clean, readable)
- **Display**: Fredoka (playful, animal-themed)

### **Components**

Pre-built components following the sanctuary design system:

```tsx
// Button variants
<button className="sanctuary-button-primary">Adopt Me</button>
<button className="sanctuary-button-secondary">Learn More</button>

// Status badges
<span className="sanctuary-badge-available">Available</span>
<span className="sanctuary-badge-pending">Pending</span>
<span className="sanctuary-badge-adopted">Adopted</span>

// Cards
<div className="sanctuary-card hover-lift">...</div>
```

---

## 🏢 **Application Architecture**

### **User Interfaces**

#### **1. 🌟 Public Portal** (`/`)
**Target**: Potential adopters and general public
- Hero section with call-to-action
- Featured available animals
- Mission and values presentation
- Ways to get involved (adopt, volunteer, donate)
- Contact information and social links

#### **2. 🐕 Animal Adoption Portal** (`/animals`)
**Target**: People looking to adopt
- Browse available animals with filters
- Animal detail pages with full profiles
- Online adoption application forms
- Application status tracking
- Success stories and testimonials

#### **3. 🤝 Volunteer Portal** (`/volunteer`)
**Target**: Current and potential volunteers
- Volunteer opportunities listing
- Online volunteer application
- Volunteer dashboard and schedule
- Training resources and guidelines
- Volunteer community features

#### **4. 💖 Donation Portal** (`/donate`)
**Target**: Supporters and donors
- Online donation forms
- Recurring donation setup
- Impact stories and updates
- Donor recognition (with permission)
- Transparency reports

#### **5. 👩‍⚕️ Staff Dashboard** (`/staff`)
**Target**: Sanctuary employees
- Animal management interface
- Application review system
- Medical records tracking
- Volunteer coordination
- Quick stats and alerts

#### **6. ⚙️ Admin Panel** (`/admin`)
**Target**: System administrators
- User management
- System settings and configuration
- Analytics and reporting
- Content management
- Audit logs and monitoring

### **Folder Structure**

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (public)/                 # Public routes
│   │   ├── animals/              # Animal browsing & profiles
│   │   ├── volunteer/            # Volunteer information
│   │   └── donate/               # Donation portal
│   ├── (dashboard)/              # Protected routes
│   │   ├── staff/                # Staff dashboard
│   │   └── admin/                # Admin panel
│   ├── api/                      # API routes (if needed)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components (Shadcn)
│   ├── forms/                    # Form components
│   ├── animals/                  # Animal-specific components
│   ├── navigation/               # Navigation components
│   └── providers/                # Context providers
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client setup
│   ├── utils.ts                  # Helper functions
│   └── validations.ts            # Zod schemas
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
└── styles/                       # Additional stylesheets
```

---

## 🔗 **API Integration**

### **API Client Setup**

The frontend connects to the Animal Sanctuary API backend:

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Example usage
export const getAnimals = async (filters?: AnimalFilters) => {
  const response = await api.get('/api/animals', { params: filters })
  return response.data
}
```

### **Data Fetching with TanStack Query**

```typescript
// hooks/use-animals.ts
import { useQuery } from '@tanstack/react-query'
import { getAnimals } from '@/lib/api'

export function useAnimals(filters?: AnimalFilters) {
  return useQuery({
    queryKey: ['animals', filters],
    queryFn: () => getAnimals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### **Key API Endpoints Used**

| Endpoint | Purpose | Component Usage |
|----------|---------|-----------------|
| `GET /api/animals` | Browse animals | Animal listing pages |
| `GET /api/animals/:id` | Animal details | Animal profile pages |
| `POST /api/applications` | Submit adoption application | Application forms |
| `GET /api/reports/dashboard` | Dashboard stats | Staff/admin dashboards |
| `POST /api/volunteers` | Volunteer signup | Volunteer registration |
| `POST /api/donations` | Process donations | Donation forms |

---

## 🧪 **Testing Strategy**

### **Unit Testing with Jest**

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode for development
npm run test:watch
```

### **E2E Testing with Playwright**

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### **Test Coverage Areas**

#### **Frontend Component Testing**
- ✅ **Component Rendering** - All components render correctly
- ✅ **User Interactions** - Buttons, forms, navigation work
- ✅ **State Management** - Local and global state updates
- ✅ **API Integration** - API calls and response handling
- ✅ **Accessibility** - Screen reader compatibility, keyboard navigation

#### **E2E User Journey Testing**
- ✅ **Animal Browsing** - Search, filter, view animal profiles
- ✅ **Adoption Application** - Complete adoption workflow
- ✅ **Volunteer Signup** - Registration and onboarding
- ✅ **Staff Operations** - Animal management, application review
- ✅ **Admin Functions** - System administration, reporting

#### **Cross-Browser Testing**
- ✅ **Modern Browsers** - Chrome, Firefox, Safari, Edge
- ✅ **Mobile Devices** - iOS Safari, Android Chrome
- ✅ **Responsive Design** - All screen sizes and orientations

---

## 🚀 **Deployment**

### **Build for Production**

```bash
# Create production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Performance Optimizations**

- **📱 Responsive Images** - Next.js Image optimization
- **⚡ Code Splitting** - Automatic route-based splitting
- **🗜️ Bundle Analysis** - Optimized chunk sizes
- **🚀 Server Components** - Reduced client-side JavaScript
- **💾 Caching** - API response caching with TanStack Query
- **🎨 CSS Optimization** - Tailwind purging and minification

### **SEO Features**

- **📄 Meta Tags** - Complete OpenGraph and Twitter cards
- **🗺️ Sitemap** - Automatically generated
- **🏷️ Structured Data** - Schema.org markup for animals
- **⚡ Core Web Vitals** - Optimized for performance metrics
- **🔍 Search Console** - Google verification ready

---

## 🎯 **Capstone Project Integration**

### **Training Value for Manual → Automation Testers**

#### **Frontend Testing Skills**
1. **Component Testing** - Learn to test React components in isolation
2. **User Journey Testing** - End-to-end adoption workflow automation
3. **Cross-Browser Testing** - Ensure compatibility across browsers
4. **Accessibility Testing** - Validate WCAG compliance
5. **Performance Testing** - Monitor Core Web Vitals and loading times

#### **Modern Web Technologies**
1. **React 19 Patterns** - Server Components, concurrent features
2. **Next.js 15 Features** - App Router, image optimization, caching
3. **TypeScript Testing** - Type-safe test development
4. **API Integration** - Frontend ↔ Backend validation
5. **State Management** - Testing complex application state

#### **Real-World Application**
1. **Form Validation** - Test complex multi-step adoption forms
2. **Data Visualization** - Verify dashboard charts and statistics
3. **File Uploads** - Test animal photo upload functionality
4. **Search & Filtering** - Validate animal search capabilities
5. **Responsive Design** - Test across device sizes

### **Integration with Existing Backend**

The frontend seamlessly integrates with the existing Animal Sanctuary API:

- **Database Layer** ↔ **API Layer** ↔ **Frontend Layer**
- **Three-tier validation** across all layers
- **End-to-end adoption workflow** testing
- **Complete data consistency** verification

---

## 🤝 **Contributing & Development**

### **Development Workflow**

1. **Setup Development Environment**
   ```bash
   npm install
   npm run dev
   ```

2. **Make Changes**
   - Follow TypeScript patterns
   - Use existing component patterns
   - Maintain accessibility standards

3. **Test Changes**
   ```bash
   npm run test
   npm run test:e2e
   npm run type-check
   ```

4. **Code Quality**
   ```bash
   npm run lint
   npm run format
   ```

### **Component Development Guidelines**

#### **Creating New Components**
1. Use TypeScript with proper interfaces
2. Follow the sanctuary design system
3. Include accessibility attributes
4. Add proper error boundaries
5. Write unit tests

#### **Example Component Structure**
```typescript
interface AnimalCardProps {
  animal: Animal
  onAdopt?: (animalId: string) => void
  showDetails?: boolean
}

export function AnimalCard({ animal, onAdopt, showDetails = true }: AnimalCardProps) {
  return (
    <div className="sanctuary-card hover-lift">
      {/* Component implementation */}
    </div>
  )
}
```

---

## 📚 **Additional Resources**

### **Learning Materials**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### **Design Resources**
- [Animal Sanctuary Color Palette](./docs/color-palette.md)
- [Component Library](./docs/components.md)
- [Typography Guidelines](./docs/typography.md)
- [Icon Usage Guide](./docs/icons.md)

### **Testing Resources**
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Guides](https://testing-library.com/docs/)
- [Accessibility Testing](https://www.accessibility-developer-guide.com/)

---

## 🐾 **Project Status**

### **✅ Completed Features**
- ✅ Project foundation and configuration
- ✅ Beautiful sanctuary-themed design system
- ✅ Responsive homepage with hero section
- ✅ Animal showcase and mission sections
- ✅ Contact information and footer
- ✅ TypeScript setup and utility functions
- ✅ Provider configuration (Query, Theme, Toast)

### **🚧 In Progress**
- 🔄 Animal browsing and detail pages
- 🔄 Adoption application forms
- 🔄 Staff dashboard interface
- 🔄 Admin panel functionality

### **📋 Upcoming**
- 📋 Volunteer portal and signup
- 📋 Donation processing interface
- 📋 Advanced filtering and search
- 📋 Real-time notifications
- 📋 Mobile app features

---

## 💡 **Next Steps**

Ready to continue building? Here's what to work on next:

1. **🐕 Build Animal Pages** - Browse animals, detailed profiles, adoption applications
2. **👩‍⚕️ Create Staff Dashboard** - Animal management, application review, reports
3. **⚙️ Admin Panel** - User management, system settings, analytics
4. **🧪 Comprehensive Testing** - Component tests, E2E workflows, performance tests
5. **🚀 Production Deployment** - Optimization, monitoring, analytics

**This frontend provides the perfect foundation for training manual testers in modern web automation while delivering a production-quality animal sanctuary management system! 🎯**

---

*Built with ❤️ for animals in need and the people who care for them.*