# Nuxt Studio CMS Integration (Self-Hosted)

Self-hosted Nuxt Studio for visual content editing. Runs locally at `/_studio` route - no external service dependency.

**Package:** `nuxt-studio` (from https://github.com/nuxt-content/nuxt-studio)

## Access URLs

| Environment | Studio URL |
|-------------|------------|
| Local | http://localhost:3000/_studio |
| Production | https://mp2025.netlify.app/_studio |

Studio runs as part of your Nuxt app - no external domain.

## Setup

### 1. Prerequisites

- `nuxt-studio` module installed
- `@nuxt/content` v3.x installed
- GitHub OAuth app configured

### 2. GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Morten Studio
   - **Homepage URL:** `https://mp2025.netlify.app`
   - **Authorization callback URL:** `http://localhost:3000/api/_studio/auth/github/callback`
4. After creating, add a second callback URL for production:
   - `https://mp2025.netlify.app/api/_studio/auth/github/callback`

### 3. Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
NUXT_STUDIO_GITHUB_CLIENT_ID=<your_client_id>
NUXT_STUDIO_GITHUB_CLIENT_SECRET=<your_client_secret>
```

### 4. Netlify Production Setup

Add these environment variables in Netlify dashboard (Site settings > Environment variables):

```
NUXT_STUDIO_GITHUB_CLIENT_ID=<your_client_id>
NUXT_STUDIO_GITHUB_CLIENT_SECRET=<your_client_secret>
```

### 5. Configuration

In `nuxt.config.ts`:

```typescript
modules: ['@nuxt/content', 'nuxt-studio'],

studio: {
  enabled: true,
  repository: {
    provider: 'github',
    owner: 'patsma',
    repo: 'morten-2025',
    branch: 'main'
  }
}
```

## Local Development

```bash
npm run dev
```

Then visit `http://localhost:3000/_studio` and authenticate with GitHub.

## Editable Content

### YAML Data Files (`content/data/`)

| File | Description | Schema |
|------|-------------|--------|
| `hero/*.yml` | Hero section content | headline segments, services toggle |
| `services.yml` | Services list | array of strings |
| `case-studies.yml` | Case study gallery items | title, description, image, link |
| `experience.yml` | Work history | date range, title, company, location |
| `clients.yml` | Client lists | primary/secondary arrays |
| `awards.yml` | Awards & recognition | awards count/name, featured names |
| `recommendations.yml` | Testimonials | quote, author info |
| `biography/*.yml` | Biography paragraphs | label, paragraphs array |

### Page Collections

| Collection | Path | Description |
|------------|------|-------------|
| `pages` | `content/*.md` | MDC pages (root-level) |
| `projects` | `content/projects/*.md` | Project case studies |
| `blog` | `content/blog/*.md` | Blog posts |
| `lab` | `content/lab/*.md` | Experimental projects |

## Schema Configuration

All schemas are defined in `content.config.ts` using Zod. Studio reads these schemas to generate the editing UI.

### Field Types

- `z.string()` - Text input
- `z.number()` - Number input
- `z.boolean()` - Toggle switch
- `z.enum([...])` - Dropdown select
- `z.array(z.string())` - List of strings
- `z.array(schema)` - Repeatable objects

### Image Fields

Image fields like `image`, `cover`, `thumbnail` are defined as `z.string()` containing the path to the image (e.g., `/images/project.jpg`).

To upload images:
1. Add images to `public/images/` directory
2. Reference them in content as `/images/filename.jpg`

## Content Structure

```
content/
├── data/
│   ├── hero/
│   │   ├── home.yml       # Home page hero
│   │   └── about.yml      # About page hero
│   ├── biography/
│   │   ├── home.yml       # Home page bio
│   │   └── about.yml      # About page bio
│   ├── services.yml
│   ├── case-studies.yml
│   ├── experience.yml
│   ├── clients.yml
│   ├── awards.yml
│   └── recommendations.yml
├── projects/
│   └── *.md               # Project pages
├── blog/
│   └── *.md               # Blog posts
├── lab/
│   └── *.md               # Lab experiments
└── *.md                   # Root pages (work.md, etc.)
```

## Workflow

### Making Edits

1. Visit `http://localhost:3000/_studio` (or production URL)
2. Authenticate with GitHub
3. Navigate to the content you want to edit
4. Make changes in the visual editor
5. Preview changes in real-time
6. Commit changes (creates a git commit)

### Publishing

Changes are committed directly to your GitHub repository. If you have:
- **Netlify auto-deploy:** Changes go live automatically after commit
- **Manual deploy:** Pull changes and deploy manually

## Troubleshooting

### Studio Route Not Loading

Ensure:
- `nuxt-studio` is in dependencies (not devDependencies)
- Module is listed in `nuxt.config.ts` modules array
- Dev server is running

### Authentication Errors

Check:
- GitHub OAuth app callback URL matches exactly
- Environment variables are set correctly
- Both `CLIENT_ID` and `CLIENT_SECRET` are provided

### Schema Validation Errors

If Studio shows validation errors:
1. Check `content.config.ts` for schema issues
2. Ensure content files match their schema definitions
3. Run `npm run dev` and check console for Zod errors

## Known Limitations

1. **Image uploads:** Images must be added to `public/` manually; Studio doesn't have built-in media upload
2. **Complex arrays:** Nested arrays of objects work but may have limited UI customization
3. **MDC components:** Custom MDC components are supported but may need documentation for content editors

## Related Documentation

- [nuxt-studio (self-hosted)](https://github.com/nuxt-content/nuxt-studio)
- [Nuxt Content v3](https://content.nuxt.com)
- [Content Collections](https://content.nuxt.com/docs/collections)
