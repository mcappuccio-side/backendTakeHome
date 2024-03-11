import AppDataSource from '../dataSource';
import { Property } from '../entities';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  And,
  Like
} from 'typeorm';
import {
  PaginateOrFilterQueryParams,
  PropertyInsertUpdateRequestBody
} from '../utility/types';

export class PropertyService {
  private propertyRepository: Repository<Property>;

  constructor() {
    this.propertyRepository = AppDataSource.getRepository(Property);
  }

  async queryAll() {
    const results: Property[] = await this.propertyRepository.find();
    return results;
  }

  async queryMany(params: PaginateOrFilterQueryParams) {
    const results: [Property[], number] =
      await this.propertyRepository.findAndCount({
        where: {
          ...(params.address && { address: params.address }),
          ...(params.addressPart && {
            address: Like('%' + params.addressPart + '%')
          }),
          ...(params.type && { type: params.type }),
          // Need to combine priceRow if both priceMin and priceMax are entered
          ...(params.priceMin &&
            params.priceMax && {
              price: And(
                MoreThanOrEqual(params.priceMin),
                LessThanOrEqual(params.priceMax)
              )
            }),
          // Singular price filter if min or max is exclusively entered
          ...(params.priceMax &&
            !params.priceMin && { price: LessThanOrEqual(params.priceMax) }),
          ...(params.priceMin &&
            !params.priceMax && { price: MoreThanOrEqual(params.priceMin) }),
          // Need to combine bedroomsRow if both bedroomMin and bedroomMax are entered
          ...(params.bedroomsMin &&
            params.bedroomsMax && {
              bedrooms: And(
                MoreThanOrEqual(params.bedroomsMin),
                LessThanOrEqual(params.bedroomsMax)
              )
            }),
          // Singular bedrooms filter if min or max is exclusively entered
          ...(params.bedroomsMax &&
            !params.bedroomsMin && {
              bedrooms: LessThanOrEqual(params.bedroomsMax)
            }),
          ...(params.bedroomsMin &&
            !params.bedroomsMax && {
              bedrooms: MoreThanOrEqual(params.bedroomsMin)
            }),
          // Need to combbine bathrooms row if bathroomsMin and bathroomsMax are entered
          ...(params.bathroomsMin &&
            params.bathroomsMax && {
              bathrooms: And(
                MoreThanOrEqual(params.bathroomsMin),
                LessThanOrEqual(params.bathroomsMax)
              )
            }),
          // Singular bathrooms filter if min or max is exclusively entered
          ...(params.bathroomsMax &&
            !params.bathroomsMin && {
              bathrooms: LessThanOrEqual(params.bathroomsMax)
            }),
          ...(params.bathroomsMin &&
            !params.bathroomsMax && {
              bathrooms: MoreThanOrEqual(params.bathroomsMin)
            })
        },
        take: params.limit,
        skip: params.offset
      });
    return results;
  }

  async queryById(id: number) {
    const result = await this.propertyRepository.findOneBy({
      id: id
    });
    return result;
  }

  async createProperty(params: PropertyInsertUpdateRequestBody) {
    const propertyToCreate = this.propertyRepository.create(params);

    const result = await this.propertyRepository.save(propertyToCreate);
    return result;
  }

  async updateProperty(id: number, params: PropertyInsertUpdateRequestBody) {
    const propertyToUpdate = await this.propertyRepository.findOneBy({
      id: id
    });
    if (propertyToUpdate) {
      propertyToUpdate.address = params.address;
      propertyToUpdate.price = params.price;
      propertyToUpdate.bedrooms = params.bedrooms;
      propertyToUpdate.bathrooms = params.bathrooms;
      propertyToUpdate.type = params.type ? params.type : null;

      const result = await this.propertyRepository.save(propertyToUpdate);
      return result;
    }
    return null;
  }

  async deleteProperty(id: number) {
    const result = await this.propertyRepository.delete({
      id: id
    });
    return result;
  }
}
