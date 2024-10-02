# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリを作成
WORKDIR /app

# 依存パッケージのインストール
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションのファイルをすべてコピー
COPY . .

# ビルド
ARG NEXT_PUBLIC_API_URL
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

# Next.js アプリケーションを起動
CMD ["npm", "start"]
