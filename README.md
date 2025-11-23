# Study Plan Scheduler

Study Plan Scheduler is a full-stack application that helps students create personalized study schedules based on course load, deadlines, and availability. This repository contains both the frontend (React + Vite) and backend (Spring Boot / Java) components.

## Repository structure

- `scheduler-frontend/` — React + Vite frontend. Run `npm run dev` inside this folder to start the UI.
- `scheduler-backend/` — Spring Boot backend with REST APIs, authentication (OAuth2), and persistence (see `pom.xml`).
- `logs/` — runtime logs and archived logs produced by the application during development/testing.

## Quickstart (development)

Prerequisites:

- Java 17+ (for backend)
- Maven (or use the included `mvnw` wrapper)
- Node.js (LTS) and npm

1. Start the backend (from repo root):

```bash
cd scheduler-backend
./mvnw spring-boot:run
```

The backend serves on `http://localhost:8080` by default.

2. Start the frontend (in a separate terminal):

```bash
cd scheduler-frontend
npm install
npm run dev
```

Open the frontend in your browser (Vite will show the URL, usually `http://localhost:5173`).

## Configuration

- OAuth2 providers and datasource configuration live in `scheduler-backend/src/main/resources/application.yml`.
- To change the frontend API base URL, edit `scheduler-frontend/src/api.js` or set a Vite proxy configuration.

## Common tasks

- Lint frontend: `cd scheduler-frontend && npm run lint`
- Build frontend for production: `cd scheduler-frontend && npm run build`
- Run backend tests: `cd scheduler-backend && ./mvnw test`

## Docker / Deployment

This repo does not currently include Dockerfiles. If you want, I can add containerization for both services (multi-stage build for frontend and a JVM image for backend) and a `docker-compose.yml` to run them together.

## Notes & housekeeping

- The repository currently contains IDE files (`.idea/`, `.vscode/`) and the `scheduler-backend` folder appears as an embedded Git repository. Consider cleaning up IDE files and converting the backend to a submodule if needed.
- On Windows you may see LF/CRLF warnings. To normalize line endings: `git config core.autocrlf true`.

## Contributing

1. Open an issue describing the change.
2. Create a feature branch and open a pull request.

---

If you'd like, I can:
- add Docker configurations and a `docker-compose` file,
- remove IDE files and update `.gitignore`,
- convert the backend folder into a proper Git submodule,
- expand the README with API endpoint documentation.

Tell me which of these you'd like next.
