FROM node:20-alpine

ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3006
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3006"]
