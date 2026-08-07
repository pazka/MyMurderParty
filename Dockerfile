# ---- build stage: install deps + build Back and Front ----
FROM node:20-slim AS build

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
RUN cp -r Back/node_modules Back/dist/node_modules

# Build Front (CI=false so CRA warnings are not errors)
RUN cd Front && npm run ci

# copy front dist to back/dist/public
RUN cp -r Front/build Back/dist/public

# ---- runtime stage: only the built app + runtime deps ----
FROM node:20-slim

# patch OS packages; drop npm (unused at runtime, ships vulnerable bundled deps)
RUN apt-get update && apt-get -y upgrade && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

# copy built back (incl. runtime node_modules + front in public/) to app
COPY --from=build /app_tmp/Back/dist/ /app/

# run server
#interactive for debbuging
#CMD ["tail", "-f", "/dev/null"]
CMD ["node", "index.js"]
