import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().default(8080),
  APP_URL: Joi.string().required(),

  DB_TYPE: Joi.string().valid('mysql', 'postgres').default('mysql'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('24h'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  VNPAY_TMN_CODE: Joi.string().required(),
  VNPAY_HASH_SECRET: Joi.string().required(),
  VNPAY_SANDBOX_URL: Joi.string().required(),
  VNPAY_RETURN_URL: Joi.string().required(),
  VNPAY_NOTIFY_URL: Joi.string().required(),

  UPLOAD_PATH: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(5242880),
});
