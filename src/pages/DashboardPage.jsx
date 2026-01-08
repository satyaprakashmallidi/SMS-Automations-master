import { useEffect, useRef, useState } from 'react'
import StatCard from '../components/dashboard/StatCard.jsx'
import CampaignPerformanceChart from '../components/dashboard/CampaignPerformanceChart.jsx'
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed.jsx'
import QuickActionButton from '../components/dashboard/QuickActionButton.jsx'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getCustomers } from '../services/customersService'
import { getCampaigns } from '../services/campaignsService'
import { getCustomerConversations } from '../services/conversationsService'
import { getDashboardSnapshot, saveDashboardSnapshot } from '../services/dashboardService'
import { formatMessageTime } from '../utils/timeFormatters'

const DIRECT_MESSAGE_CAMPAIGN_ID = 'direct-message'

const normalizeTimestamp = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

const extractDirectMessages = (conversations = []) => {
  const entries = []

  conversations.forEach((conversation) => {
    const customerName = conversation?.customer_name || conversation?.customerName || 'Customer'
    const customerId = conversation?.customer_id || conversation?.customerId || ''
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : []

    messages.forEach((message, index) => {
      const direction = (message?.direction || '').toLowerCase()
      const campaignId = message?.campaignId || message?.campaign_id
      if (direction !== 'outbound') return
      if (campaignId !== DIRECT_MESSAGE_CAMPAIGN_ID) return

      const timestamp =
        normalizeTimestamp(message?.timestamp || message?.sent_at || message?.created_at) || null
      if (!timestamp) return

      const status = (message?.status || '').toLowerCase()
      entries.push({
        id:
          message?.id ||
          message?.providerMessageId ||
          `${customerId || 'direct'}-${index}-${timestamp}`,
        customerName,
        timestamp,
        status,
      })
    })
  })

  return entries
}

const formatLocalDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildDailyBuckets = () => {
  const today = new Date()
  const startOfWeek = new Date(today)
  const dayOfWeek = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)

  const buckets = []
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(startOfWeek)
    current.setDate(startOfWeek.getDate() + i)
    const iso = formatLocalDateKey(current)
    const label = current.toLocaleDateString('en-US', { weekday: 'short' })
    buckets.push({ iso, label, sent: 0, delivered: 0 })
  }
  return buckets
}

const createDataset = (label, borderColor, backgroundColor, data, options = {}) => ({
  label,
  data,
  borderColor,
  backgroundColor,
  borderWidth: 2,
  fill: options.fill ?? false,
  tension: 0.4,
  pointRadius: 5,
  pointBackgroundColor: borderColor,
  pointBorderColor: '#fff',
  pointBorderWidth: 2,
  pointHoverRadius: 7,
})

const bucketsToChart = (buckets = []) => {
  const labels = buckets.map((bucket) => bucket.label || bucket.iso)
  const sentData = buckets.map((bucket) => Number(bucket.sent || 0))
  const deliveredData = buckets.map((bucket) =>
    Number(
      bucket.delivered ??
        bucket.engaged ??
        0
    )
  )

  const chartData = {
    labels,
    datasets: [
      createDataset(
        'Messages Sent',
        'rgb(37, 99, 235)',
        'rgba(37, 99, 235, 0.1)',
        sentData,
        { fill: true }
      ),
      createDataset(
        'Delivered Messages',
        'rgb(22, 163, 74)',
        'rgba(22, 163, 74, 0.1)',
        deliveredData,
        { fill: true }
      ),
    ],
  }

  const totals = {
    sent: sentData.reduce((sum, value) => sum + value, 0),
    delivered: deliveredData.reduce((sum, value) => sum + value, 0),
  }

  return { chartData, totals }
}

const calculateChartMetrics = (campaigns = [], directMessages = []) => {
  const buckets = buildDailyBuckets()
  const bucketMap = buckets.reduce((acc, bucket) => {
    acc[bucket.iso] = bucket
    return acc
  }, {})

  campaigns.forEach((campaign) => {
    if (!campaign.sentAt) return
    const sentDate = new Date(campaign.sentAt)
    if (Number.isNaN(sentDate.getTime())) return
    const dateKey = formatLocalDateKey(sentDate)
    if (!bucketMap[dateKey]) return

    bucketMap[dateKey].sent += Number(campaign.sentCount || 0)
    bucketMap[dateKey].delivered += Number(campaign.deliveredCount || 0)
  })

  directMessages.forEach((message) => {
    if (!message?.timestamp) return
    const sentDate = new Date(message.timestamp)
    if (Number.isNaN(sentDate.getTime())) return
    const dateKey = formatLocalDateKey(sentDate)
    if (!bucketMap[dateKey]) return

    bucketMap[dateKey].sent += 1
    if (message.status === 'delivered' || message.status === 'sent') {
      bucketMap[dateKey].delivered += 1
    }
  })

  const { chartData, totals } = bucketsToChart(buckets)
  return { buckets, chartData, totals }
}

const buildRecentActivity = (campaigns = [], directMessages = []) => {
  const items = []

  campaigns.forEach((campaign) => {
    const timestampSource = campaign.sentAt || campaign.updatedAt || campaign.createdAt
    if (!timestampSource) return
    const sortKey = new Date(timestampSource).getTime()
    if (Number.isNaN(sortKey)) return

    let variant = 'sent'
    if (campaign.status === 'failed') {
      variant = 'failed'
    } else if (!campaign.sentAt && campaign.status === 'scheduled') {
      variant = 'scheduled'
    } else if (campaign.status === 'draft') {
      variant = 'draft'
    }

    const recipients =
      campaign.sentCount ??
      campaign.recipientCount ??
      (Array.isArray(campaign.customers) ? campaign.customers.length : 0)

    items.push({
      id: campaign.id,
      variant,
      label:
        variant === 'scheduled'
          ? 'Campaign Scheduled'
          : variant === 'failed'
            ? 'Campaign Failed'
            : variant === 'draft'
              ? 'Draft Saved'
              : 'Messages Sent',
      description: `${campaign.name} - ${recipients} recipient${recipients === 1 ? '' : 's'}`,
      timestampText: formatMessageTime(timestampSource),
      sortKey,
    })
  })

  directMessages.forEach((message) => {
    const sortKey = message?.timestamp ? new Date(message.timestamp).getTime() : NaN
    if (Number.isNaN(sortKey)) return
    items.push({
      id: `direct-${message.id}`,
      variant: 'sent',
      label: 'Direct Message Sent',
      description: `${message.customerName || 'Customer'} - 1 recipient`,
      timestampText: formatMessageTime(message.timestamp),
      sortKey,
    })
  })

  return items
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      variant: item.variant,
      label: item.label,
      description: item.description,
      timestamp: item.timestampText,
    }))
}

const formatCurrencyValue = (value = 0) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '$0.00'
  return `$${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatCountValue = (value = 0) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '0'
  return numeric.toLocaleString()
}

const STAT_CARD_CONFIG = [
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    icon: 'DollarSign',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    formatValue: formatCurrencyValue,
  },
  {
    key: 'activeCustomers',
    title: 'Active Customers',
    icon: 'Users',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    formatValue: formatCountValue,
  },
  {
    key: 'messagesSent',
    title: 'Messages Sent',
    icon: 'MessageSquare',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    formatValue: formatCountValue,
  },
  {
    key: 'responseCount',
    title: 'Response Rate',
    icon: 'Target',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    formatValue: formatCountValue,
  },
  {
    key: 'recurringCustomers',
    title: 'Converted to Recurring',
    icon: 'RotateCw',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    formatValue: formatCountValue,
  },
  {
    key: 'reactivatedCustomers',
    title: 'Reactivated',
    icon: 'RefreshCw',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    formatValue: formatCountValue,
  },
  {
    key: 'optedOut',
    title: 'Opted Out',
    icon: 'LogOut',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    formatValue: formatCountValue,
  },
  {
    key: 'unreadMessages',
    title: 'Unread Messages',
    icon: 'MessageCircle',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    formatValue: formatCountValue,
  },
]

const buildStatCards = (metrics = {}) => {
  const merged = {
    totalRevenue: 0,
    activeCustomers: 0,
    messagesSent: 0,
    responseCount: 0,
    recurringCustomers: 0,
    reactivatedCustomers: 0,
    optedOut: 0,
    unreadMessages: 0,
    ...metrics,
  }

  return STAT_CARD_CONFIG.map((config) => ({
    id: config.key,
    title: config.title,
    icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
    value: config.formatValue
      ? config.formatValue(merged[config.key] ?? 0)
      : merged[config.key] ?? 0,
    change: config.change ?? '',
    changeDirection: config.changeDirection ?? 'neutral',
  }))
}

const hasBeenInactiveBefore = (customer) => {
  if (!customer) return false
  const history = Array.isArray(customer.statusHistory) ? customer.statusHistory : []
  const historyMatch = history.some((entry) => {
    if (!entry) return false
    if (typeof entry === 'string') {
      return entry.toLowerCase() === 'inactive'
    }
    if (typeof entry === 'object' && typeof entry.status === 'string') {
      return entry.status.toLowerCase() === 'inactive'
    }
    return false
  })
  if (historyMatch) return true

  const previousStatusFields = [
    customer.previousStatus,
    customer.priorStatus,
    customer.lastStatus,
  ]
  if (
    previousStatusFields.some(
      (status) => typeof status === 'string' && status.toLowerCase() === 'inactive'
    )
  ) {
    return true
  }

  if (customer.wasInactive === true) return true
  if (customer.reactivatedAt) return true
  return false
}

const computeDashboardMetrics = ({
  customers = [],
  campaigns = [],
  conversations = [],
  directMessages = [],
}) => {
  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpent || 0),
    0
  )

  const activeCustomers = customers.filter(
    (customer) => (customer.status || '').toLowerCase() === 'active'
  ).length

  const recurringCustomers = customers.filter(
    (customer) => (customer.type || '').toLowerCase() === 'recurring'
  ).length

  const reactivatedCustomers = customers.filter(
    (customer) =>
      (customer.status || '').toLowerCase() === 'active' && hasBeenInactiveBefore(customer)
  ).length

  const campaignMessagesSent = campaigns.reduce(
    (sum, campaign) =>
      sum + Number(campaign.sentCount ?? campaign.deliveredCount ?? campaign.recipientCount ?? 0),
    0
  )

  const directMessagesSent = Array.isArray(directMessages) ? directMessages.length : 0
  const messagesSent = campaignMessagesSent + directMessagesSent

  const responseCount = conversations.reduce((sum, conversation) => {
    const messages = Array.isArray(conversation.messages) ? conversation.messages : []
    const inboundCount = messages.filter(
      (message) => (message?.direction || '').toLowerCase() === 'inbound'
    ).length
    return sum + inboundCount
  }, 0)

  const unreadMessages = conversations.reduce(
    (sum, conversation) => sum + Number(conversation.unread_count || 0),
    0
  )

  const optedOut = customers.filter(
    (customer) => (customer.type || '').toLowerCase() === 'opted out'
  ).length

  return {
    totalRevenue,
    activeCustomers,
    messagesSent,
    responseCount,
    recurringCustomers,
    reactivatedCustomers,
    optedOut,
    unreadMessages,
  }
}

function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [statCards, setStatCards] = useState(() => buildStatCards())
  const [chartData, setChartData] = useState(null)
  const [chartTotals, setChartTotals] = useState({ sent: 0, delivered: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [hasSnapshot, setHasSnapshot] = useState(false)
  const metricsRef = useRef(null)

  useEffect(() => {
    if (!user?.id || authLoading) return
    let isCancelled = false

    const loadSnapshot = async () => {
      try {
        const snapshot = await getDashboardSnapshot(user.id)
        if (!snapshot || isCancelled) {
          setHasSnapshot(false)
          return
        }
        setHasSnapshot(true)

        if (snapshot.metrics) {
          metricsRef.current = snapshot.metrics
          setStatCards(buildStatCards(snapshot.metrics))
        } else {
          metricsRef.current = null
          setStatCards(buildStatCards())
        }

        if (snapshot.weekly_chart && snapshot.weekly_chart.length > 0) {
          const { chartData: storedChart, totals } = bucketsToChart(
            snapshot.weekly_chart
          )
          setChartData(storedChart)
          setChartTotals(totals)
        } else if (snapshot.metrics?.totals) {
          setChartTotals(snapshot.metrics.totals)
        }

        if (Array.isArray(snapshot.recent_activity)) {
          setRecentActivity(snapshot.recent_activity)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load dashboard snapshot:', error)
          toast.error('Failed to load dashboard snapshot')
        }
      }
    }

    loadSnapshot()
    return () => {
      isCancelled = true
    }
  }, [user?.id, authLoading, toast])

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      if (!user?.id || authLoading) return
      setIsDataLoading(true)
      try {
        const [campaignsResponse, customersResponse, conversationsResponse] = await Promise.all([
          getCampaigns(user.id),
          getCustomers(user.id),
          getCustomerConversations(user.id),
        ])
        if (isCancelled) return

        const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : []
        const customers = Array.isArray(customersResponse) ? customersResponse : []
        const conversations = Array.isArray(conversationsResponse) ? conversationsResponse : []

        const directMessages = extractDirectMessages(conversations)
        const chartMetrics = calculateChartMetrics(campaigns, directMessages)
        const activities = buildRecentActivity(campaigns, directMessages)
        setChartData(chartMetrics.chartData)
        setChartTotals(chartMetrics.totals)
        setRecentActivity(activities)

        const computedMetrics = computeDashboardMetrics({
          customers,
          campaigns,
          conversations,
          directMessages,
        })
        const metricsChanged =
          JSON.stringify(metricsRef.current || {}) !== JSON.stringify(computedMetrics)
        metricsRef.current = computedMetrics
        setStatCards(buildStatCards(computedMetrics))

        const hasMeaningfulChart = chartMetrics.buckets.some(
          (bucket) => bucket.sent > 0 || bucket.delivered > 0
        )
        const shouldPersist =
          hasMeaningfulChart || activities.length > 0 || !hasSnapshot || metricsChanged

        if (shouldPersist) {
          await saveDashboardSnapshot(user.id, {
            weekly_chart: chartMetrics.buckets,
            recent_activity: activities,
            metrics: { ...computedMetrics, totals: chartMetrics.totals },
            week_start: chartMetrics.buckets[0]?.iso || null,
            week_end: chartMetrics.buckets[chartMetrics.buckets.length - 1]?.iso || null,
            refreshed_at: new Date().toISOString(),
          })
          setHasSnapshot(true)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load dashboard data:', error)
          toast.error('Failed to load dashboard data')
        }
      } finally {
        if (!isCancelled) {
          setIsDataLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [user?.id, authLoading, toast, hasSnapshot])

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Welcome back! Here&apos;s what&apos;s happening today with your SMS
          campaigns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
        <div className="lg:col-span-2">
          <CampaignPerformanceChart
            data={chartData}
            totalSent={chartTotals.sent}
            totalDelivered={chartTotals.delivered}
            isLoading={isDataLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed
            activities={recentActivity}
            isLoading={isDataLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          <QuickActionButton
            icon="Send"
            label="Send Message"
            description="Send a message to your customers"
            path="/inbox"
          />
          <QuickActionButton
            icon="UserPlus"
            label="Add Customer"
            description="Add a new customer to your list"
            path="/customers"
          />
          <QuickActionButton
            icon="Zap"
            label="New Campaign"
            description="Launch a new SMS campaign"
            path="/campaigns"
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
