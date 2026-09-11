# NoteDrop Backend

This backend powers the NoteDrop file-sharing app using Node.js, Express, PostgreSQL (Supabase), and Supabase Storage.

## Requirements

- Node.js 18+
- A Supabase project
- A PostgreSQL database
- A storage bucket named `notedrop-files`
- A service-role key kept only on the backend

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL editor in Supabase and run the schema from `database/schema.sql`.
3. Create a Storage bucket named `notedrop-files`.
4. Set the bucket to private (do not allow unrestricted public access).
5. Copy the project URL and service-role secret from the Supabase dashboard.
6. Add them to a backend `.env` file.

> Warning: The Supabase service-role key must only exist on the backend. Never expose it to the React frontend.

## Environment configuration

Create a `.env` file in the `backend` folder based on `.env.example`.

Example:

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=notedrop-files
MAX_FILE_SIZE_MB=50
CLEANUP_INTERVAL_MS=60000
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## Install dependencies

```bash
cd backend
npm install
```

## Run locally

```bash
npm run dev
```

The backend API will run at `http://localhost:8000/api`.

## Production

```bash
npm start
```

The app includes a built-in cleanup worker that checks for expired drops every minute.

## API summary

- `POST /api/drops`
- `GET /api/drops/:code`
- `POST /api/drops/:code/verify`
- `GET /api/drops/:code/download`
- `DELETE /api/drops/:code`
- `GET /api/health`

## Notes

- The frontend countdown is informational only; server time is authoritative.
- Files are stored in Supabase Storage, while metadata lives in PostgreSQL.
- Download authorization is enforced by the backend before any file is served.
