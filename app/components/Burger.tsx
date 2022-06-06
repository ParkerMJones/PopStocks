const Burger = ({ open }: any) => {
  return (
    <button className="absolute top-0 right-0 z-20 mr-5 mt-4 flex h-8 w-8 cursor-pointer flex-col justify-around border-none bg-transparent">
      <div className="relative h-0.5 w-8 origin-[1px] bg-gray-100"></div>
      <div className="relative h-0.5 w-8 origin-[1px] bg-gray-100"></div>
      <div className="relative h-0.5 w-8 origin-[1px] bg-gray-100"></div>
    </button>
  );
};

export default Burger;
