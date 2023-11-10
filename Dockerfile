FROM node:20-alpine

# Create app directory

WORKDIR /app_tmp

# copy Back/package.json

COPY Back/package.json ./Back/package.json

# Install app dependencies

RUN cd Back && npm install

# copy Front/package.json

COPY Front/package.json ./Front/package.json

# Install app dependencies

RUN cd Front && npm install --legacy-peer-deps

# Bundle app source

COPY Front ./Front
COPY Back ./Back

# Build Back

RUN cd Back && npm run build
RUN cp -r Back/node_modules Back/dist/node_modules

# Build Front

RUN cd Front && npm run build

# copy front dist to back/dist/public

RUN cp -r Front/build Back/dist/public

WORKDIR /app

# copy tmp back dist to app

RUN cp -r /app_tmp/Back/dist/* /app

# run server
#interactive for debbuging 
#CMD ["tail", "-f", "/dev/null"]
CMD ["node", "index.js"]


