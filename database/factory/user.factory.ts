import { faker } from '@faker-js/faker';
import { BaseModelFactory } from './base-model.factory';

export const userFactory = () => ({
  ...BaseModelFactory(),
  accountName: faker.internet.userName(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});
