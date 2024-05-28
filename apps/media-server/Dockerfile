# Build stage
FROM node:20-buster

# Set the working directory to /app
WORKDIR /app

# Copy package.json and to the container
COPY ./apps/media-server/package.json  ./


RUN apt-get update && apt-get install -y python3-pip

RUN yarn install

# Copy the rest of the application code to the container
COPY ./apps/media-server/ .

# Build the application
RUN yarn build


# Start the application with dumb-init
CMD ["node", "dist/src/index.js"]