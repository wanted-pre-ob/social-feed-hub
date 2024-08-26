import { DataSource } from 'typeorm';
import { userFactory } from '../factory/user.factory';
import { postingFactory } from '../factory/posting.factory';
import { hashtagFactory } from '../factory/hashtag.factory';
import { faker } from '@faker-js/faker';
import { PostingHashtag } from '../../src/entities/posting-hashtag.entity';
import { Posting } from '../../src/entities/posting.entity';
import { Hashtag } from '../../src/entities/hashtag.entity';

export default async (dataSource: DataSource): Promise<number[]> => {
  return dataSource.transaction(async (manager) => {
    const userSeeds = Array(+process.argv[2]).fill(0).map(userFactory);
    const userResults = await manager.getRepository('User').save(userSeeds);

    const postingSeeds = Array(+process.argv[2]).fill(0).map(postingFactory);
    const postingResults = await manager.getRepository('Posting').save(postingSeeds);

    const hashtagSeeds = [
      ...Array(+process.argv[2]).fill(null).map(hashtagFactory),
      ...userResults.map((user) => {
        return hashtagFactory(user.accountName);
      }),
    ];

    const hashtagResults = await manager.getRepository('Hashtag').save(hashtagSeeds.flat());

    // posting, hashtag 모두 한 번씩 쓰이고 나머지는 랜덤으로 관계를 맺도록 함
    const postingHashtagSeeds = createPostingHashtagSeeds(postingResults as Posting[], hashtagResults as Hashtag[]);

    const postingHashtagResults = await manager.getRepository('PostingHashtag').save(postingHashtagSeeds);

    // 생성된 데이터의 개수를 반환
    return [userResults.length, postingResults.length, hashtagResults.length, postingHashtagResults.length];
  });
};

function createPostingHashtagSeeds(postings: Posting[], hashtags: Hashtag[]) {
  const postingHashtags: Partial<PostingHashtag>[] = [];
  const usedPostings = new Set<string>();
  const usedHashtags = new Set<string>();

  // 모든 Posting에 대해 처리
  postings.forEach((posting) => {
    const hashtagCount = faker.number.int({ min: 2, max: 10 });
    const selectedHashtags = faker.helpers.arrayElements(hashtags, hashtagCount);

    selectedHashtags.forEach((hashtag: Hashtag) => {
      postingHashtags.push({
        postingId: posting.id,
        hashtagId: hashtag.id,
      });

      usedPostings.add(posting.id);
      usedHashtags.add(hashtag.id);
    });
  });

  // 사용되지 않은 Posting과 Hashtag 처리
  postings.forEach((posting) => {
    if (!usedPostings.has(posting.id)) {
      const hashtag = faker.helpers.arrayElement(hashtags);
      postingHashtags.push({
        postingId: posting.id,
        hashtagId: hashtag.id,
      });
      usedPostings.add(posting.id);
      usedHashtags.add(hashtag.id);
    }
  });

  hashtags.forEach((hashtag) => {
    if (!usedHashtags.has(hashtag.id)) {
      const posting = faker.helpers.arrayElement(postings);
      postingHashtags.push({
        postingId: posting.id,
        hashtagId: hashtag.id,
      });
      usedHashtags.add(hashtag.id);
    }
  });

  return postingHashtags;
}
