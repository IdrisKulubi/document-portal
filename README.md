# Document Portal - Secure Document Management System

A secure document management system built with Next.js that focuses on controlled document access and printing. The system prevents unauthorized document downloads while enabling secure viewing and printing capabilities.

## Key Features

- 🔒 **Secure Document Viewing**
  - Watermarked document previews
  - Print-only access mode
  - Protected document content
  - Version control system

- 🖨️ **Controlled Printing**
  - Custom print implementation
  - No save/download options
  - Watermarked previews
  - Print tracking

- 👥 **User Management**
  - Role-based access (Admin/User)
  - Document sharing controls
  - Activity monitoring
  - Usage analytics

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL with [Neon](https://neon.tech)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **File Storage**: [Vercel Blob](https://vercel.com/storage/blob)
- **Forms**: React Hook Form + Zod

## Getting Started

1. **Clone the repository**
```bash
git clone [https://github.com/IdrisKulubi/document-portal](https://github.com/IdrisKulubi/document-portal)
cd document-portal
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**

Create a `.env.local` file:
```env
POSTGRES_URL=your_postgres_url
AUTH_SECRET=your_auth_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAILS=admin@example.com
UPLOADTHING_TOKEN=your_uploadthing_token
```

4. **Run Development Server**
```bash
npm run dev
# or
yarn dev
```

## Project Structure
```
src/
├── app/                    # Next.js app router pages
├── components/            
│   ├── admin/             # Admin dashboard components
│   ├── documents/         # Document handling components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/                   # Utilities and helpers
└── db/                    # Database configuration
```

## Security Features

- 🛡️ **Document Protection**
  - Watermarked document previews
  - Print-only access mode
  - Disabled save/download functionality
  - Secure file storage

- 🔐 **Access Control**
  - Role-based permissions
  - Document version tracking
  - Activity logging
  - Sharing controls

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [kulubiidris@gmail.com](mailto:kulubiidris@gmail.com) or open an issue in the repository.
