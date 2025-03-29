This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
# Tiptap 


- Install
```bash
# Base packages
yarn add @tiptap/react @tiptap/pm @tiptap/starter-kit
```

```bash
# For advanced features (optional)
yarn add @tiptap/extension-image @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-placeholder @tiptap/extension-color @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
```

```bash
yarn add @ant-design/cssinjs
```


# 1. Install Prisma dependencies
npm install prisma @prisma/client

# 2. Initialize Prisma in your project
npx prisma init


# Create a migration
npx prisma migrate dev --name init

# Generate the Prisma Client based on your schema
npx prisma generate
