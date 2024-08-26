import { faker } from '@faker-js/faker';
import { BaseModelFactory } from './base-model.factory';
import { SocialNetworkType } from '../../src/entities/posting.entity';

export const postingFactory = () => ({
  ...BaseModelFactory(),
  contentId: faker.string.alpha({ length: { min: 4, max: 255 } }),
  type: faker.helpers.enumValue(SocialNetworkType),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraph(),
  writer: faker.person.fullName(),
  viewCount: faker.number.int({ min: 0, max: 10000 }),
  likeCount: faker.number.int({ min: 0, max: 10000 }),
  shareCount: faker.number.int({ min: 0, max: 10000 }),
});
