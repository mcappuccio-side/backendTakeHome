import { Request } from 'express';

export type PaginateOrFilterQueryParams = {
  address?: string;
  addressPart?: string;
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  bathroomsMax?: number;
  type?: string;
  limit?: number;
  offset?: number;
};

export type PropertyInsertUpdateRequestBody = {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  type?: string;
};

export type PaginateOrFilterRequest = Request<
  {},
  {},
  {},
  PaginateOrFilterQueryParams
>;

export type PropertyUpdateRequest = Request<
  { id: string },
  {},
  PropertyInsertUpdateRequestBody,
  {}
>;

export type PropertyInsertRequest = Request<
  {},
  {},
  PropertyInsertUpdateRequestBody,
  {}
>;
