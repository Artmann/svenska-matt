- Design for mobile first. Then use Tailwind modifiers to expand the design for
  larger devices and desktop.
- Don't use CONSTANT_CASE. This is not JAVA.
- Use entire words as variable names. This is not Go. For example `request`
  instead of `req`.
- Use punctuation.
- Use whitespace to break up code to make it easier to read. Put a blank like
  after const groups and control flows and before return statements.
- Order things in alphabetical order by default. If applicable order by
  accessiblity level first, then alphabetical order.
- No any: Use proper types or unknown
- No Non-null Assertions: Avoid ! operator
- Prefer Nullish Coalescing: Use ?? over ||
- No Floating Promises: Always await or handle promises
- Single quotes
- No semicolons
- Always use bracers for control statements.

## Error handling

- Always handle errors.
- User facing errors should be easy to understand and actionable.
- Error messages must be **actionable** — tell the user what went wrong and what
  they can do about it
- When planning features, always consider what errors can occur and include the
  exact error messages in the plan

## Testing

- Put test files next to the implementation.
- Prefer `toEqual` over `toBe`
- Compare entire objects instead of single properties.
  `expect(product).toEqual({ id: 1, name: 'Cup' })`
- Use RTL to test React components.
- Unit test small, side effect free modules.
- We prefer "integration tests" that only mocks a small set of dependencies.
- Normally, we test the entire endpoint, using a mock database in esix. A good
  API test should perform a request and then assert that the correct documents
  have been created in the database.

## Prefered Tools

- Bun
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React hook form
- tiny-invariant
- tiny-typescript-logger
- Mongo DB (with Esix)
- Zod

See @writing-guide.md for instructions on how to write lesson content.

## Project Overview

This is **Spanish Bear** ([spanishbear.com](https://spanishbear.com/)) — a
Spanish learning platform with an AI tutor, built using React Router v7. The
platform provides structured lessons with an interactive AI assistant for
practice and conversation.

## Development Commands

```bash
# Development server with HMR
bun dev

# Build for production
bun run build

# Type checking
bun typecheck

# Linting
bun lint

# Format code
bun format

# Install dependencies
bun install
```

## Architecture Overview

### React Router v7 Structure

This project uses React Router v7 with full-stack capabilities:

- **Routes**: Defined in `app/routes.ts` with automatic type generation
- **Layout Pattern**: Nested layouts for course structure (`layout.tsx` files)
- **API Routes**: Server-side API endpoints (e.g., `/api/chat` for AI tutor)
- **Type Safety**: Automatic type generation in `+types/` directories

### Content Management System

The Spanish course content follows a hierarchical structure:

```
app/content/courses/spanish-beginner/
├── course.json              # Course metadata
└── module-01-hola/         # Module directory
    ├── module.json         # Module metadata
    ├── overview.md         # Module overview
    └── lesson-*.md         # Individual lessons
```

**Key Points:**

- Lessons are Markdown files with YAML frontmatter
- Frontmatter includes: `title`, `objectives`, `vocabulary`
- Content is automatically discovered by `CourseService`
- Uses `gray-matter` for parsing frontmatter

### Service Layer

**CourseService** (`app/services/course-service.server.ts`):

- `listModules()`: Discovers and loads module metadata
- `listLessons(moduleId)`: Lists lessons for a module (metadata only)
- `findLesson(moduleId, lessonId)`: Gets lesson with metadata
- `readLessonContent(moduleId, lessonId)`: Gets lesson content only

**Key Patterns:**

- Server-side only (`.server.ts` suffix)
- Uses file system for content discovery
- TypeScript DTOs in `app/glue/courses.ts`
- Graceful error handling with logging

### AI Tutor Integration

The AI tutor is implemented as a context-aware system:

**TutorContext** (`app/components/tutor/tutor-context.tsx`):

- Tracks current lesson and module
- Manages chat state and conversation history
- Provides lesson context to AI responses

**API Route** (`app/routes/api/chat.ts`):

- Streaming OpenAI responses
- Comprehensive system prompt with course context
- Handles lesson-specific questions and general Spanish practice

**UI Components**:

- `Tutor` component with chat interface
- Streaming message display
- Context-aware responses based on current lesson

### Styling and UI

**Tailwind CSS v4 Setup**:

- Modern `@theme` directive in `app/app.css`
- OKLCH color system for better color management
- Geist font family loaded from Google Fonts
- shadcn/ui components for consistent UI

**Component Patterns**:

- Co-located types in `+types/` directories
- Responsive design with mobile-first approach
- Clean component architecture with TypeScript

### Data Flow

1. **Content Loading**: `CourseService` discovers and parses content files
2. **Route Loaders**: Server-side data loading for each route
3. **AI Context**: `TutorContext` tracks current lesson state
4. **API Communication**: Streaming responses from OpenAI API
5. **UI Updates**: React components update based on context changes

### Key Dependencies

- **React Router v7**: Full-stack React framework
- **OpenAI**: AI tutor functionality
- **gray-matter**: YAML frontmatter parsing
- **ReactMarkdown**: Lesson content rendering
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type safety throughout

### Development Patterns

**File Organization**:

- Routes mirror URL structure in `app/routes/`
- Services in `app/services/` with `.server.ts` suffix
- Components in `app/components/` with clear structure
- Types in `app/glue/` for shared interfaces

**Content Updates**:

- Add new lessons by creating Markdown files
- Update `module.json` with lesson metadata
- Content is automatically discovered on server restart

**AI Tutor Customization**:

- Modify system prompt in `app/routes/api/chat.ts`
- Extend context tracking in `TutorContext`
- Add new conversation features through API route

### Deployment

The application is Docker-ready with support for multiple platforms:

- Production build outputs to `build/` directory
- Server-side rendering for better performance
- Environment variables for API keys and configuration

### Development Workflow

- When you are finished making changes, run "bun format" to format the code.
