# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリを作成
WORKDIR /app

# 依存パッケージのコピーとインストール
COPY package.json yarn.lock ./
RUN yarn install

# アプリケーションのファイルをすべてコピー
COPY . .

# ビルド
RUN yarn build

# Next.js アプリケーションを起動
CMD ["yarn", "start"]
