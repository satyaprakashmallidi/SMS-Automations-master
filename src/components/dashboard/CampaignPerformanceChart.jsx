import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const defaultChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Messages Sent',
      data: new Array(7).fill(0),
      borderColor: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: 'rgb(37, 99, 235)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
    },
    {
      label: 'Delivered Messages',
      data: new Array(7).fill(0),
      borderColor: 'rgb(22, 163, 74)',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: 'rgb(22, 163, 74)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
    },
  ],
}

function CampaignPerformanceChart({
  data = defaultChartData,
  totalSent = 0,
  totalDelivered = 0,
  isLoading = false,
}) {
  const hasData =
    data?.datasets?.some((dataset) =>
      Array.isArray(dataset.data)
        ? dataset.data.some((value) => Number(value) > 0)
        : false
    ) || false

  // Track the highest daily total so we can pad the y-axis ceiling
  const maxValue = data?.datasets?.reduce((max, dataset) => {
    if (!Array.isArray(dataset?.data)) return max
    const datasetMax = dataset.data.reduce((currentMax, value) => {
      const numericValue = Number(value)
      return Number.isFinite(numericValue)
        ? Math.max(currentMax, numericValue)
        : currentMax
    }, 0)
    return Math.max(max, datasetMax)
  }, 0) || 0

  const suggestedYAxisMax =
    maxValue > 0 ? maxValue + Math.max(4, Math.ceil(maxValue * 0.2)) : 10

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
            weight: 500,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed.y
            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: suggestedYAxisMax,
        grace: '10%',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
      },
    },
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4 md:mb-6">
        Campaign Performance
      </h3>

      <div className="flex-1 flex min-h-[250px] md:min-h-[320px]">
        {isLoading ? (
          <div className="flex items-center justify-center w-full text-gray-500">
            <p>Loading campaign data...</p>
          </div>
        ) : hasData ? (
          <div className="relative w-full h-full">
            <Line data={data} options={chartOptions} style={{ height: '100%' }} />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full text-gray-400 text-sm">
            No campaign activity for the selected window.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 md:mt-6 md:pt-6 border-t border-gray-200">
        <div>
          <p className="text-gray-600 text-sm font-normal">Total Sent</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalSent}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-normal">Total Delivered</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {totalDelivered}
          </p>
        </div>
      </div>
    </div>
  )
}

CampaignPerformanceChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(PropTypes.object),
  }),
  totalSent: PropTypes.number,
  totalDelivered: PropTypes.number,
  isLoading: PropTypes.bool,
}

export default CampaignPerformanceChart
