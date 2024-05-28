# Build stage
FROM node:20-alpine AS build

# Set the working directory to /app
WORKDIR /app

# Copy package.json and to the container
COPY ./apps/media-server/package.json  ./

RUN apk add --update && apk add \
    gcc \
    g++ \
    python3 \
    py3-pip \
    make \
    linux-headers \
    dumb-init


COPY ./apps/media-server/ .

RUN yarn install --frozen-lockfile && yarn cache clean && npm install -g typescript

# # Build the application
RUN yarn build


# Add a user named nodejs
RUN adduser -D -H nodejs

# Switch to the nodejs user
USER nodejs


ENV NODE_ENV=production
ENV PORT=4041
ENV HOST=0.0.0.0

# Expose port for the application to listen on
EXPOSE 4040

# Start the application with dumb-init
CMD ["dumb-init", "node", "dist/src/index.js"]

