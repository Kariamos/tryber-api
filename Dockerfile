FROM alpine:3.16 as base

RUN apk add nodejs npm
COPY package*.json ./
ARG NPM_TOKEN  
RUN echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc
RUN npm install

COPY . .

RUN npm i -g npm-run-all
RUN npm run build

FROM alpine:3.16 as web

COPY --from=base /dist /app/build
COPY package*.json /app/
COPY --from=base /src/routes /app/src/routes
COPY --from=base /.git/HEAD /app/.git/HEAD
COPY --from=base /.git/refs /app/.git/refs
WORKDIR /app
RUN apk add nodejs npm openssl
ARG NPM_TOKEN  
RUN echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc
RUN npm install --only=prod
CMD node build/index.js