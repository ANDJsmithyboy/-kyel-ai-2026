# GabomaGPT · Dockerfile (Go Auth+Pay)
# SmartANDJ AI Technologies · Constitution Zion Core

FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /gabomagpt-auth-pay ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /gabomagpt-auth-pay .

EXPOSE 8001
CMD ["./gabomagpt-auth-pay"]
