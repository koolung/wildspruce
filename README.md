# Wild Spruce Website

A modern, professional website for Wild Spruce built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**.

## 🌲 Features

- **Responsive Design** - Mobile-first approach that works on all devices
- **Modern UI** - Clean, professional design with accent color #223318
- **Fast Performance** - Optimized with Next.js for lightning-fast load times
- **SEO Optimized** - Built-in meta tags and structured data
- **Accessible** - WCAG compliant with proper semantic HTML
- **Component-Based** - Reusable React components for easy maintenance
- **Contact Form** - Fully functional contact form
- **Smooth Animations** - Subtle transitions and hover effects

## 📁 Project Structure

```
wildspruce/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   └── components/
│       ├── Header.tsx          # Navigation header
│       ├── Hero.tsx            # Hero section
│       ├── Services.tsx        # Services showcase
│       ├── Contact.tsx         # Contact form
│       └── Footer.tsx          # Footer
├── public/                     # Static assets
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
└── next.config.js            # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn installed

### Installation

1. Navigate to the project directory:
```bash
cd wildspruce
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the site!

## 📦 Build & Deploy

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Deploy to Vercel (Recommended):
```bash
npm install -g vercel
vercel
```

## 🎨 Customization

### Colors
Edit the accent color in:
- [tailwind.config.ts](tailwind.config.ts) - Change `#223318` to your desired color
- [src/app/globals.css](src/app/globals.css) - Update Tailwind color utilities

### Content
- Update company info in [src/components/Footer.tsx](src/components/Footer.tsx)
- Modify services in [src/components/Services.tsx](src/components/Services.tsx)
- Change hero text in [src/components/Hero.tsx](src/components/Hero.tsx)

### Metadata
Edit site title and description in [src/app/layout.tsx](src/app/layout.tsx)

## 📞 Contact Information
Update contact details in [src/components/Contact.tsx](src/components/Contact.tsx):
- Email
- Phone
- Address

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Package Manager**: npm

## 📄 License

MIT License - Feel free to use this template for your projects!

## 🤝 Support

For issues or questions, feel free to reach out through the contact form on the website.

---

**Made with 🌲 for Wild Spruce**
