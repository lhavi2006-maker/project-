# AI FAQ Assistant

A full-stack FAQ management system: Node.js/Express/MongoDB backend with JWT auth
and Google Gemini-powered FAQ generation, plus a plain HTML/CSS/JS frontend.

```
ai-faq-assistant/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/ (authController, faqController, aiController)
│   │   ├── middleware/ (authMiddleware, errorMiddleware)
│   │   ├── models/ (User, FAQ)
│   │   ├── routes/ (authRoutes, faqRoutes, aiRoutes)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example   <-- copy this to .env and fill in your keys
│   └── package.json
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## 1. Where to paste your MongoDB URI and API key

Open **`backend/.env.example`**, then save a copy of it as **`backend/.env`**
(same folder, just remove `.example` from the name). Fill in:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```

- **MONGO_URI** — from MongoDB Atlas: Database → Connect → "Drivers", looks like
  `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/faq-assistant?retryWrites=true&w=majority`
  (or `mongodb://localhost:27017/faq-assistant` if running MongoDB locally).
- **JWT_SECRET** — any long random string you make up (used to sign login tokens).
- **GEMINI_API_KEY** — get one free at https://aistudio.google.com/app/apikey

Never commit the real `.env` file — it's already in `.gitignore`.

## 2. Terminal commands to run it

**Backend:**
```bash
cd ai-faq-assistant/backend
npm install
npm run dev
```
This starts the API at `http://localhost:5000`. You should see
`MongoDB Connected: ...` and `Server running on http://localhost:5000`.

(`npm run dev` needs nodemon, which is installed automatically as a dev
dependency. If you'd rather not auto-restart on file changes, use `npm start`
instead.)

**Frontend:**
The frontend is plain static files, so you can just open `frontend/index.html`
directly in a browser, or serve it so relative paths behave nicely:
```bash
cd ai-faq-assistant/frontend
npx serve .
```
Then open the URL it prints (usually `http://localhost:3000`).

If your backend runs somewhere other than `http://localhost:5000`, update the
`API_BASE_URL` constant at the top of `frontend/script.js`.

## 3. Quick API test (optional, via curl)

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya@writeflow.com","password":"securepassword123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@writeflow.com","password":"securepassword123"}'

# Create an FAQ (replace TOKEN with the token from login/register response)
curl -X POST http://localhost:5000/api/faqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"question":"How do I reset my password?","answer":"Go to Settings > Security > Reset Password.","category":"Account"}'

# Search FAQs
curl "http://localhost:5000/api/faqs/search?q=password"

# AI-generate a FAQ pair (needs GEMINI_API_KEY set)
curl -X POST http://localhost:5000/api/ai/generate-faq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"topic":"Mongoose schema indexing validation runtime workflow optimization"}'
```

## API Routes Summary

| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Log in, get JWT |
| GET | /api/auth/profile | Private | Current user's profile |
| GET | /api/faqs | Public | List all FAQs |
| GET | /api/faqs/search?q= | Public | Keyword search |
| GET | /api/faqs/:id | Public | Get one FAQ |
| POST | /api/faqs | Private | Create FAQ |
| PUT | /api/faqs/:id | Private (owner/admin) | Update FAQ |
| DELETE | /api/faqs/:id | Private (owner/admin) | Delete FAQ |
| POST | /api/ai/generate-faq | Private | AI-generate a Q&A pair from a topic |
