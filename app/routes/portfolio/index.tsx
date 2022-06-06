import Stats from "~/components/Stats";
import Header from "~/components/Header";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
// import { json } from "@remix-run/node";
import { getUserId } from "~/session.server";
import {
  doBuy,
  doSell,
  getStockListItems,
  getTransactions,
} from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useUser } from "~/utils";
import TransactionModal from "~/components/TransactionModal";
import { useState } from "react";
// import { prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const userId = await requireUserId(request);
  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  }).then((res) => res.json());

  const stockListItems = await getStockListItems({ userId });
  const transactionHistory = await getTransactions({ userId });
  const stocksData = await Promise.all(
    stockListItems.map(async (stockListItem) => {
      const stock = await fetch(
        `https://api.spotify.com/v1/artists/${stockListItem.artistId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token.access_token,
          },
        }
      ).then((res) => res.json());
      return stock;
    })
  );
  let sum = 0;
  stockListItems.map(
    (stock: any, i: any) => (sum += stock.count * stocksData[i].followers.total)
  );
  prisma.user.update({
    where: { id: userId },
    data: {
      followers: sum,
    },
  });
  return { stocksData, stockListItems, transactionHistory };
};

// switch case for buy / sell
export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const amount = formData.get("amount");
  const artistId = formData.get("artistId");
  const artistName = formData.get("artistName");
  const count = Number(formData.get("transactionCount"));
  let action = formData.get("action");
  switch (action) {
    case "buy": {
      return doBuy(userId!, amount!, artistId!, artistName!, count!);
    }
    case "sell": {
      return doSell(userId!, amount!, artistId!, artistName!, count!);
    }
  }
};

export default function PortfolioIndexPage() {
  const data = useLoaderData();
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [stockId, setStockId] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [transactionType, setTransactionType] = useState("buy");

  const handleChange = (event: any) => {
    setTransactionCount(event.target.value);
  };

  let sum = 0;
  data.stockListItems.map(
    (stock: any, i: any) =>
      (sum += stock.count * data.stocksData[i].followers.total)
  );

  let transactions = [];
  data.transactionHistory.map((transaction: any) => {
    return transactions.push({
      x: transaction.createdAt,
      y: transaction.endFollowers,
    });
  });
  transactions.push({ x: new Date().toISOString(), y: sum });

  return (
    <div>
      <Header user={user} />
      <div className="m-auto w-2/3 bg-primaryBlack py-8 text-gray-100">
        <h3>Overview:</h3>
        <Stats followers={sum.toLocaleString()} data={transactions} />
        <div className="grid grid-cols-2 items-center gap-4 py-6 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div>Artist Name</div>
          <div className="hidden sm:inline">Price</div>
          <div className="hidden md:inline">Owned</div>
          <div className="hidden lg:inline">Your Followers</div>
          <div>Buy / Sell</div>
        </div>
        <ol className="mb-8">
          {data.stockListItems.map(
            (stock: any, i: any) =>
              stock.count > 0 && (
                <li
                  key={stock.artistId}
                  className="mb-4 grid grid-cols-2 gap-4 rounded py-2 pl-2 pr-5 hover:bg-gray-700 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  <>
                    <Link to={`/artists/${stock.artistId}`}>
                      {stock.artistName}
                    </Link>
                    <div className="hidden sm:inline">
                      $
                      {(data.stocksData[i].followers.total / 1000)
                        .toFixed(2)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </div>
                    <div className="hidden md:inline">{stock.count}</div>
                    <span className="hidden lg:inline">
                      {(
                        data.stocksData[i].followers.total * stock.count
                      ).toLocaleString()}
                    </span>
                    <div className="flex gap-3">
                      <button
                        className="rounded bg-primaryGreen py-1 px-2"
                        onClick={() => {
                          setIsOpen(true);
                          setStockId(i);
                          setTransactionType("buy");
                        }}
                      >
                        Buy
                      </button>
                      <button
                        className="rounded bg-red-500 py-1 px-2"
                        onClick={() => {
                          setIsOpen(true);
                          setStockId(i);
                          setTransactionType("sell");
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </>
                </li>
              )
          )}
        </ol>
        {data.stockListItems.length > 0 && (
          <TransactionModal
            open={isOpen}
            onClose={() => {
              setIsOpen(false);
              setTransactionCount(0);
            }}
          >
            <div className="flex flex-col items-center justify-center gap-y-3 py-3">
              <div>{data.stocksData[stockId].name}</div>
              <div>
                $
                {(data.stocksData[stockId].followers.total / 1000)
                  .toFixed(2)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
              <div>{data.stockListItems[stockId].count} shares owned</div>
            </div>
            <label className="mb-2 block text-xs font-bold text-gray-700">
              Number of Shares
            </label>
            <input
              type="number"
              value={transactionCount}
              className="mb-4 rounded pl-2 text-black"
              onChange={handleChange}
            />
            <div className="flex flex-col items-center justify-center gap-y-2 pb-4 text-sm text-gray-700">
              <div>Your Balance: ${user!.credits}</div>
              <div>
                Transaction Total: $
                {(
                  (data.stocksData[stockId].followers.total / 1000) *
                  transactionCount
                )
                  .toFixed(2)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>
            <Form
              method="post"
              onSubmit={() => {
                setIsOpen(false);
                setTransactionCount(0);
              }}
              className="flex flex-col items-center justify-center gap-y-4"
            >
              <div className="flex justify-center gap-x-4">
                <input
                  type="hidden"
                  value={
                    transactionType === "buy"
                      ? (data.stocksData[stockId].followers.total / 1000) * -1
                      : data.stocksData[stockId].followers.total / 1000
                  }
                  name="amount"
                />
                <input
                  type="hidden"
                  value={data.stocksData[stockId].id}
                  name="artistId"
                />
                <input
                  type="hidden"
                  value={data.stocksData[stockId].name}
                  name="artistName"
                />
                <input
                  type="hidden"
                  value={transactionCount}
                  name="transactionCount"
                />
                <button
                  onClick={() => setTransactionType("buy")}
                  type="button"
                  className={`${
                    transactionType === "buy"
                      ? "bg-primaryGreen"
                      : "bg-gray-700"
                  } rounded py-1 px-2 text-gray-100`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTransactionType("sell")}
                  type="button"
                  className={`${
                    transactionType === "buy" ? "bg-gray-700" : "bg-red-500"
                  } rounded py-1 px-2 text-gray-100`}
                >
                  Sell
                </button>
              </div>
              {transactionType === "sell" &&
              transactionCount > 0 &&
              data.stockListItems[stockId].count < transactionCount ? (
                <div className="m-auto w-full text-center text-red-500">
                  {" "}
                  You don't have enough <br /> shares to sell!
                </div>
              ) : null}
              {transactionType === "buy" &&
              (transactionCount * data.stocksData[stockId].followers.total) /
                1000 >
                user!.credits ? (
                <div className="m-auto w-full text-center text-red-500">
                  {" "}
                  You don't have enough <br /> credits to buy!
                </div>
              ) : null}
              <button
                type="submit"
                name="action"
                value={transactionType}
                className={`rounded border ${
                  transactionCount < 1 ||
                  (transactionType === "sell" &&
                    data.stockListItems[stockId].count < transactionCount) ||
                  (transactionType === "buy" &&
                    (transactionCount *
                      data.stocksData[stockId].followers.total) /
                      1000 >
                      user!.credits)
                    ? "bg-gray-500 text-gray-800 "
                    : "bg-transparent text-gray-100 hover:bg-gray-600"
                } w-full px-2 py-1 `}
                disabled={
                  transactionCount < 1 ||
                  (transactionType === "sell" &&
                    data.stockListItems[stockId].count < transactionCount) ||
                  (transactionType === "buy" &&
                    (transactionCount *
                      data.stocksData[stockId].followers.total) /
                      1000 >
                      user!.credits)
                }
              >
                Confirm
              </button>
            </Form>
          </TransactionModal>
        )}
      </div>
    </div>
  );
}
