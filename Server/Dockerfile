# Start from the official Golang base image (Alpine version for smaller size)
# "AS builder" gives this stage a name, so we can copy artifacts from it later
FROM golang:alpine AS builder

# Set the current working directory inside the container to /app
WORKDIR /app

# Copy go.mod files first to leverage Docker cache for dependencies
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod file is not changed
RUN go mod download

# Copy the rest of the source code from the current directory to the container
COPY . .

# Build the Go application
# -o server: name the output binary "server"
RUN go build -o server .

# Start a new stage from a lightweight Alpine image
# This creates a much smaller final image containing only what's needed to run the app
FROM alpine:latest

# Set the working directory in the final container
WORKDIR /app

# Copy the compiled binary from the 'builder' stage to the final image
COPY --from=builder /app/server .

# Document that the container listens on port 8080
EXPOSE 3000

# Define the command to run when the container starts
CMD ["./server"]