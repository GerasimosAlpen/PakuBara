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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## AI Use and Third-Party Declaration

### AI use

AI assistants were used as a helper during development, mainly for code suggestions and refactoring, the UI redesign, and drafting supporting documents (`DESIGN.md`, the antislop audit notes, and the image prompts in `docs/image-prompts.md`). The product idea, requirements (see the PRD and Concept Proposal), system design, hardware, and the final decisions come from the team, who remain responsible for everything in this repository.

The illustrations in `public/images/` (landing page steps and the empty state of the command map) were generated with an AI image tool from the prompts in `docs/image-prompts.md`, then cropped and converted to WebP for the layout.

### Third-party software

Used under their own licenses; see each package for the terms.

- **Web app:** Next.js, React, Tailwind CSS, Radix UI, Lucide icons, class-variance-authority, clsx, tailwind-merge, TanStack Query, Framer Motion, date-fns, Zod, jose, jsPDF and jspdf-autotable.
- **Maps and charts:** MapLibre GL JS, deck.gl, Apache ECharts and echarts-for-react.
- **Data layer:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Prisma and `pg`.
- **Fonts:** Inter and JetBrains Mono, loaded through `next/font` (SIL Open Font License).
- **Vendored file:** `public/maplibre/` contains the MapLibre GL JS worker copied unmodified from the `maplibre-gl` package (BSD-3-Clause), so the map works in webpack mode.
- **Analysis scripts (`analysis/`):** NumPy, pandas, scikit-learn and SciPy.
- **Firmware (`firmware/`):** Arduino core and the LoRa and SPI libraries.
- **Bridge (`bridge/`):** dotenv.

### Third-party services and data

- **Supabase:** database, auth and realtime.
- **Vercel:** deployment of the web app.
- **Fonnte:** WhatsApp alert delivery.
- **NASA FIRMS:** satellite hotspot layer.
- **Open-Meteo:** wind, weather and air quality.
- **Map tiles:** OpenStreetMap contributors and Esri (ArcGIS Online basemaps), shown with their attribution on the map.
- **Published figures on the landing page** (burnt area, losses, smouldering temperature and spread rate) come from the sources cited in the PakuBara Concept Proposal and are credited next to each number on the page.
