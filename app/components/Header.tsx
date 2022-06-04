import { useState } from "react";
import { Form, Link } from "@remix-run/react";
import Search from "./Search";
import Burger from "./Burger";
import Menu from "./Menu";

function Header({ user }: { user: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="flex items-center justify-between bg-primaryBlack p-4 text-gray-100">
      <div className="flex w-1/6 items-center pl-5">
        <h1 className="text-3xl font-bold">
          <Link to="/">
            <img src="/trend.png" alt="Pop Stocks Home" className="h-8 w-8" />
          </Link>
        </h1>
      </div>
      <div className="hidden w-2/3 items-center justify-between lg:flex">
        <Search />
        <p>Balance: ${user.credits.toLocaleString()}</p>
        <Link to="/portfolio" className="text-gray-100">
          <p>Portfolio</p>
        </Link>
      </div>
      <div className="hidden w-1/6 items-center justify-end pr-5 lg:flex">
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-primaryGreen py-2 px-4 text-blue-100 hover:bg-secondaryGreen active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </div>
      <div className="lg:hidden">
        <span onClick={handleMenuClick}>
          <Burger open={menuOpen} />
        </span>
        <Menu open={menuOpen} />
      </div>
    </header>
  );
}

export default Header;
