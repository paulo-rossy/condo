FROM buildpack-deps:buster AS base

COPY --from=python:3.8-buster /usr/local/ /usr/local/
COPY --from=node:16-buster /usr/local/ /usr/local/
COPY --from=node:16-buster /opt/ /opt/

# Add app user/group! Clean packages and fix links! Check version! And install some extra packages!
RUN set -ex \
	&& groupadd -r app --gid=999 \
	&& useradd --system --create-home --home /app --gid 999 --uid=999 --shell /bin/bash app \
	&& rm -f /usr/local/bin/docker-entrypoint.sh \
	&& python --version \
	&& pip --version \
	&& node --version \
	&& yarn --version \
	&& python3 -m pip install 'psycopg2-binary==2.9.4' && python3 -m pip install 'Django==4.1.2' \
    && echo "OK"

# Installer
FROM base AS installer

USER app:app
WORKDIR /app
# Copy pruned monorepo (only package.json + yarn.lock)
COPY --chown=app:app ./out /app
# Copy yarn berry
COPY --chown=app:app ./.yarn/releases /app/.yarn/releases
COPY --chown=app:app ./.yarn/plugins /app/.yarn/plugins
COPY --chown=app:app ./.yarn/patches /app/.yarn/patches
COPY --chown=app:app ./.yarnrc.yml /app/.yarnrc.yml
RUN --mount=type=cache,target=/root/.yarn/cache YARN_CACHE_FOLDER=/root/.yarn/cache yarn install --immutable

# Builder
FROM base as builder
USER app:app
WORKDIR /app
# Copy entire repo
COPY --chown=app:app . /app
# Copy previously installed packages
COPY --from=installer --chown=app:app /app /app

RUN echo "# Build time .env config!" >> /app/.env && \
	echo "COOKIE_SECRET=undefined" >> /app/.env && \
	echo "DATABASE_URL=undefined" >> /app/.env && \
	echo "REDIS_URL=undefined" >> /app/.env && \
	echo "FILE_FIELD_ADAPTER=local" >> /app/.env && \
	echo "NEXT_TELEMETRY_DISABLED=1" >> /app/.env && \
	echo "NODE_ENV=production" >> /app/.env

RUN set -ex \
    && yarn build \
    && rm -rf /app/.env  \
    && rm -rf /app/.config /app/.cache /app/.docker  \
    && ls -lah /app/

# Runtime container
FROM base
USER app:app
WORKDIR /app
COPY --from=builder --chown=app:app /app /app
