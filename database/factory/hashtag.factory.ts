import { faker } from '@faker-js/faker';
import { BaseModelFactory } from './base-model.factory';

export const hashtagFactory = (name?: string) => ({
  ...BaseModelFactory(),
  name: name ?? faker.string.alphanumeric({ length: { min: 10, max: 40 } }),
});
