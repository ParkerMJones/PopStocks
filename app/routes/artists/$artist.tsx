import type { LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { useOptionalUser } from "~/utils";
import { getUserId, requireUserId } from "~/session.server";
import { Form, useLoaderData } from "@remix-run/react";
import { doBuy, doSell, getStockListItems } from "~/models/stock.server";

import TransactionModal from "~/components/TransactionModal";
import Header from "~/components/Header";
import Stats from "~/components/Stats";
import { useState } from "react";

export const loader: LoaderFunction = async ({ request, params }) => {
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

  const artistInfo = Promise.all([
    await fetch(`https://api.spotify.com/v1/artists/${params.artist}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token.access_token,
      },
    }),

    await fetch(
      `https://api.spotify.com/v1/artists/${params.artist}/top-tracks?country=US`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token.access_token,
        },
      }
    ),

    await fetch(`https://api.spotify.com/v1/artists/${params.artist}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token.access_token,
      },
    })
      .then((response) => response.json())
      .then((data) =>
        fetch(
          `https://api.thenewsapi.com/v1/news/all?api_token=Ua0sYWlifqJzXh2BjqoRFKTjfX1C24gVSftpuioO&search=${data.name}&language=en&country=us&page=1&limit=3`
        )
      ),
    await getStockListItems({ userId }),
  ]).then((info) =>
    Promise.all([info[0].json(), info[1].json(), info[2].json(), info[3]])
  );

  return artistInfo;
};

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

function ArtistPage() {
  const artist = useLoaderData();
  const user = useOptionalUser();
  const [isOpen, setIsOpen] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [transactionType, setTransactionType] = useState("buy");
  // console.log(artist);

  const handleChange = (event: any) => {
    setTransactionCount(event.target.value);
  };

  const hasArtist = artist[3].find(
    (item: any) => item.artistId === artist[0].id
  );

  return (
    <div className="bg-primaryBlack pb-8">
      <Header user={user} />
      <article className="relative h-full w-fit overflow-hidden">
        <img
          src={artist[0].images[0].url}
          alt={artist[0].name}
          className="h-36 w-screen object-cover brightness-50"
        />
        <div className="absolute top-0 bottom-0 left-0 right-0 m-auto h-fit text-center text-lg uppercase text-white md:text-5xl">
          <h1>{artist[0].name}</h1>
        </div>
      </article>
      <div className="mt-8 flex w-screen flex-col gap-y-4">
        <div className="m-auto w-full px-6 lg:w-2/3">
          <Stats artist={artist[0]} />
        </div>
        <div className="m-auto flex w-full items-center gap-8 px-6 py-3 text-gray-100 lg:w-2/3">
          <p>
            Price: $
            {(artist[0].followers.total / 1000)
              .toFixed(2)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
          <button
            type="button"
            className="rounded bg-primaryGreen py-1 px-2 text-gray-100"
            onClick={() => {
              setIsOpen(true);
              setTransactionType("buy");
            }}
          >
            Buy
          </button>
          <button
            type="button"
            className="rounded bg-red-500 py-1 px-2 text-gray-100"
            onClick={() => {
              setIsOpen(true);
              setTransactionType("sell");
            }}
          >
            Sell
          </button>
        </div>
        <div className="m-auto w-full px-6 lg:w-2/3">
          <h1 className="pb-4 text-gray-100">{artist[0].name}'s Top Tracks:</h1>
          {artist[1].tracks.map((track: any) => (
            <div
              className="flex max-w-fit flex-col pb-2 text-gray-100"
              key={track.id}
            >
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
              >
                <p className="underline">{track.name}</p>
              </a>
            </div>
          ))}
        </div>
        <h2 className="m-auto w-full px-6 text-2xl text-gray-100 lg:w-2/3">
          News
        </h2>
        {artist[2].data?.length > 0 ? (
          <div className="m-auto w-full px-6 lg:w-2/3">
            {artist[2].data.map((article: any) => (
              <div
                key={article.uuid}
                className="flex items-center gap-x-4 border-t border-gray-600 p-4 text-gray-100"
              >
                <a
                  className="flex w-4/5 flex-col gap-y-4"
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-sm text-gray-300">{article.source}</div>
                  <div>{article.title}</div>
                  <div className="text-xs text-gray-400">
                    {article.description}
                  </div>
                </a>
                <div className="h-18 w-32">
                  <img
                    src={article.image_url}
                    className="h-auto w-full"
                    alt={article.title}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="m-auto w-2/3 text-gray-100">No News Available</div>
        )}
      </div>
      <TransactionModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setTransactionCount(0);
        }}
      >
        <div className="py-2 text-gray-100">{artist[0].name}</div>
        <div className="py-2 text-gray-100">
          $
          {(artist[0].followers.total / 1000)
            .toFixed(2)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
        {hasArtist && (
          <div className="mb-2 py-2 text-gray-100">
            {hasArtist.count} shares owned
          </div>
        )}
        {/* <div>{data.stockListItems[stockId].count}</div> */}
        <input
          type="number"
          value={transactionCount}
          className="mb-4 rounded pl-2 text-black"
          onChange={handleChange}
          min="0"
        />
        <Form
          method="post"
          onSubmit={() => {
            setIsOpen(false);
            setTransactionCount(0);
          }}
          className="align-center flex flex-col justify-center gap-y-4"
        >
          <div className="flex justify-center gap-x-4">
            <input
              type="hidden"
              value={
                transactionType === "buy"
                  ? (artist[0].followers.total / 1000) * -1
                  : artist[0].followers.total / 1000
              }
              name="amount"
            />
            <input type="hidden" value={artist[0].id} name="artistId" />
            <input type="hidden" value={artist[0].name} name="artistName" />
            <input
              type="hidden"
              value={transactionCount}
              name="transactionCount"
            />
            <button
              onClick={() => setTransactionType("buy")}
              type="button"
              className={`${
                transactionType === "buy" ? "bg-primaryGreen" : "bg-gray-700"
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
          (!hasArtist || hasArtist.count < transactionCount) ? (
            <div className="m-auto w-full text-center text-red-500">
              {" "}
              You don't have enough <br /> shares to sell!
            </div>
          ) : null}
          {transactionType === "buy" &&
          (transactionCount * artist[0].followers.total) / 1000 >
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
                (hasArtist == undefined ||
                  hasArtist.count < transactionCount)) ||
              (transactionType === "buy" &&
                (transactionCount * artist[0].followers.total) / 1000 >
                  user!.credits)
                ? "bg-gray-500 text-gray-800 "
                : "bg-transparent text-gray-100 hover:bg-gray-600"
            } px-2 py-1  `}
            disabled={
              transactionCount < 1 ||
              (transactionType === "sell" &&
                (hasArtist == undefined ||
                  hasArtist.count < transactionCount)) ||
              (transactionType === "buy" &&
                (transactionCount * artist[0].followers.total) / 1000 >
                  user!.credits)
            }
          >
            Confirm
          </button>
        </Form>
      </TransactionModal>
    </div>
  );
}

export default ArtistPage;
