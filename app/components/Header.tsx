import React from "react";
import { Form, Link } from "@remix-run/react";
import Search from "./Search";

function Header({ user }: { user: any }) {
  return (
    <header className="flex items-center justify-between bg-primaryBlack p-4 text-gray-100">
      <div className="flex w-96 items-center gap-5">
        <h1 className="text-3xl font-bold">
          <Link to="/">
            <img src="/trend.png" alt="Pop Stocks Home" className="h-8 w-8" />
          </Link>
        </h1>
        <Search />
      </div>
      <div>
        <p>Balance: ${user.credits.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/portfolio" className="text-gray-100">
          <p>Portfolio</p>
        </Link>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-primaryGreen py-2 px-4 text-blue-100 hover:bg-secondaryGreen active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </div>
    </header>
  );
}

export default Header;
