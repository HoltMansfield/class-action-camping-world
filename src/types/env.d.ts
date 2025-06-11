declare namespace NodeJS {
  interface ProcessEnv {
    APP_ENV?: "LOCAL" | "E2E" | "PRODUCTION" | "CI";
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
