const Joi = require('joi');

export const idSchema = Joi.number().integer().positive().required();

export const paginateFilterSchema = Joi.object({
  address: Joi.string(),
  addressPart: Joi.string(),
  priceMin: Joi.number().precision(2).positive(),
  priceMax: Joi.number().precision(2).positive(),
  bedroomsMin: Joi.number().integer().positive(),
  bedroomsMax: Joi.number().integer().positive(),
  bathroomsMin: Joi.number().integer().positive(),
  bathroomsMax: Joi.number().integer().positive(),
  limit: Joi.number().integer().positive(),
  offset: Joi.number().integer().positive().allow(0),
  type: Joi.string()
}).and('limit', 'offset');

export const insertUpdateSchema = Joi.object({
  address: Joi.string().required(),
  price: Joi.number().precision(2).positive().required().strict(),
  bedrooms: Joi.number().integer().positive().required(),
  bathrooms: Joi.number().integer().positive().required(),
  type: Joi.string()
});
