import { RewardType } from "@prisma/client";

export const rewards: { [Key in RewardType]: { points: number } } = {
  popsicle: { points: 1 },
  pizza: { points: 2 },
  gift: { points: 5 },
  rocket: { points: 10 },
  star: { points: 20 },
  cake: { points: 35 },
  crown: { points: 50 },
  heart: { points: 75 },
  bouquet: { points: 100 },
  lucky_cat: { points: 200 }
};
