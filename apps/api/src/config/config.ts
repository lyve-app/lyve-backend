import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === "production"
      ? "../../../.env"
      : "../../../.env.local"
  )
});

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().port().required().default(4040),
  HOST: Joi.string().required(),
  CORS_ORIGIN: Joi.string().required().default("*"),
  RABBITMQ_URL: Joi.string().required(),
  AZURE_STORAGE_ACCOUNT_NAME: Joi.string().required(),
  AZURE_STORAGE_ACCOUNT_KEY: Joi.string().required(),
  AZURE_STORAGE_CONTAINER_NAME: Joi.string().required()
});

const { value: validatedEnv, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env, { abortEarly: false, stripUnknown: true });

if (error) {
  throw new Error(
    `Environment variable validation error: \n${error.details
      .map((detail) => detail.message)
      .join("\n")}`
  );
}

const config = {
  node_env: validatedEnv.NODE_ENV,
  app: {
    port: validatedEnv.PORT,
    host: validatedEnv.HOST
  },
  cors: {
    origin: validatedEnv.CORS_ORIGIN
  },
  rabbitmq: {
    url: validatedEnv.RABBITMQ_URL,
    queues: {
      api_server_queue: "api_server_queue",
      media_server_queue: "media_server_queue"
    },
    retryInterval: 5000
  },
  azure: {
    storage: {
      account: {
        name: validatedEnv.AZURE_STORAGE_ACCOUNT_NAME,
        key: validatedEnv.AZURE_STORAGE_ACCOUNT_KEY
      },
      container: {
        name: validatedEnv.AZURE_STORAGE_CONTAINER_NAME
      }
    }
  }
} as const;

export default config;
