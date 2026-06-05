# WiseBook

WiseBook is an AI handwritten note digitization platform based on the project plan in `WiseBook Project Plan.pdf`.

## What Is Built

- React + Tailwind frontend with landing page, auth, dashboard, upload, notes, search, subjects, analytics, profile, and settings screens.
- Node.js + Express backend with JWT auth, MongoDB models, protected routes, note upload, free local Tesseract OCR, AI summary service adapters, and analytics.
- OCR works locally for JPG/PNG/JPEG images with Tesseract and extracts embedded text from text-based PDFs.
- Saved notes can be exported as PDF files.
- AI summary fallback keeps the app runnable before OpenAI credentials are configured.

## Run Locally

Install dependencies once:

```bash
cd server
npm install
cd ../client
npm install
```

Run backend in one terminal:

```bash
cd C:\Users\alapu\Desktop\Wisebook\server
npm run dev
```

Run frontend in another terminal:

```bash
cd C:\Users\alapu\Desktop\Wisebook\client
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:8081`.

## Environment

Copy `server/.env.example` to `server/.env` and fill in keys when you are ready for real integrations.

```bash
MONGO_URI=
JWT_SECRET=
OPENAI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_ORIGIN=http://localhost:5173
```

Without provider keys, WiseBook still works with local OCR for images, embedded text extraction for text PDFs, PDF export, and deterministic demo AI summaries.

Note: scanned/image-only PDFs should be converted to JPG or PNG before upload for OCR.
