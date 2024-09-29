/// <reference types="next" />
/// <reference types="next/types/global" />

declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string; // 使用する環境変数をここに追加
    }
  }
  