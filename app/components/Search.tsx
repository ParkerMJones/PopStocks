import { useState } from "react";
import { Form } from "@remix-run/react";

import SearchIcon from "@mui/icons-material/Search";

function Search() {
  const [artist, setArtist] = useState("");

  return (
    <Form method="get" action={`/search/${artist}`}>
      <div className="flex w-80 gap-2 rounded border border-white bg-transparent p-1 text-gray-100">
        <SearchIcon />
        <input
          placeholder="Search"
          className="bg-transparent focus:outline-none"
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>
    </Form>
  );
}

export default Search;
