import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Stock } from "@prisma/client";

export type { Transaction } from "@prisma/client";

export function getStock({
  userId,
  artistId,
}: {
  userId: User["id"];
  artistId: any;
}) {
  return prisma.stock.findFirst({
    where: { userId, artistId },
  });
}

export function getTransactions({ userId }: { userId: User["id"] }) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export function getStockListItems({ userId }: { userId: User["id"] }) {
  return prisma.stock.findMany({
    where: { userId },
    orderBy: { artistName: "asc" },
  });
}

export async function doBuy(
  userId: User["id"],
  amount: any,
  artistId: any,
  artistName: any,
  count: any
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const newCredits = Math.round(user.credits + Number(amount) * Number(count));
  if (newCredits < 0) throw new Error("Not enough credits");
  const transactionFollowers = Math.round(
    Number(amount) * Number(count) * 1000 * -1
  );
  const endFollowers = user.followers + Number(transactionFollowers);
  return prisma.user
    .update({
      where: { id: userId },
      data: { credits: newCredits, followers: endFollowers },
    })
    .then(() => {
      return prisma.stock.upsert({
        where: { artistId },
        update: {
          count: {
            increment: count,
          },
        },
        create: { userId, artistId, artistName, count: count },
      });
    })
    .then(() => {
      return prisma.transaction.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          endFollowers,
        },
      });
    });
}

export async function doSell(
  userId: User["id"],
  amount: any,
  artistId: any,
  artistName: any,
  count: number
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const newCredits = Math.round(user.credits + Number(amount) * count);
  const transactionFollowers = Math.round(
    Number(amount) * Number(count) * 1000 * -1
  );
  const endFollowers = user.followers + Number(transactionFollowers);
  const stockQuantityInPossession = await getStock({
    userId,
    artistId,
  }).then((stock) => {
    if (!stock) throw new Error("You don't own enough shares");
    return stock.count;
  });
  if (stockQuantityInPossession < count)
    throw new Error("You don't own enough shares");
  return prisma.user
    .update({
      where: { id: userId },
      data: { credits: newCredits, followers: endFollowers },
    })
    .then(() => {
      return prisma.stock.update({
        where: { artistId },
        data: {
          count: {
            decrement: count,
          },
        },
      });
    })
    .then(() => {
      return prisma.transaction.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          endFollowers,
        },
      });
    });
}
