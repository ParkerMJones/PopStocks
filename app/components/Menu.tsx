import { Link, Form } from "@remix-run/react";

const Menu = ({ open }: any) => {
  return (
    <nav
      className={`absolute top-0 right-0 flex h-80 flex-col justify-center bg-secondaryGreen p-8 text-left ${
        open ? "visible" : "hidden"
      }`}
    >
      <Link to="/search" className="py-2 text-gray-100">
        Search Artists
      </Link>
      <Link to="/portfolio" className="py-2 text-gray-100">
        Portfolio
      </Link>
      <Form action="/logout" method="post" className="py-2 text-gray-100">
        <button type="submit">Logout</button>
      </Form>
    </nav>
  );
};

export default Menu;
