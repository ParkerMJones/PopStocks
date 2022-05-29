import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import Header from "~/components/Header";
import type { LoaderFunction } from "@remix-run/server-runtime";
import Stats from "~/components/Stats";
import { getStockListItems, getTransactions } from "~/models/stock.server";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
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
  const news = await fetch(
    `https://api.thenewsapi.com/v1/news/all?api_token=Ua0sYWlifqJzXh2BjqoRFKTjfX1C24gVSftpuioO&domains=rollingstone.com,complex.com,billboard.com,pitchfork.com,edm.com,mtv.com,hiphopdx.com,ra.co&sort=published_at&language=en&country=us&page=1&limit=1`
  ).then((res) => res.json());
  return { stocksData, stockListItems, transactionHistory, news };
  // return { stocksData, stockListItems, transactionHistory };
};

export default function Index() {
  const user = useOptionalUser();
  const data = useLoaderData();
  console.log(data);

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
    <div className="bg-primaryBlack">
      {user ? (
        <>
          <Header user={user} />
          <div className="w-100% flex flex-col gap-y-12 py-8">
            <div className="m-auto w-2/3">
              <h3 className="text-gray-100">Overview:</h3>
              <Stats followers={sum.toLocaleString()} data={transactions} />
            </div>
            <h1 className="m-auto w-2/3 text-2xl text-gray-100">
              Top 50 Global
            </h1>
            <div className="m-auto w-2/3">
              <iframe
                src="https://open.spotify.com/embed/playlist/37i9dQZEVXbMDoHDwVN2tF?utm_source=generator"
                width="100%"
                height="380"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="top50"
              ></iframe>
            </div>
            <h1 className="m-auto w-2/3 text-2xl text-gray-100">News</h1>
            {data.news.data?.length > 0 ? (
              <div className="m-auto w-2/3">
                {data.news.data.map((article: any) => (
                  <div
                    key={article.uuid}
                    className="flex gap-x-4 border-t border-gray-600 p-4 text-gray-100"
                  >
                    <a
                      className="flex w-4/5 flex-col gap-y-4"
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="text-sm text-gray-300">
                        {article.source}
                      </div>
                      <div>{article.title}</div>
                      <div className="text-xs text-gray-400">
                        {article.description}
                      </div>
                    </a>
                    <img
                      src={article.image_url}
                      className="h-18 w-32"
                      alt={article.title}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="m-auto w-2/3 text-gray-100">
                No News Available
              </div>
            )}
          </div>
        </>
      ) : (
        <main className="relative min-h-screen bg-primaryBlack sm:flex sm:items-center sm:justify-center">
          <div className="relative sm:pb-16 sm:pt-8">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
                <div className="absolute inset-0">
                  <img
                    className="h-full w-full object-cover"
                    src="https://wallpaperaccess.com/full/223196.jpg"
                    alt="Drake"
                  />
                  <div className="absolute inset-0 bg-primaryGreen opacity-20 mix-blend-multiply" />
                </div>
                <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
                  <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                    <span className="block uppercase text-primaryGreen drop-shadow-md">
                      Pop Stocks
                    </span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-lg text-center text-xl text-gray-100 sm:max-w-3xl">
                    Invest in the future of music.
                  </p>
                  <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                    <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                      <Link
                        to="/join"
                        className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-primaryGreen shadow-sm hover:bg-blue-50 sm:px-8"
                      >
                        Sign up
                      </Link>
                      <Link
                        to="/login"
                        className="flex items-center justify-center rounded-md bg-primaryGreen px-4 py-3 font-medium text-gray-100 hover:bg-secondaryGreen  "
                      >
                        Log In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
