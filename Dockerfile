# ---- build stage: install deps + build Back and Front ----
FROM node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS build

WORKDIR /app_tmp

# install Back dependencies from lockfile
COPY Back/package.json Back/package-lock.json ./Back/
RUN cd Back && npm ci

# install Front dependencies from lockfile
COPY Front/package.json Front/package-lock.json ./Front/
RUN cd Front && npm ci --legacy-peer-deps

# Bundle app source
COPY Front ./Front
COPY Back ./Back

# Build Back
RUN cd Back && npm run build
# runtime gets production dependencies only (cross-env, typescript stay in the build stage)
RUN cd Back && npm prune --omit=dev && cp -r node_modules dist/node_modules

# Build Front (tsc type check, then vite build into Front/build)
RUN cd Front && npm run ci

# copy front dist to back/dist/public
RUN cp -r Front/build Back/dist/public

# ---- runtime stage: only the built app + runtime deps ----
FROM node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072

# patch OS packages; drop npm (unused at runtime, ships vulnerable bundled deps)
RUN apt-get update && apt-get -y upgrade && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

# copy built back (incl. runtime node_modules + front in public/) to app
COPY --from=build /app_tmp/Back/dist/ /app/

# health: GET /healthz on the configured port (ENV + PORT; legacy compose = :80, hosh-deploy compose = :8000).
# No curl in the image: node checks it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["node", "/app/ops/healthcheck.js"]

# run server (listens on PORT if set, else 80 in PROD; runs as any uid: nothing is written to disk)
#interactive for debbuging
#CMD ["tail", "-f", "/dev/null"]
CMD ["node", "index.js"]
