# ZoBot App

## Docker Setup

This project includes Docker configuration for easy deployment.

### Prerequisites

- Docker and Docker Compose installed on your system
- Docker Hub account (for publishing the image)

### Building and Running Locally

1. Build the Docker image:

```bash
docker-compose build
```

2. Run the application locally:

```bash
docker-compose up -d
```

3. Access the application at http://localhost:80

### Publishing to Docker Hub

#### Manual Publishing

1. Log in to Docker Hub:

```bash
docker login
```

2. Build and tag the image:

```bash
docker build -t hvidigaljr/zobot-app:latest .
```

3. Push the image to Docker Hub:

```bash
docker push hvidigaljr/zobot-app:latest
```

#### Automated Publishing with GitHub Actions

This repository includes a GitHub Actions workflow that automatically builds and pushes the Docker image to Docker Hub when changes are pushed to the main branch.

To set up automated publishing:

1. Create a Docker Hub account if you don't have one already
2. Create a Docker Hub access token:
   - Go to your Docker Hub account settings
   - Click on "Security" > "New Access Token"
   - Give it a name and create the token
3. Add the following secrets to your GitHub repository:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token
4. Push changes to the main branch, and the workflow will automatically build and push the image to Docker Hub

### Deploying with Docker Swarm

1. Initialize Docker Swarm (if not already done):

```bash
docker swarm init
```

2. Deploy the stack:

```bash
docker stack deploy -c docker-compose.yml zobot
```

3. Check the status of the services:

```bash
docker stack services zobot
```

### Environment Variables

The application may require the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can add these to a `.env` file for local development, or set them in the `docker-compose.yml` file for deployment.

### Notes

- The application is configured to use Traefik as a reverse proxy with SSL termination
- The domain is set to `app.zobot.top` in the docker-compose.yml file
- The application uses the `portainer` network, which should be created externally

## Development

For local development without Docker:

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
