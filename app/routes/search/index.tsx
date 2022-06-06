import Header from "~/components/Header";
import Search from "~/components/Search";
import { useUser } from "~/utils";

export default function SearchIndex() {
  const user = useUser();
  return (
    <>
      <Header user={user} />
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="pt-8 text-2xl text-gray-100">Search for an Artist</h1>
        <div className="flex h-full flex-col items-center justify-center">
          <Search />
        </div>
      </div>
    </>
  );
}
