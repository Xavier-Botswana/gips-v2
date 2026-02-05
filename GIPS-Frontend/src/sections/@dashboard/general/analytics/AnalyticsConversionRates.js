import { useEffect, useState } from 'react';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Box, Card, CardHeader } from '@mui/material';
// utils
import { fNumber } from '../../../../utils/formatNumber';
//
import { BaseOptionChart } from '../../../../components/chart';
import axios from '../../../../utils/axios';

// ----------------------------------------------------------------------

export default function AnalyticsConversionRates() {
  const [programData, setProgramData] = useState([]);

  useEffect(() => {
    axios
      .get(`/v1/analytics/by-program`)
      .then((response) => {
        setProgramData(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching program data:', error);
      });
  }, []);

  function sortCourses(data) {
    // Sort courses based on highestMark in descending order
    const sortedData = data.sort((a, b) => b.highestMark - a.highestMark);

    // Extract course names and highest marks into two separate arrays
    const courseNames = sortedData.map((course) => course.courseName);
    const highestMarks = sortedData.map((course) => course.highestMark);

    return { courseNames, highestMarks };
  }

  // Call method
  const { courseNames, highestMarks } = sortCourses(programData);

  const CHART_DATA = [{ data: [...highestMarks] }];

  const chartOptions = merge(BaseOptionChart(), {
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: { horizontal: false, barHeight: '28%', borderRadius: 2 },
    },
    xaxis: {
      categories: courseNames,
    },
  });

  return (
    <Card>
      <CardHeader title="Top Performing Programs" subheader="The highest being the top" />
      <Box sx={{ mx: 3 }} dir="ltr">
        <ReactApexChart type="bar" series={CHART_DATA} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
