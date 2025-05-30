import { H } from "@highlight-run/node";

H.init({
  projectID: "ney02ovd",
  serviceName: "nextjs-server",
  environment: process.env.NODE_ENV,
});

export function withHighlightError<Args extends unknown[], R>(
  fn: (...params: Args) => Promise<R>
):
  (..._params: Args) => Promise<R> {
  return async (...params: Args): Promise<R> => {
    if (process.env.APP_ENV === "E2E") {
      return await fn(...params);
    }
    try {
      const result = await fn(...params);
      return result;
    } catch (error) {
      H.consumeError(error as Error);
      throw error;
    }
  };
}

export { H };