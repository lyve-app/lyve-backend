export {};

declare global {
  namespace Express {}
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
    };
  }
}
