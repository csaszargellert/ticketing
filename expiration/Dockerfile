FROM node:21-alpine as dependencies
WORKDIR /app
COPY ./package*.json ./
RUN npm install

FROM node:21-alpine as builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build \
&& rm -rf node_modules \
&& npm ci --omit=dev

FROM node:21-alpine as runner
ENV NODE_ENV production
WORKDIR /app
RUN chown node:node ./
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]