import express from 'express';
import bodyParser from 'body-parser';
import { PropertyService } from '../services/PropertyService';
import {
  PaginateOrFilterRequest,
  PropertyInsertRequest,
  PropertyUpdateRequest
} from '../utility/types';
import {
  idSchema,
  paginateFilterSchema,
  insertUpdateSchema
} from '../utility/validation';

export const propertyRoutes = express.Router();

const propertyService = new PropertyService();

propertyRoutes.use(bodyParser.json());

// Get All Properties:
// Supports Pagination with Limit/Offset
// Supported filters defined in type PaginateOrFilterQueryParams
propertyRoutes.get('/', async (req: PaginateOrFilterRequest, res) => {
  const params = req.query;

  // Validate params
  const { _, error } = paginateFilterSchema.validate(params);
  if (error) {
    res.status(400).send({ error: error });
  } else {
    const [results, count] = await propertyService.queryMany(params);
    res.send({ data: results, count: count });
    // Since we're not querying a specific resource, empty results is allowed
  }
});

// Get Property by ID
propertyRoutes.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate Param
  const { _, error } = idSchema.validate(id);
  if (error) {
    res.status(400).send({ error: error });
  } else {
    const result = await propertyService.queryById(parseInt(id));
    if (result) {
      res.send({ data: result });
    } else {
      res.status(404).send({ error: 'Resource not found.' });
    }
  }
});

// Create Property
propertyRoutes.post('/', async (req: PropertyInsertRequest, res) => {
  // const {address, price, bedrooms, bathrooms, type} = req.body;
  const { _, error } = insertUpdateSchema.validate(req.body);
  if (error) {
    res.status(400).send({ error: error });
  } else {
    const result = await propertyService.createProperty(req.body);
    res.status(201).send({ data: result });
  }
});

// Update Property by Id
propertyRoutes.put('/:id', async (req: PropertyUpdateRequest, res) => {
  const { id } = req.params;

  // Validate Params
  const idValidate = idSchema.validate(id);
  const updateValidate = insertUpdateSchema.validate(req.body);

  if (idValidate.error) {
    res.status(400).send({ error: idValidate.error });
  } else if (updateValidate.error) {
    res.status(400).send({ error: updateValidate.error });
  } else {
    const result = await propertyService.updateProperty(parseInt(id), req.body);
    if (result) {
      res.status(200).send({ data: result });
    } else {
      res.status(404).send({ error: 'Resource not found.' });
    }
  }
});

// Delete Property by Id
propertyRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate Param
  const { _, error } = idSchema.validate(id);
  if (error) {
    res.status(400).send({ error: error });
  } else {
    const result = await propertyService.deleteProperty(parseInt(id));
    if (result.affected && result.affected > 0) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: 'Resource not found.' });
    }
  }
});
