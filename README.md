<p align="center">
    <img src="./docs/logo.png" width="200">
</p>

# Ailurus Frontend
Ailurus frontend is a frontend for the Ailurus Platform. It consists of team dashboard and admin panel. Ailurus frontend is build using [Next.js](https://nextjs.org/), so it is easy to customize if needed.

Check the repository [ctfcompfest/ailurus-backend](https://github.com/ctfcompfest/ailurus-backend) for the backend service.

## Features
1. Public leaderboard
2. Attack map
3. Team dashboard
4. Admin panel:
    - Challenge management
    - Team management
    - Contest configuration panel
    - Submission logs
    - Checker logs
    - and a lot more...

## Deployment

1. Update `.env` file to match your configuration.
    - `NEXT_PUBLIC_API_BASEURL`: Base URL for Ailurus backend api endpoints.
    - `NEXT_PUBLIC_API_SOCKET`: Base URL for Ailurus socket.io backend. Normally it equals to your hostname for the backend service.
    - `NEXT_PUBLIC_API_HOSTNAME`: Hostname the frontend will be deployed to.
    - `NEXT_PUBLIC_API_SERVICE_MANAGE_PANEL`: It has two possible value: `fullserver` or `patch`.
2. After that you can follow deployment steps from the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying). Choose deployment method that supports dynamic routing, such as Node.js server or docker container method.
3. To access admin page, visit `/admin` endpoint.

## Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.