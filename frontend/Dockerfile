FROM node:24-bookworm-slim
RUN useradd -ms /bin/sh -u 1001 app
WORKDIR /app
RUN chown app:app /app
COPY --chown=app:app package.json package-lock.json ./
USER app
RUN npm install
COPY --chown=app:app . /app