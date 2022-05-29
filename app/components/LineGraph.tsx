import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale
);

const LineGraph = ({ graphData }: any) => {
  return (
    <Line
      data={{
        datasets: [
          {
            label: "",
            data: graphData,
            tension: 0.01,
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: "#5AC53B",
            borderWidth: 2,
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            pointHoverBackgroundColor: "#5AC53B",
            pointHoverBorderColor: "rgba(0, 0, 0, 0)",
            pointHoverBorderWidth: 4,
            pointHoverRadius: 6,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              tooltipFormat: "DD",
            },
            grid: {
              display: false,
            },
            display: true,
          },
          y: {
            grid: {
              display: false,
            },
            display: false,
          },
        },
      }}
    />
  );
};

export default LineGraph;
