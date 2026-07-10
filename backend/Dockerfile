FROM node:24-bookworm-slim

RUN useradd -ms /bin/sh -u 1001 app

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

USER app

COPY --chown=app:app . /app

CMD ["node", "index.js"]