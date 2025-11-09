# Tutoring Platform — Dockerized Full-Stack Starter

This repository is a starter for an interactive tutoring platform (clean and minimal).
It includes Docker Compose (Postgres + server + client), a Node/Express backend, and a React/Vite frontend.

## Quick start

1. Copy `server/.env.example` to `server/.env` and set secrets.
2. Build and run via Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Create database schema:
   ```bash
   # If psql available locally:
   psql -h localhost -U postgres -d tutoringdb -f server/db/schema.sql
   ```
4. Open the client at http://localhost:5173 and server at http://localhost:4000

## Notes

- The repo contains an email stub (replace with SendGrid or similar).
- CSV import endpoint exists; it currently imports using raw SQL. For production, use hashed-password import (I can implement).
- Files under server and client are minimal examples to get started.
