# Email Management System - Development Guide

A sophisticated email template management system with rich features for creating, editing, and managing dynamic email templates. Built with Next.js, React, TipTap rich text editor, and Prisma ORM with PostgreSQL.

## 🌟 Key Features

- **Rich Text Editing**: Advanced WYSIWYG editor powered by TipTap with comprehensive formatting options
- **Dynamic Variables**: Insert and manage template variables with live preview functionality
- **Responsive Design Testing**: Preview emails in desktop and mobile views
- **Email Components**: Ready-made components for tables, social links, and structured sections
- **Content Management**: Create, save, edit, and organize templates with folder organization
- **Background & Layout Editor**: Customize email structure with visual background editor
- **Header & Footer Management**: Consistent branding with reusable headers and footers
- **Export Options**: Multiple export formats including HTML and variable schemas
- **Database Integration**: PostgreSQL with Prisma ORM for reliable storage and retrieval

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Component Library**: Ant Design
- **Rich Text Editor**: TipTap with custom extensions
- **Styling**: TailwindCSS 4
- **Database ORM**: Prisma 6
- **Database**: PostgreSQL
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **TypeScript**: Type-safe development throughout the application

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- PostgreSQL database server (v14 or higher)
- npm or yarn

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/billowdev/email-management.git
   cd email-management
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   # Copy the sample env file and update with your database credentials
   cp env-sample .env
   ```

4. Configure your database connection in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/email_management?schema=public"
   ```

5. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
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

8. Access the application at `http://localhost:3000`

## 🏗️ Project Structure

```
email-management/
├── prisma/                   # Prisma schema and migrations 
│   ├── schema.prisma         # Database schema definition
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Database seeding script
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── api/              # API routes for templates, variables, etc.
│   │   ├── page.tsx          # Main page (template editor)
│   │   └── email-preview/    # Email preview page
│   ├── components/           # React components
│   │   ├── editor/           # Template editor components
│   │   │   ├── sections/     # Email section components (tables, social links)
│   │   │   ├── variables/    # Variable management components
│   │   │   ├── background/   # Background editor components
│   │   │   └── header-footer/# Header and footer components
│   │   └── pages/            # Page-level components
│   ├── lib/                  # Utility libraries
│   │   └── prisma.ts         # Prisma client setup
│   ├── services/             # Business logic and API services
│   │   ├── emailTemplateService.ts   # Template-related services
│   │   ├── emailBackgroundService.ts # Background-related services
│   │   └── exportService.ts          # Export functionality
│   └── types/                # TypeScript type definitions
│       ├── email-templates.ts # Email template related types
│       └── prisma.ts          # Prisma-related type extensions
└── next.config.ts            # Next.js configuration
```

## 🧩 Core Components Overview

### EmailTemplateManager (`src/components/editor/EmailTemplateManager.tsx`)
The main dashboard for managing templates. Handles template selection, creation, saving, and deletion.

### EmailTemplateEditor (`src/components/editor/EmailTemplateEditor.tsx`)
The primary editor component integrating TipTap for rich text editing and providing various tools for template customization.

### EmailPreview (`src/components/pages/email-preview/EmailPreview.tsx`)
Renders the email template with variables replaced and allows for testing with different screen sizes.

### EmailTemplateBackgroundEditor (`src/components/editor/background/EmailTemplateBackgroundEditor.tsx`)
Controls the layout, backgrounds, and structure of the email template.

### EmailTableComponent (`src/components/editor/sections/EmailTableComponent.tsx`)
Creates and manages email-compatible tables with customization options.

### SocialLinksComponent (`src/components/editor/sections/SocialLinksComponent.tsx`)
Inserts and configures social media links with various styling options.

### EmailSectionsComponent (`src/components/editor/sections/EmailSectionsComponent.tsx`)
Inserts pre-designed sections like buttons, dividers, headers, and spacers.

## 📊 Database Schema

The application uses a PostgreSQL database with the following key models:

### EmailTemplate
Stores the email template information, content, and relationships.

### TemplateVariable
Defines the variables that can be used within a template.

### PreviewData
Stores sample data for template previews.

### EmailTemplateBackground
Stores styling information for the email template.

### EmailTemplateHeaderFooter
Stores header and footer settings for email templates.

See `prisma/schema.prisma` for the complete database schema.

## 👩‍💻 Development Workflow

### Working with Templates

1. **Creating a Template**:
   - Use the template creation form at the top of the main page
   - Default variables like `firstName`, `lastName`, and `email` are automatically added

2. **Editing Content**:
   - Use the rich text editor with the toolbar for formatting
   - Insert variables using the variable panel on the right
   - Add special components like tables and social links using the toolbar

3. **Adding Variables**:
   - Click "Add New Variable" in the variable panel
   - Variables are automatically available in the editor as `{{.variableName}}`

4. **Customizing Layout**:
   - Switch to the "Preview & Layout" tab
   - Adjust background colors, container widths, and spacing
   - Configure headers and footers with logos, text, and styling

5. **Testing Templates**:
   - Use "Preview Mode" to see how the template looks with variables filled in
   - Click "Full Page Preview" for a dedicated preview page
   - Test responsive behavior using the mobile/desktop toggle

6. **Exporting Templates**:
   - Use the Export dropdown to export in various formats
   - Options include complete template, content only, or variables schema

### API Development

Use the API endpoints in `src/app/api/` to:
- Create, read, update, and delete templates
- Manage template variables
- Save and retrieve background and header/footer settings

When developing new features, follow these patterns to maintain consistency.

## 🧪 Adding New Features

### Adding a New Email Component

1. Create a new component in `src/components/editor/sections/`:
   ```tsx
   // src/components/editor/sections/NewComponent.tsx
   import React from 'react';
   import { Editor } from '@tiptap/react';
   import { Button } from 'antd';

   interface NewComponentProps {
     editor: Editor | null;
   }

   const NewComponent: React.FC<NewComponentProps> = ({ editor }) => {
     const insertContent = () => {
       if (!editor) return;
       editor.chain().focus().insertContent('<div>New component content</div>').run();
     };

     return <Button onClick={insertContent}>Insert New Component</Button>;
   };

   export default NewComponent;
   ```

2. Add the component to the EmailTemplateEditor toolbar.

### Adding a New Template Variable Type

1. Update the `VariableType` enum in `prisma/schema.prisma`
2. Generate and run a migration
3. Update the variable type options in the variable creation/edit components

## 📝 Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run linting and ensure all checks pass
5. Commit your changes with descriptive messages
6. Push to your fork and submit a pull request

## 🔍 Troubleshooting

### Database Connection Issues
- Verify your PostgreSQL server is running
- Check your connection string in the `.env` file
- Run `npx prisma db push` to sync the schema

### Editor Loading Problems
- Check browser console for errors
- Verify TipTap extensions are properly configured
- Ensure your Node.js version is compatible

### Export Functionality Issues
- Check for syntax errors in the export service
- Verify the template HTML structure
- Test with different browser environments

## 📚 Additional Resources

- [TipTap Documentation](https://tiptap.dev/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design Documentation](https://ant.design/components/overview/)

## 📄 License

[MIT](LICENSE)

---

For questions or support, please open an issue on the repository.
