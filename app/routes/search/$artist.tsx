import type { LoaderFunction } from "@remix-run/server-runtime";
import { useOptionalUser } from "~/utils";
import { Link, useLoaderData } from "@remix-run/react";

import Header from "~/components/Header";

export const loader: LoaderFunction = async ({ params }) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  }).then((res) => res.json());

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=artist%3A${params.artist}&type=artist`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token.access_token,
      },
    }
  );
  return response.json();
};

function SearchResults() {
  const artists = useLoaderData();
  const user = useOptionalUser();
  console.log(artists);

  return (
    <div className="bg-primaryBlack">
      <Header user={user} />
      {artists.artists.items.length > 0 ? (
        <div className="m-auto grid grid-cols-1 justify-items-center gap-8 p-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {artists.artists.items.map((artist: any) => (
            <Link to={`/artists/${artist.id}`} key={artist.id}>
              <div
                className="align-center mb-3 flex flex-col justify-center gap-2 hover:cursor-pointer"
                key={artist.id}
              >
                <img
                  src={
                    artist.images[0]?.url ? artist.images[0].url : "/trend.png"
                  }
                  alt={artist.name}
                  className="m-auto mb-2 h-40 w-40 rounded-lg"
                />
                <h1 className="text-center text-gray-100">{artist.name}</h1>
                <p className="text-center text-gray-100">
                  {Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(artist.followers.total)}{" "}
                  followers
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid place-content-center text-gray-100">
          No Artists Found
        </div>
      )}
    </div>
  );
}

export default SearchResults;
