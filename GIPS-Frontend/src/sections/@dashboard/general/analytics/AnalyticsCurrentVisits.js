import { useState, useEffect } from 'react';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader, Grid, Typography } from '@mui/material';
// utils
import { fNumber } from '../../../../utils/formatNumber';
// components
import { BaseOptionChart } from '../../../../components/chart';
import axios from '../../../../utils/axios';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

export default function AnalyticsCurrentVisits() {
  const theme = useTheme();
  const [facultyData, setFacultyData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      await axios.get(`/v1/analytics/by-faculty`).then((response) => {
        setFacultyData(response.data.data);
      });
    };
    fetch();
  }, []);

  function extractProgressionStatusData(faculty) {
    const statusLabels_ = ['Pending', 'Fail + Supplement', 'Pass + Proceed', 'Fail + Repeat'];
    const statusCounts = faculty.progressionStatusCounts;
    const progressionStatuses_ = [
      statusCounts.pending || 0,
      statusCounts['Fail + Supplement'] || 0,
      statusCounts['Pass + Proceed'] || 0,
      statusCounts['Fail + Repeat'] || 0,
    ];

    return { statusLabels_, progressionStatuses_ };
  }

  const chartOptions = (statusLabels) =>
    merge(BaseOptionChart(), {
      colors: [
        theme.palette.primary.main,
        theme.palette.chart.blue[0],
        theme.palette.chart.violet[0],
        theme.palette.chart.yellow[0],
      ],
      labels: statusLabels,
      stroke: { colors: [theme.palette.background.paper] },
      legend: { floating: true, horizontalAlign: 'center' },
      dataLabels: { enabled: true, dropShadow: { enabled: false } },
      tooltip: {
        fillSeriesColor: false,
        y: {
          formatter: (seriesName) => fNumber(seriesName),
          title: {
            formatter: (seriesName) => `${seriesName}`,
          },
        },
      },
      plotOptions: {
        pie: { donut: { labels: { show: false } } },
      },
    });

  return (
    <Card>
      <CardHeader title="Performance By Progression Status" />
      <Grid container spacing={3} justifyContent="space-around" sx={{ marginTop: 2 }}>
        {facultyData.length > 0 ? (
          facultyData.map((faculty) => {
            const { statusLabels_, progressionStatuses_ } = extractProgressionStatusData(faculty);
            const CHART_DATA = progressionStatuses_;

            return (
              <Grid item xs={12} sm={6} md={4} key={faculty.facultyId}>
                <Card>
                  <CardHeader title={<Typography variant="h6">{faculty.facultyName}</Typography>} />
                  <ChartWrapperStyle dir="ltr">
                    <ReactApexChart type="pie" series={CHART_DATA} options={chartOptions(statusLabels_)} height={280} />
                  </ChartWrapperStyle>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Typography variant="h6">No data available</Typography>
        )}
      </Grid>
    </Card>
  );
}
