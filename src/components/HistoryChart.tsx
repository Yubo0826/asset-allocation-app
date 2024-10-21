import { BarChart } from '@mui/x-charts/BarChart';

const series = [{ data: [-2, -9, 12, 11, 6, -4] }];

// const history = [
//   { date: '2024-01-01', totalValue: 12000, annualizedReturn: -5 },
//   { date: '2024-02-01', totalValue: 13000, annualizedReturn: 6.5 },
//   { date: '2024-03-01', totalValue: 14500, annualizedReturn: 7.2 },
//   { date: '2024-04-01', totalValue: 15000, annualizedReturn: -8.0 },
//   { date: '2024-05-01', totalValue: 16000, annualizedReturn: 9.1 },
// ];

export default function ColorScale() {
  return (
    <BarChart
        height={300}
        grid={{ horizontal: true }}
        series={series}
        margin={{
          top: 10,
          bottom: 20,
        }}
        yAxis={[
          {
            label: 'rainfall (mm)',
          },
        ]}
        xAxis={[
          {
            scaleType: 'band',
            data: [
              new Date(2019, 1, 1),
              new Date(2020, 1, 1),
              new Date(2021, 1, 1),
              new Date(2022, 1, 1),
              new Date(2023, 1, 1),
              new Date(2024, 1, 1),
            ],
            valueFormatter: (value) => value.getFullYear().toString()
          },
        ]}
      />
  );
}
