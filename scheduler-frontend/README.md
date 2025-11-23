# React + Vite

This repository contains the frontend for Study Plan Scheduler, a web application that helps students generate personalized study schedules based on course load, deadlines, and availability.

**Live demo / backend**: This frontend is designed to work with the backend at `http://localhost:8080` (see `scheduler-backend` folder in the repo).

## Key features

- Create and manage courses, deadlines and study goals
- Automatic schedule generation based on availability and due dates
- Google OAuth2 sign-in (uses backend OAuth endpoints)
- Calendar integration (import/export) and progress tracking
- Responsive UI for mobile and desktop

## Tech stack

- React 19 + Vite
- Material UI (MUI) for components
- FullCalendar for calendar UI
- React Query for data fetching
- TailwindCSS (utility styles)
- Axios for HTTP requests

Dependencies are defined in `package.json`.

## Getting started (developer)

Requirements:

- Node.js (LTS recommended)
- npm or yarn

Install and run locally:

```bash
# from the frontend folder
cd scheduler-frontend
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Linting:

```bash
npm run lint
```

## Environment & backend

The frontend expects the backend API to be available at `http://localhost:8080` by default. If your backend runs at a different URL, update the API base in `src/api.js` or set up a proxy in Vite.

OAuth sign-in (Google) is initiated from the frontend and routed through the backend OAuth endpoints (example: `/oauth2/authorization/google`).

## Notes, caveats & housekeeping

- The repository currently contains IDE files (`.idea/`, `.vscode/`) and a nested `scheduler-backend` Git repository. Consider adding IDE folders to `.gitignore` and making the backend a proper submodule if you want it tracked separately.
- There may be line-ending warnings on Windows (LF → CRLF). You can configure with:

```bash
git config core.autocrlf true
```

## Contributing

1. Create an issue describing the change or bug.
2. Create a feature branch and open a pull request.

## License

Include a license file in the repo root if you plan to open source this project.

---

Frontend files: `scheduler-frontend/src` — run the `dev` script to start the app.

If you want, I can also update the root `README.md`, add a contribution guide, or remove IDE files from the history. Tell me which you prefer.
