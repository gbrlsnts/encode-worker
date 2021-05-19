import * as Joi from '@hapi/joi';

const requiredString = Joi.string().required().min(1);

export const configSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production'),
  APP_PORT: Joi.number().default(3000),
  REDIS_HOST: requiredString,
  REDIS_PORT: Joi.number().default(6379),
  REDIS_DB: Joi.number().default(0),
  LOCAL_REDIS_HOST: requiredString,
  LOCAL_REDIS_PORT: Joi.number().default(6379),
  LOCAL_REDIS_DB: Joi.number().default(0),
  QUEUE_PREFIX: Joi.string().min(1).default('bull'),
  STORAGE_ENDPOINT: Joi.string().min(1),
  STORAGE_BUCKET: Joi.string().min(1),
  STORAGE_KEY: Joi.string().min(1),
  STORAGE_SECRET: Joi.string().min(1),
  DOWNLOADED_FOLDER: Joi.string().min(1),
});
