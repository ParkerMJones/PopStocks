import Search from "~/components/Search";

export default function SearchIndex() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="pt-8 text-2xl text-gray-100">Search for an Artist</h1>
      <div className="flex h-full flex-col items-center justify-center">
        <Search />
      </div>
    </div>
  );
}
