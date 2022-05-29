import { useEffect, useState } from "react";
import LineGraph from "./LineGraph";

const Stats = ({ artist, followers, data }: any) => {
  return (
    <div className="bg-primaryBlack text-gray-100">
      {artist ? (
        <>
          <h1 className="text-3xl">
            {artist.followers.total.toLocaleString()} Followers
          </h1>
          <div className="brightness-50">
            <div className="absolute top-0 bottom-0 left-0 right-0 m-auto h-fit text-center text-lg uppercase text-white md:text-xl">
              <p>
                Historical Artist Data Unavailable Due to Prohibitive API Cost
              </p>
            </div>
            <Chart />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl">{followers} Followers</h1>
          <Chart data={data} />
        </>
      )}
    </div>
  );
};

const Chart = ({ data }: any) => {
  const [graphData, setGraphData] = useState(data || []);

  const createData = () => {
    let history: any[] = [];
    data.map((transaction: any) => {
      return history.push({
        x: transaction.x,
        y: transaction.y,
      });
    });
    setGraphData(history);
  };

  const createMockData = () => {
    let history = [];
    let value = 50;
    for (let i = 0; i < 366; i++) {
      let date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(i);
      value += Math.round((Math.random() < 0.5 ? 1 : 0) * Math.random() * 10);
      history.push({ x: date, y: value });
    }
    setGraphData(history);
  };

  useEffect(() => {
    data ? createData() : createMockData();
  }, [data]);

  return (
    <div>
      <LineGraph graphData={graphData} />
    </div>
  );
};

export default Stats;
