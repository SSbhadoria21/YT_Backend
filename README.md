# Backend Project - YouTube (Clone / Tutorial)

## Overview

This is the backend for a small YouTube-like project built with Node.js, Express and MongoDB. It provides user authentication (JWT), file upload (Multer), Cloudinary image/video storage, and basic video/user models and controllers to support a frontend client.

## What I did (step-by-step)

1. Initialized the Node.js project and set `type: module` in `package.json`.
2. Installed runtime and dev dependencies.
3. Created environment configuration using `dotenv` and a `.env` file.
4. Implemented MongoDB connection with `mongoose` and added `User` and `Video` models.
5. Built authentication (registration/login) using `bcrypt` and `jsonwebtoken` (JWT).
6. Added file upload support with `multer` and integrated Cloudinary for media hosting.
7. Implemented controllers and routes for users and videos (`controllers/`, `routes/`).
8. Added utilities for consistent API responses, async error handling, and Cloudinary helpers.
9. Configured development scripts using `nodemon`.

## Tech stack & Packages

**Core runtime**
- Node.js (ES Modules)
- Express

**Key dependencies** (extracted from `package.json`)
- `bcrypt` — password hashing
- `cloudinary` — media hosting
- `cookie-parser` — cookie parsing
- `cors` — cross-origin resource sharing
- `dotenv` — environment variables
- `express` — web framework
- `jsonwebtoken` — JWT authentication
- `mongoose` — MongoDB ODM
- `mongoose-aggregate-paginate-v2` — aggregate pagination
- `multer` — file uploads

**Dev dependencies**
- `nodemon` — auto restart during development
- `prettier` — formatting

## Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB (Atlas or local)
- Cloudinary account (optional but recommended for media storage)

## Installation & Setup

1. Clone and enter the repo:

```bash
git clone <repo-url>
cd backend Project - You Tube
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file at the project root. Example (replace with your values):

```env
MONGODB_URI="your_mongodb_connection_string"
PORT=8000
CORS_ORIGIN="http://localhost:3000"
ACCESS_TOKEN_SECRET="replace_with_a_secure_random_value"
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET="replace_with_a_secure_random_value"
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

4. Start the development server:

```bash
npm run dev
```

The `dev` script uses `nodemon` and loads `dotenv` (see `package.json`).

## Project structure (important files)

- `src/index.js` — server entry (starts Express and connects DB)
- `src/app.js` — Express app, middleware and global error handler
- `src/controllers/` — controller logic (e.g., `user.controller.js`)
- `src/routes/` — route registration (e.g., `user.routes.js`)
- `src/models/` — Mongoose schemas (`User.model.js`, `Video.model.js`)
- `src/middlewares/` — middleware (`auth.middleware.js`, `multer.middleware.js`)
- `src/db/index.js` — MongoDB connection helper
- `src/utils/` — helpers like `apiError.js`, `Apiresponse.js`, `asyncHandler.js`, `Cloudinary.js`
- `public/` — static files (if used)

## Environment variables (what to provide)

- `MONGODB_URI` — connection string
- `PORT` — server port
- `CORS_ORIGIN` — allowed origin(s)
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` — JWT secrets
- `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY` — token lifetimes
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary creds

## How the core pieces work

- **Authentication**: User registration and login are handled in controllers; passwords hashed with `bcrypt`, JWTs issued with `jsonwebtoken` using secrets from `.env`.
- **File Uploads**: `multer` handles uploads; uploaded files are sent to Cloudinary by `Cloudinary.js`, and returned URLs are saved on the `Video` documents.
- **Models**: `User.model.js` and `Video.model.js` define data shapes and any helper methods.
- **Error Handling**: Controllers use `asyncHandler` and custom `apiError` to centralize error responses.

## Common commands

- Install: `npm install`
- Run dev: `npm run dev`

## Security & notes

- Do not commit `.env` or any credentials.
- Use strong, randomly generated values for JWT secrets.

## Next steps (suggested)

- Add automated tests (Jest + Supertest).
- Add input validation and rate limiting.
- Add more video-related endpoints: comments, likes, search, and pagination.

---

If you want, I can also add a `.env.example` file with these placeholders, run the server and confirm it starts, or commit this README for you. Tell me which you'd like.
