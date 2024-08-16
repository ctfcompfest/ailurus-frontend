FROM node:20-bookworm-slim

RUN apt update && \
    apt install -y --no-install-recommends ca-certificates bzip2 fontconfig libfontconfig && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app
COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .
RUN yarn build

ENTRYPOINT ["yarn", "start"]