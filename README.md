![lyve logo](https://raw.githubusercontent.com/lyve-app/lyve-backend/main/assets/lyve_logo.svg)

## About the Project

> This is the backend codebase of the lyve platform

Lyve is a livestreaming platform where users can create and watch livestreams. Viewers can engage with streamers through chat and by sending rewards, fostering a lively and interactive community. Lyve enhances the experience with gamification, offering achievements and promotion points that help streamers gain more visibility on the platform.

### Techstack

#### API

[![API Technologies](https://skillicons.dev/icons?i=ts,express,nodejs,prisma,postgres,jest,rabbitmq,azure,githubactions,docker)](https://skillicons.dev)

- Socketio

Hosted on a Azure App Service

#### Media-Server

[![Media-Server Technologies](https://skillicons.dev/icons?i=ts,express,nodejs,rabbitmq,azure,docker)](https://skillicons.dev)

- Mediasoup

Hosted on a Azure VPS

## Structure

This codebase is a yarn workspace monorepo.

There are two backends in this repo [api](https://github.com/lyve-app/lyve-backend/tree/main/apps/api) and [media-server](https://github.com/lyve-app/lyve-backend/tree/main/apps/media-server), both can be found in the `/apps` directory

```txt
.
├── README.md
├── apps
│   ├── api
│   │   ├── Dockerfile
│   │   ├── jest.config.ts
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   └── schema.prisma
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── config
│   │   │   ├── controller
│   │   │   ├── index.ts
│   │   │   ├── interfaces
│   │   │   ├── middleware
│   │   │   ├── routes
│   │   │   ├── service
│   │   │   ├── types
│   │   │   ├── utils
│   │   │   └── validations
│   │   ├── test
│   │   │   ├── integration
│   │   │   └── unit
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.spec.json
│   │   ├── web.config
│   │   └── yarn.lock
│   └── media-server
│       ├── Dockerfile
│       ├── jest.config.ts
│       ├── package.json
│       ├── src
│       │   ├── app.ts
│       │   ├── config
│       │   ├── index.ts
│       │   ├── middleware
│       │   ├── types
│       │   └── utils
│       ├── test
│       ├── tsconfig.app.json
│       ├── tsconfig.json
│       ├── tsconfig.spec.json
│       ├── web.config
│       └── yarn.lock
├── commitlint.config.js
├── docker-compose.yml
├── package.json
└── yarn.lock
```

## Database

![ERD](assets/prisma-erd.svg)

## Contributing

<a href="https://github.com/orgs/lyve-app/lyve-backend/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=lyve-app/lyve-backend" />
</a>
