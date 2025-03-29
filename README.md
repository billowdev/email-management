# Email Template Management System

A comprehensive system for creating, editing, and managing dynamic email templates with variable support, built with Next.js, React, TipTap rich text editor, and Prisma ORM.

## Features

- 🖋 Rich text editor with TipTap for email template creation
- 🔄 Dynamic template variables with preview functionality
- 🎨 Email layout and styling customization
- 📊 Table support for data-rich emails
- 🔗 Social media integration
- 📱 Email preview with responsive design testing
- 💾 PostgreSQL database storage with Prisma ORM
- 🧩 Variable management (add, edit, delete)
- 📤 Export options (HTML, template with variables)
- 📂 Template organization with folders

## Tech Stack

- **Frontend**: Next.js, React, Ant Design
- **Rich Text Editing**: TipTap
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **UI Components**: Ant Design
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Yarn or npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/billowdev/email-management
   cd email-template-management
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Configure the database:
   - Create a `.env` file in the root directory
   - Add your PostgreSQL connection string:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/email_templates"
     ```

4. Initialize Prisma:
   ```bash
   npx prisma generate
   ```

5. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Seed the database with initial data:
   ```bash
   npm run seed
   # or
   yarn seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema

The application uses a PostgreSQL database with the following key models:

### EmailTemplate
Stores the email template information, content, and relationships.
```prisma
model EmailTemplate {
  id              String            @id @default(uuid())
  name            String
  description     String?
  defaultContent  String            @db.Text
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  userId          String?
  user            User?             @relation(fields: [userId], references: [id])
  isSystem        Boolean           @default(false)
  variables       TemplateVariable[]
  previewData     PreviewData[]
  templateFolder  TemplateFolder?   @relation(fields: [foldererId], references: [id])
  foldererId      String?
  background      EmailTemplateBackground?
}
```

### TemplateVariable
Defines the variables that can be used within a template.
```prisma
model TemplateVariable {
  id              String          @id @default(uuid())
  key             String
  name            String
  type            VariableType    @default(TEXT)
  defaultValue    String?
  description     String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  required        Boolean         @default(false)
  emailTemplate   EmailTemplate   @relation(fields: [emailTemplateId], references: [id], onDelete: Cascade)
  emailTemplateId String

  @@unique([emailTemplateId, key])
}
```

### PreviewData
Stores sample data for template previews.
```prisma
model PreviewData {
  id              String        @id @default(uuid())
  name            String
  data            Json          @db.JsonB
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  emailTemplate   EmailTemplate @relation(fields: [emailTemplateId], references: [id], onDelete: Cascade)
  emailTemplateId String

  @@index([emailTemplateId])
}
```

### Additional Models
- `EmailTemplateBackground`: Stores styling information for the email template.
- `TemplateFolder`: For organizing templates into folders.
- `SavedEmailTemplate`: Stores templates with populated variables.
- `SentEmail`: Tracks sent emails for analytics.
- `User`: User accounts for the system.

## TipTap Editor Configuration

The TipTap editor is configured with extensions for rich email creation:

```javascript
const editor = useEditor({
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: 'Type your email template here...',
    }),
    Link.configure({
      openOnClick: false,
    }),
    Image,
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TextStyle,
    Color,
    Variable, // Custom extension for handling variables
  ],
  content: initialContent,
  // Additional configuration...
})
```

## API Routes

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create a new template
- `GET /api/templates/:id` - Get template by ID
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Variables
- `GET /api/templates/:id/variables` - Get all variables for a template
- `POST /api/templates/:id/variables` - Add a variable to a template
- `PUT /api/templates/:id/variables/:variableId` - Update a variable
- `DELETE /api/templates/:id/variables/:variableId` - Delete a variable

### Preview Data
- `GET /api/templates/:id/preview` - Get preview data for a template
- `PUT /api/templates/:id/preview` - Update preview data

### Background Settings
- `GET /api/templates/:id/background` - Get background settings
- `PUT /api/templates/:id/background` - Update background settings

## Components Overview

### Core Components
- `EmailTemplateEditor`: Main rich text editor component for email content
- `EmailTemplateManager`: Dashboard for managing templates
- `AddVariableComponent`: Interface for adding variables to templates
- `VariableTabs`: Management for template variables and preview data
- `EmailTemplateBackgroundEditor`: Editor for email background and structure

### Advanced Components
- `ImageUploadComponent`: Image handling for email templates
- `EmailSectionsComponent`: Add pre-designed sections to emails
- `EmailTableComponent`: Table creation for emails
- `SocialLinksComponent`: Social media links integration
- `ExportOptionsComponent`: Export functionality for templates

## Deployment

This application can be deployed to platforms like Vercel, Netlify, or any Node.js hosting provider. Make sure to:

1. Set up your PostgreSQL database.
2. Configure environment variables for database connection.
3. Run migrations on the production database before deployment.

## Development Workflow

1. **Database Schema Changes**:
   - Modify the Prisma schema in `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name description` to create migrations
   - Apply migrations with `npx prisma migrate deploy`

2. **API Endpoints**:
   - Create or modify API routes in `src/app/api/**/*.ts`

3. **UI Components**:
   - Component development in `/components` directory
   - Page development in `/app` directory

4. **Email Templates**:
   - Custom email components in `/components/editor`

## License

[MIT](LICENSE)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request