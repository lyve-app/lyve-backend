import { RewardType } from "@prisma/client";

export const rewards: {
  [Key in RewardType]: { points: number; cost: number };
} = {
  popsicle: { points: 1, cost: 1 },
  pizza: { points: 2, cost: 4 },
  gift: { points: 5, cost: 10 },
  rocket: { points: 10, cost: 20 },
  star: { points: 25, cost: 50 },
  cake: { points: 50, cost: 99 },
  crown: { points: 75, cost: 150 },
  heart: { points: 100, cost: 180 },
  bouquet: { points: 200, cost: 380 },
  lucky_cat: { points: 1000, cost: 1500 }
};
