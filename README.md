Please read the PLEASE_READ_FIRST.md first. ✅

Please document your code & design decisions here.

# Side Backend Engineer Interview Assessment#

Completed by Michael Cappuccio as part of benchmark for future candidacy

## Goal

Rest API using Nodejs and SQLite to manage a property list complete with input validation, filtering, pagination, and meaningful tests.

### CRUD Operations

Routes defined in /src/routes/propertyRoutes.ts support:

- Create a single, new property
- Update a single property by Id
- Delete a single property by Id
- Find a single property by Id
- Find many properties (supports pagination and filtering)

### Filtering

`GET /properties` supports the following query parameters:

- address: exact match for `address`
- addressPart: partial match for `address`
- priceMin, priceMax: min and max values (inclusive) for `price`
- bathroomsMin, bathroomsMax: min and max values (inclusive) for `bathrooms`
- bedroomsMin, bedroomsMax: min and max values (inclusive) for `bedrooms`
- type: exact match for `type`

### Pagination

`GET /properties` supports pagination using LIMIT/OFFSET as query parameters:

- Limit: number of records to return (if existing)
- Offset: number of initial records to skip when querying records

### Request Validation

Leveraging Joi for validation.

Joi schemas defined in `src/utility/validation.ts`

- `id` is validated as part of the request parameters where applicable
- `GET /properties` has the request body validated for supported filter options as well as pagination.
- Insert and Update api's have the request body validated against Property fields

### Tests

End-to-end tests validating expected results from request to database are implemented.

Tests displaying the functionality of the Joi validations are demonstrated but not exhaustive.

### Future Considerations

- Moving input validation to middleware function
- Making Property.Type an enum and validate against it
