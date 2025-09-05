# CeesarCode Production Dockerfile
# Compatible with Linux, macOS (via Docker Desktop), and Windows (via Docker Desktop)

FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Go
ENV GO_VERSION=1.21.5
RUN curl -fsSL https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz | tar -C /usr/local -xzf -
ENV PATH=$PATH:/usr/local/go/bin

# Install Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Python ML libraries
RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip3 install --break-system-packages pandas numpy scikit-learn matplotlib

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Build Rust executor
RUN cd executor-rs && cargo build --release

# Build Go backend
RUN cd backend && go mod tidy && go build -o ../bin/server ./cmd/server

# Build React frontend
RUN cd frontend && npm install && npm run build

# Create production directory
RUN mkdir -p /app/dist && \
    cp -r frontend/dist/* /app/dist/ && \
    cp bin/server /app/dist/ && \
    cp -r executor-rs/target/release /app/dist/ && \
    cp -r data /app/dist/

# Expose port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV GO_ENV=production

# Run the application
CMD ["./dist/server"]
