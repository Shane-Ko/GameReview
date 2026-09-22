# --- build stage: React 앱 빌드 ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig*.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

RUN yarn build

# --- runtime stage: 정적 파일 + json-server ---
FROM node:22-alpine

WORKDIR /app

# 런타임에는 json-server 만 있으면 된다.
RUN yarn add json-server@0.17.4 && yarn cache clean

COPY --from=build /app/dist ./dist
COPY server.js ./

# db.json 은 씨앗으로만 넣는다. 런타임 데이터는 PVC 의 /data/db.json.
COPY db.json ./seed/db.json

EXPOSE 3000

CMD ["node", "server.js"]
