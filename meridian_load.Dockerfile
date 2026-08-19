FROM rust:1.83-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY meridian_load ./meridian_load
RUN cd meridian_load && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/meridian_load/target/release/meridian_load /usr/local/bin/meridian_load
WORKDIR /corpus
ENTRYPOINT ["/usr/local/bin/meridian_load"]
