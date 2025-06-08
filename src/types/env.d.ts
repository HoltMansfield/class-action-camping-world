// This file extends the type definition for process.env.NODE_ENV to include 'e2e'.
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test" | "e2e" | "ci";
    APP_ENV?: "LOCAL" | "E2E" | "PRODUCTION";
    PORT?: string;
    DB_URL?: string;
    MIGRATIONS_PATH?: string;
    RESEND_API_KEY?: string;
    HIGHLIGHT_API_KEY?: string;
    E2E_URL?: string;
    DEBUG?: string;
    LOG_LEVEL?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  }
}
