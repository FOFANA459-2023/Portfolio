# The contact mailer, as a portable artifact.
#
# It exists because Gmail delivery is SMTP over a raw socket, which no edge
# runtime can open, so this needs a real Node process somewhere. The image is
# deliberately boring: no build step, one dependency, and nothing in it that is
# not needed to answer a POST.

# ---- dependencies ---------------------------------------------------------
# Installed in their own stage so the final image never contains npm's cache,
# the lockfile resolution work, or anything else from the install.
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ---- runtime --------------------------------------------------------------
FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# `node` (uid 1000) ships with the base image. Running as it rather than root
# means a compromise inside the process cannot write to the image.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node index.mjs email.mjs ./

USER node
EXPOSE 8787

# Uses the process's own liveness endpoint rather than curl, which is not in
# this image and would have to be installed only to be a health check.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8787) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Node as PID 1 with `--init` supplied by the runtime, so SIGTERM reaches it
# and the container stops in a second rather than being killed after ten.
CMD ["node", "index.mjs"]
