declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NODE_ENV: "production" | "development" | "test";
    readonly PORT: string;
    readonly CORS_ORIGIN: string;
  }
}
