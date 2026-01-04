# Pelagica

Pelagica is an alternative web frontend for Jellyfin built using React.

## Docker Installation

The easiest way to run Pelagica is using Docker. This provides a production-ready setup with nginx web server.

### Quick Start

1. **Create a directory for Pelagica:**

    ```bash
    mkdir -p pelagica && cd pelagica
    ```

2. **Download default config files:**

    ```bash
    curl -o config.json https://raw.githubusercontent.com/KartoffelChipss/pelagica/main/public/config.json
    curl -o config.schema.json https://raw.githubusercontent.com/KartoffelChipss/pelagica/main/public/config.schema.json
    ```

3. **Run the container:**

    ```bash
    docker run -d \
      --name pelagica \
      -p 8080:80 \
      -v "$(pwd)/config.json:/usr/share/nginx/html/config.json" \
      -v "$(pwd)/config.schema.json:/usr/share/nginx/html/config.schema.json" \
      --restart unless-stopped \
      kartoffelchipss/pelagica:latest
    ```

4. **Access Pelagica:**
   Open your browser to http://localhost:8080

### Configuration

The `config.json` file in your directory controls the app's behavior. Edit it with any text editor - changes take effect immediately without restarting the container.

**Example: Set default Jellyfin server:**

```json
{
  "$schema": "./config.schema.json",
  "serverAddress": "https://jellyfin.example.com",
  ...
}
```

After editing `config.json`, refresh your browser to see the changes.

### Container Management

```bash
# View logs
docker logs -f pelagica

# Stop the container
docker stop pelagica

# Start the container
docker start pelagica

# Update to latest version
docker pull kartoffelchipss/pelagica:latest
docker stop pelagica
docker rm pelagica
# Then run the docker run command again from Quick Start
```

### Using Docker Compose

If you prefer using docker-compose, create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
    pelagica:
        image: kartoffelchipss/pelagica:latest
        container_name: pelagica
        ports:
            - '8080:80'
        volumes:
            - ./config.json:/usr/share/nginx/html/config.json
            - ./config.schema.json:/usr/share/nginx/html/config.schema.json
        restart: unless-stopped
```

Then run: `docker-compose up -d`

### Building from Source

If you want to build the Docker image from source instead of using prebuilt images:

```bash
# Clone the repository
git clone https://github.com/KartoffelChipss/pelagica.git
cd pelagica

# Build and start
docker-compose up -d --build
```

Your `config.json` in the project root will be used automatically.

## Development Setup

For local development without Docker:

1. **Install dependencies:**

    ```bash
    pnpm install
    ```

2. **Start development server:**

    ```bash
    pnpm dev
    ```

3. **Access at:** http://localhost:3000

## What does that name mean?

You might be wondering about the name "Pelagica". Since I didn't want to call it the usual *fin or jelly* names, I looked for synonyms related to the sea. "Pelagic" refers to living in the deep ocean, which felt fitting for a Jellyfin frontend.