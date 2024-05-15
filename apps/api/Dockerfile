# Build stage
FROM node:20-alpine AS build

# Set the working directory to /app
WORKDIR /app

# Copy package.json and to the container
COPY ./apps/api/package.json  ./

RUN cat ./package.json
RUN pwd && ls

# Install development dependencies
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    g++ \
    python3 \
    && yarn install --frozen-lockfile --production=false \
    && apk del .build-deps \
    && yarn cache clean

# Copy the rest of the application code to the container
COPY ./apps/api/ .


# Generate prisma client
RUN yarn prisma generate

# Build the application
RUN yarn build

# Run stage
FROM node:20-alpine AS run

# Set the working directory to /app
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY ./apps/api/package.json ./

RUN cat ./package.json
RUN pwd && ls

# Install dumb-init
RUN apk add --no-cache dumb-init

# Add a non-root user to run the application
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001 \
    && chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Install production dependencies
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Copy the built application code from the build stage
COPY --chown=nodejs:nodejs --from=build /app/dist ./dist

# Copy the prisma directory from the build stage
COPY --chown=nodejs:nodejs --from=build /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=4040
ENV HOST=0.0.0.0

# Generate prisma client
RUN yarn prisma generate

RUN pwd && ls

# Expose port for the application to listen on
EXPOSE 4040

# Start the application with dumb-init
CMD ["dumb-init", "node", "index.js"]