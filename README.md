# bid-frontend

React frontend for the simple bidding/auction system.

## Run (dev)

From this folder:

```bash
npm install
npm start
```

Frontend runs at `http://localhost:5173`.

## Backend

The frontend expects the Spring Boot backend at `http://localhost:8080` (default).

- API base can be overridden with `VITE_API_BASE_URL`.
- Uploaded images are served by the backend at: `http://localhost:8080/uploads/<filename>`.
