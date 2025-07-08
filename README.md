# Blog Spot

A full-stack modern blog application featuring collaborative editing, user authentication, image uploads, and real-time interactions.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- ✍️ Collaborative blog post editing
- 🔒 User authentication (with OAuth support)
- 🖼️ Image uploads (Cloudinary integration)
- 💬 Comments and bookmarks
- 📊 Real-time post views and interactions
- 🏷️ Categories and user dashboards

## Tech Stack

**Frontend:**
- React 19
- Redux Toolkit
- Tiptap Editor
- Firebase
- TailwindCSS
- Vite

**Backend:**
- Node.js & Express.js
- MongoDB (Mongoose)
- Zod (validation)
- Cloudinary (image storage)

---

## Project Structure

```
Blog Spot/
  backend/      # Express.js API, MongoDB models, controllers, routes
  frontend/     # React app, Redux, Tiptap, TailwindCSS
  README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)
- Firebase project (for frontend auth)

---

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in `backend/` with the following:
     ```
     MONGODB_URI=your_mongodb_connection_string
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     JWT_SECRET=your_jwt_secret
     ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000` by default.

---

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in `frontend/` with your Firebase config:
     ```
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_firebase_app_id
     ```

3. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173` by default.

---

## Environment Variables

Both backend and frontend require environment variables for secure configuration. See the setup sections above for details.

---

## Scripts

### Backend

- `npm start` — Start the Express server
- `npm run dev` — Start server with nodemon (if configured)

### Frontend

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

---

## License

This project is licensed under the MIT License.

---

Let me know if you want to add usage examples, API documentation, or any other sections!