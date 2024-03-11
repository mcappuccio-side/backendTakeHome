import request from 'supertest';
import app from '../../app';
import AppDataSource, { seedDb } from '../../dataSource';
import { PropertyService } from '../../services/PropertyService';

const createBody = {
  address: '19 Tower Parkway-TEST',
  price: 12345.67,
  bedrooms: 200,
  bathrooms: 100,
  type: 'MultiFamilyTEST'
};

describe('propertyRoutes', () => {
  const propertyService = new PropertyService();
  beforeAll(async () => {
    await AppDataSource.initialize();
    await seedDb();
  });

  describe('GET /properties', () => {
    it('should return all properties', async () => {
      const { body, statusCode } = await request(app).get('/properties');

      expect(statusCode).toBe(200);
      expect(body.data.length).toBe(126);
      expect(body.count).toBe(126);
    });

    it('should return pagination style with limit/offset', async () => {
      // relying on assumption of seed data containing ids 1-126
      const { body, statusCode } = await request(app)
        .get('/properties')
        .query({ limit: 12, offset: 10 });

      expect(statusCode).toBe(200);
      expect(body.data.length).toBe(12);
      expect(body.data[0].id).toBe(11);
      expect(body.data[11].id).toBe(22);
    });

    it('should filter with query params', async () => {
      // Insert new property to validate known resource
      const newProperty = await propertyService.createProperty(createBody);

      const { body, statusCode } = await request(app).get('/properties').query({
        address: createBody.address,
        bathroomsMin: createBody.bathrooms,
        bathroomsMax: createBody.bathrooms,
        bedroomsMin: createBody.bedrooms,
        bedroomsMax: createBody.bedrooms,
        priceMin: createBody.price,
        priceMax: createBody.price,
        type: createBody.type
      });

      expect(statusCode).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.count).toBe(1);
      expect(body.data[0]).toStrictEqual({
        id: newProperty.id,
        ...createBody
      });
    });

    describe('Validations - GET /properties', () => {
      it('should return a 404 for limit without offset', async () => {
        await request(app).get('/properties').query({ limit: 10 }).expect(400);
      });

      it('should return a 404 for offset without limit', async () => {
        await request(app).get('/properties').query({ offset: 10 }).expect(400);
      });
    });
  });

  describe('GET /properties/:id', () => {
    it('should return a 404 for an unknown property id', async () => {
      await request(app).get('/properties/1000').expect(404);
    });

    it('should return a payload for an existing property id', async () => {
      // Insert new property to validate known resource
      const newProperty = await propertyService.createProperty(createBody);
      const { body, statusCode } = await request(app).get(
        `/properties/${newProperty.id}`
      );

      expect(statusCode).toBe(200);
      expect(body.data).toStrictEqual({ id: newProperty.id, ...createBody });
    });
  });

  describe('POST /properties/', () => {
    it('should be created', async () => {
      const { body, statusCode } = await request(app)
        .post('/properties/')
        .send(createBody);

      expect(statusCode).toBe(201);
      expect(body.data).toStrictEqual({ id: body.data.id, ...createBody });
    });

    describe('Validations for POST /properties/', () => {
      it('should return a 400 for invalid query - ', async () => {
        await request(app)
          .post('/properties')
          .send({
            address: createBody.address,
            price: 'iamastring',
            bedrooms: createBody.bedrooms,
            bathrooms: createBody.bathrooms,
            type: createBody.type
          })
          .expect(400);
      });
    });
  });

  describe('PUT /properties/:id', () => {
    it('should return a 404 for an unknown property id', async () => {
      await request(app).put('/properties/2000').send(createBody).expect(404);
    });

    it('should be updated for an existing property', async () => {
      // Insert new property to validate known resource
      const newProperty = await propertyService.createProperty(createBody);
      const { body, statusCode } = await request(app)
        .put(`/properties/${newProperty.id}`)
        .send({
          address: 'updatedAddress',
          bathrooms: createBody.bathrooms,
          bedrooms: createBody.bedrooms,
          price: createBody.price,
          type: createBody.type
        });

      expect(statusCode).toBe(200);
      expect(body.data.address).toBe('updatedAddress');
    });

    describe('Validations for PUT /properties/:id', () => {
      it('should return a 400 for invalid price - string', async () => {
        const { body, statusCode } = await request(app)
          .put('/properties/1')
          .send({
            address: createBody.address,
            price: 'iamastring',
            bedrooms: createBody.bedrooms,
            bathrooms: createBody.bathrooms,
            type: createBody.type
          })
          .expect(400);
      });

      it('should return a 400 for invalid price - too precise', async () => {
        const { body, statusCode } = await request(app)
          .put('/properties/1')
          .send({
            address: createBody.address,
            price: 10000.123,
            bedrooms: createBody.bedrooms,
            bathrooms: createBody.bathrooms,
            type: createBody.type
          })
          .expect(400);
      });

      it('should return a 400 for invalid bedrooms - negative', async () => {
        const { body, statusCode } = await request(app)
          .put('/properties/1')
          .send({
            address: createBody.address,
            price: 100000,
            bedrooms: -3,
            bathrooms: createBody.bathrooms,
            type: createBody.type
          })
          .expect(400);
      });

      it('should return a 400 for missing bathrooms', async () => {
        const { body, statusCode } = await request(app)
          .put('/properties/1')
          .send({
            address: createBody.address,
            price: 100000,
            bedrooms: -3,
            type: createBody.type
          })
          .expect(400);
      });
    });
  });

  describe('DELETE /properties/:id', () => {
    it('should return a 404 for an unknown property id', async () => {
      await request(app).delete('/properties/2000').expect(404);
    });

    it('should be deleted for an existing property id', async () => {
      // Insert new property to validate known resource
      const newProperty = await propertyService.createProperty(createBody);
      const { body, statusCode } = await request(app)
        .delete(`/properties/${newProperty.id}`)
        .expect(204);
    });

    describe('Validations - DELETE /properties/:id', () => {
      it('should return a 400 for invalid id format - string', async () => {
        await request(app).delete('/properties/iamastring').expect(400);
      });

      it('should return a 400 for invalid id format - negative', async () => {
        await request(app).delete('/properties/-120').expect(400);
      });

      it('should return a 400 for invalid id format - decimal', async () => {
        await request(app).delete('/properties/120.123').expect(400);
      });
    });
  });
});

describe('allOtherRoutes', () => {
  it('should display text', async () => {
    const response = await request(app).get('/');
    expect(response.text).toBe('Visit "/properties" to load properties');
  });
});
