import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Activity,
    BadgeDollarSign,
    CheckCircle2,
    Download,
    Eye,
    FileText,
    Heart,
    MapPin,
    Megaphone,
    MessageCircle,
    MousePointer,
    Radio,
    Search,
    Users,
    Wallet,
} from 'lucide-react';

import { AdminMetricCard, AdminPanel } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

interface DashboardProps {
    platformStats: {
        totalUsers: number;
        totalCreators: number;
        totalPosts: number;
        totalAds: number;
        totalAdProviders: number;
        totalActiveCampaigns: number;
        totalAdSpaces: number;
        totalPendingWithdrawals: number;
        totalAppDownloads: number;
    };
    revenueStats: {
        totalPlatformRevenue: number;
        totalCreatorEarnings: number;
        totalViewerEarnings: number;
        totalWithdrawn: number;
        pendingWithdrawal: number;
        badgeRevenue?: number;
        monetizationRevenue?: number;
        adWalletFunding?: number;
        userEarnings?: number;
        allTransactionValue?: number;
    };
    financialTransactions: {
        summary: Record<string, { count: number; amount: number }>;
        recent: Array<any>;
        monetization_payers?: Array<any>;
    };
    dailyStats: {
        newUsers: number;
        newPosts: number;
        adImpressions: number;
        adClicks: number;
        dailyRevenue: number;
        dailyWithdrawals: number;
        appDownloadsToday: number;
    };
    recentActivities: {
        recentWithdrawals: Array<any>;
        recentEarnings: Array<any>;
        recentAds: Array<any>;
        recentPosts: Array<any>;
    };
    revenueChartData: Array<{ date: string; revenue: number }>;
    userGrowthChartData: Array<{ month: string; totalUsers: number; newUsers: number }>;
    adPerformanceChartData: Array<{ date: string; impressions: number; clicks: number; ctr: number }>;
    topCreators: Array<any>;
    topPosts: Array<any>;
    topAds: Array<any>;
    dashboardUsers: Array<any>;
    pendingAdCampaigns: Array<any>;
    pendingAdCreatives: Array<any>;
    activeUsers: Array<any>;
    userActivityReport: {
        active_user_count: number;
        online_user_count: number;
        login_24h_count: number;
        online_users: Array<any>;
        login_24h_users: Array<any>;
    };
    userLocationReport?: {
        tracked_user_count: number;
        profile_location_count?: number;
        top_locations: Array<any>;
        recent_users: Array<any>;
    };
    monthlyPlatformReport: {
        months: Array<{
            month: string;
            label: string;
            onboarded_users: number;
            cumulative_users: number;
            active_accounts: number;
            inactive_accounts: number;
            active_users: number;
            badge_revenue: number;
            monetization_revenue: number;
            ad_wallet_revenue: number;
            total_revenue: number;
        }>;
        summary: {
            total_onboarded: number;
            active_accounts: number;
            inactive_accounts: number;
            active_users: number;
            badge_revenue: number;
            monetization_revenue: number;
            ad_wallet_revenue: number;
            total_revenue: number;
        };
    };
    liveStreams: Array<any>;
    recentEngagement: Array<any>;
    filters: {
        user_search?: string;
        badge_payments?: boolean;
    };
    interfaceBalance?: {
        balance: number;
        available_balance: number;
    } | null;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const formatCompactCurrency = (amount: number) => {
    const numericAmount = Number(amount || 0);

    if (numericAmount >= 1_000_000_000) return `NGN ${(numericAmount / 1_000_000_000).toFixed(1)}B`;
    if (numericAmount >= 1_000_000) return `NGN ${(numericAmount / 1_000_000).toFixed(1)}M`;
    if (numericAmount >= 1_000) return `NGN ${(numericAmount / 1_000).toFixed(1)}K`;

    return formatCurrency(numericAmount);
};

const compactNumber = (value: number) =>
    new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(Number(value || 0));

const MAP_TILE_SIZE = 256;
const MAP_VIEWPORT_WIDTH = 1024;
const MAP_VIEWPORT_HEIGHT = 380;

const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    nigeria: { lat: 9.082, lng: 8.6753 },
    ghana: { lat: 7.9465, lng: -1.0232 },
    kenya: { lat: -0.0236, lng: 37.9062 },
    'south africa': { lat: -30.5595, lng: 22.9375 },
    'united kingdom': { lat: 55.3781, lng: -3.436 },
    'united states': { lat: 39.8283, lng: -98.5795 },
    canada: { lat: 56.1304, lng: -106.3468 },
};

const NIGERIA_STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
    abia: { lat: 5.532, lng: 7.486 },
    abuja: { lat: 9.0765, lng: 7.3986 },
    adamawa: { lat: 9.3265, lng: 12.3984 },
    'akwa ibom': { lat: 5.0077, lng: 7.8537 },
    anambra: { lat: 6.2209, lng: 6.9369 },
    bauchi: { lat: 10.3158, lng: 9.8442 },
    bayelsa: { lat: 4.7719, lng: 6.0699 },
    benue: { lat: 7.3369, lng: 8.7404 },
    borno: { lat: 11.8846, lng: 13.151 },
    'cross river': { lat: 5.8702, lng: 8.5988 },
    delta: { lat: 5.704, lng: 5.9339 },
    ebonyi: { lat: 6.2649, lng: 8.0137 },
    edo: { lat: 6.335, lng: 5.6037 },
    ekiti: { lat: 7.719, lng: 5.311 },
    enugu: { lat: 6.5364, lng: 7.4356 },
    fct: { lat: 9.0765, lng: 7.3986 },
    gombe: { lat: 10.2897, lng: 11.1673 },
    imo: { lat: 5.485, lng: 7.0351 },
    jigawa: { lat: 12.228, lng: 9.5616 },
    kaduna: { lat: 10.5105, lng: 7.4165 },
    kano: { lat: 12.0022, lng: 8.592 },
    katsina: { lat: 12.9908, lng: 7.6018 },
    kebbi: { lat: 12.4504, lng: 4.1999 },
    kogi: { lat: 7.7337, lng: 6.6906 },
    kwara: { lat: 8.9669, lng: 4.3874 },
    lagos: { lat: 6.5244, lng: 3.3792 },
    nasarawa: { lat: 8.4998, lng: 8.1997 },
    niger: { lat: 9.9309, lng: 5.5983 },
    ogun: { lat: 7.1557, lng: 3.3451 },
    ondo: { lat: 7.25, lng: 5.195 },
    osun: { lat: 7.5629, lng: 4.52 },
    oyo: { lat: 7.3775, lng: 3.947 },
    plateau: { lat: 9.2182, lng: 9.5179 },
    rivers: { lat: 4.8156, lng: 7.0498 },
    sokoto: { lat: 13.0059, lng: 5.2476 },
    taraba: { lat: 8.8937, lng: 11.359 },
    yobe: { lat: 12.2939, lng: 11.439 },
    zamfara: { lat: 12.1704, lng: 6.6641 },
};

const normalizeLocationKey = (value: unknown) =>
    String(value || '')
        .trim()
        .toLowerCase();

const isValidCoordinate = (lat: number, lng: number) =>
    Number.isFinite(lat) && Number.isFinite(lng) && lat >= -85 && lat <= 85 && lng >= -180 && lng <= 180;

const coordinatesForLocation = (location: any) => {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);

    if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
    }

    const country = normalizeLocationKey(location.country);
    const state = normalizeLocationKey(location.state);
    const city = normalizeLocationKey(location.city);
    const label = normalizeLocationKey(location.location_name || `${city} ${state} ${country}`);
    const nigeriaPoint =
        country.includes('nigeria') || label.includes('nigeria')
            ? NIGERIA_STATE_COORDINATES[state] || NIGERIA_STATE_COORDINATES[city]
            : undefined;

    return (
        nigeriaPoint ||
        COUNTRY_COORDINATES[country] ||
        Object.entries(COUNTRY_COORDINATES).find(([key]) => label.includes(key))?.[1] ||
        null
    );
};

const clampLatitude = (lat: number) => Math.max(-85.05112878, Math.min(85.05112878, lat));

const latLngToWorldPixel = (lat: number, lng: number, zoom: number) => {
    const scale = MAP_TILE_SIZE * 2 ** zoom;
    const sinLat = Math.sin((clampLatitude(lat) * Math.PI) / 180);

    return {
        x: ((lng + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
    };
};

const zoomForCoordinateSpan = (latSpan: number, lngSpan: number) => {
    const span = Math.max(latSpan, lngSpan);

    if (span > 95) return 2;
    if (span > 45) return 3;
    if (span > 18) return 4;
    if (span > 8) return 5;
    if (span > 3) return 6;
    if (span > 1) return 8;

    return 10;
};

const buildTileMapView = (points: Array<any>) => {
    const coordinates = points
        .map((point) => ({
            ...point,
            coordinate: coordinatesForLocation(point),
        }))
        .filter((point) => point.coordinate !== null) as Array<any & { coordinate: { lat: number; lng: number } }>;
    const center = coordinates.length
        ? {
            lat: coordinates.reduce((sum, point) => sum + point.coordinate.lat, 0) / coordinates.length,
            lng: coordinates.reduce((sum, point) => sum + point.coordinate.lng, 0) / coordinates.length,
        }
        : COUNTRY_COORDINATES.nigeria;
    const latValues = coordinates.map((point) => point.coordinate.lat);
    const lngValues = coordinates.map((point) => point.coordinate.lng);
    const zoom = coordinates.length
        ? zoomForCoordinateSpan(
            Math.max(...latValues) - Math.min(...latValues),
            Math.max(...lngValues) - Math.min(...lngValues),
        )
        : 5;
    const tileCount = 2 ** zoom;
    const centerPixel = latLngToWorldPixel(center.lat, center.lng, zoom);
    const origin = {
        x: centerPixel.x - MAP_VIEWPORT_WIDTH / 2,
        y: centerPixel.y - MAP_VIEWPORT_HEIGHT / 2,
    };
    const startTileX = Math.floor(origin.x / MAP_TILE_SIZE);
    const endTileX = Math.floor((origin.x + MAP_VIEWPORT_WIDTH) / MAP_TILE_SIZE);
    const startTileY = Math.floor(origin.y / MAP_TILE_SIZE);
    const endTileY = Math.floor((origin.y + MAP_VIEWPORT_HEIGHT) / MAP_TILE_SIZE);
    const tiles = [];

    for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
        for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
            if (tileY < 0 || tileY >= tileCount) continue;

            const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;
            tiles.push({
                key: `${zoom}-${wrappedX}-${tileY}-${tileX}`,
                x: wrappedX,
                y: tileY,
                z: zoom,
                left: ((tileX * MAP_TILE_SIZE - origin.x) / MAP_VIEWPORT_WIDTH) * 100,
                top: ((tileY * MAP_TILE_SIZE - origin.y) / MAP_VIEWPORT_HEIGHT) * 100,
                width: (MAP_TILE_SIZE / MAP_VIEWPORT_WIDTH) * 100,
                height: (MAP_TILE_SIZE / MAP_VIEWPORT_HEIGHT) * 100,
            });
        }
    }

    return {
        center,
        zoom,
        tiles,
        markers: coordinates.map((point, index) => {
            const pixel = latLngToWorldPixel(point.coordinate.lat, point.coordinate.lng, zoom);

            return {
                ...point,
                key: `${point.location_name || point.ip_address || 'location'}-${index}`,
                lat: point.coordinate.lat,
                lng: point.coordinate.lng,
                x: ((pixel.x - origin.x) / MAP_VIEWPORT_WIDTH) * 100,
                y: ((pixel.y - origin.y) / MAP_VIEWPORT_HEIGHT) * 100,
            };
        }),
    };
};

const engagementIcon = (type: string) => {
    if (type === 'view') return Eye;
    if (type === 'like') return Heart;
    if (type === 'comment' || type === 'live_comment') return MessageCircle;
    return Radio;
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#07111f',
            borderColor: 'rgba(125, 211, 252, 0.35)',
            borderWidth: 1,
            padding: 12,
            titleColor: '#e0f2fe',
            bodyColor: '#f8fafc',
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#94a3b8',
                maxTicksLimit: 6,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(148, 163, 184, 0.14)',
            },
            ticks: {
                color: '#94a3b8',
            },
        },
    },
};

function StatTile({
    label,
    value,
    hint,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string;
    hint: string;
    icon: typeof Users;
    accent: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(2,6,23,0.08)] backdrop-blur transition hover:-translate-y-1 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_80px_rgba(2,6,23,0.18)] dark:hover:bg-white/[0.1]">
            <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${accent}`} />
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">{label}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{hint}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function QueueButton({
    isLoading,
    onClick,
}: {
    isLoading: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            size="sm"
            onClick={onClick}
            disabled={isLoading}
            className="rounded-full bg-[#10b981] text-white shadow-lg shadow-emerald-500/20 hover:bg-[#059669]"
        >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Approving...' : 'Approve'}
        </Button>
    );
}

const polluxPanelClass =
    'rounded border border-slate-200 bg-white p-5 shadow-sm dark:border-[#34364f] dark:bg-[#242638]';

function TinyLine({ tone = 'orange' }: { tone?: 'orange' | 'blue' | 'teal' }) {
    const stroke = tone === 'orange' ? '#ff9f2f' : tone === 'teal' ? '#55d6d2' : '#3ca0ff';

    return (
        <svg viewBox="0 0 220 70" className="mt-3 h-16 w-full overflow-visible">
            <defs>
                <linearGradient id={`tiny-line-${tone}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d="M8 60 L28 28 L48 40 L66 31 L84 62 L102 27 L122 58 L142 36 L162 46 L180 30 L200 38 L216 27 L216 70 L8 70 Z" fill={`url(#tiny-line-${tone})`} />
            <path d="M8 60 L28 28 L48 40 L66 31 L84 62 L102 27 L122 58 L142 36 L162 46 L180 30 L200 38 L216 27" fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
        </svg>
    );
}

function TinyBars({ colors = ['#3ca0ff', '#b9c7d9'] }: { colors?: string[] }) {
    const heights = [30, 38, 44, 34, 28, 40, 48, 52, 36, 32, 42, 46, 35, 31, 39, 50, 57, 43, 37, 45, 52, 60, 46, 33];

    return (
        <div className="mt-5 flex h-12 items-end gap-1">
            {heights.map((height, index) => (
                <span
                    key={`${height}-${index}`}
                    className="w-1.5 rounded-t-sm"
                    style={{
                        height,
                        backgroundColor: index > heights.length - 6 ? colors[1] : colors[0],
                    }}
                />
            ))}
        </div>
    );
}

export default function Dashboard({
    platformStats,
    revenueStats,
    financialTransactions,
    dailyStats,
    recentActivities,
    revenueChartData,
    userGrowthChartData,
    adPerformanceChartData,
    topCreators,
    topPosts,
    dashboardUsers,
    pendingAdCampaigns,
    pendingAdCreatives,
    activeUsers,
    userActivityReport,
    userLocationReport,
    monthlyPlatformReport,
    liveStreams,
    recentEngagement,
    filters,
    interfaceBalance,
}: DashboardProps) {
    const [userSearch, setUserSearch] = useState(filters.user_search || '');
    const showingBadgePayments = Boolean(filters.badge_payments);
    const [approvingAdId, setApprovingAdId] = useState<string | null>(null);

    const handleUserSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            admin.dashboard.url(),
            {
                user_search: userSearch.trim() || undefined,
                badge_payments: showingBadgePayments ? 1 : undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const approveCampaign = (id: string) => {
        setApprovingAdId(`campaign-${id}`);
        router.post(admin.v2.ads.moderation.campaigns.approve(id).url, {}, {
            preserveScroll: true,
            onFinish: () => setApprovingAdId(null),
        });
    };

    const approveCreative = (id: string) => {
        setApprovingAdId(`creative-${id}`);
        router.post(admin.v2.ads.moderation.creatives.approve(id).url, {}, {
            preserveScroll: true,
            onFinish: () => setApprovingAdId(null),
        });
    };

    const revenueLineData = {
        labels: revenueChartData.map((point) => new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                data: revenueChartData.map((point) => Number(point.revenue || 0)),
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                fill: true,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 5,
            },
        ],
    };

    const userBarData = {
        labels: userGrowthChartData.map((point) => point.month),
        datasets: [
            {
                label: 'New users',
                data: userGrowthChartData.map((point) => Number(point.newUsers || 0)),
                backgroundColor: 'rgba(16, 185, 129, 0.82)',
                borderRadius: 14,
            },
            {
                label: 'Total users',
                data: userGrowthChartData.map((point) => Number(point.totalUsers || 0)),
                backgroundColor: 'rgba(56, 189, 248, 0.42)',
                borderRadius: 14,
            },
        ],
    };

    const adPerformanceData = {
        labels: adPerformanceChartData.map((point) => new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Impressions',
                data: adPerformanceChartData.map((point) => Number(point.impressions || 0)),
                backgroundColor: 'rgba(251, 191, 36, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Clicks',
                data: adPerformanceChartData.map((point) => Number(point.clicks || 0)),
                backgroundColor: 'rgba(244, 63, 94, 0.68)',
                borderRadius: 12,
            },
        ],
    };

    const incomeAreaData = {
        labels: revenueChartData.length
            ? revenueChartData.map((point) => new Date(point.date).toLocaleDateString('en', { month: 'short' }))
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Register User',
                data: revenueChartData.length
                    ? revenueChartData.map((point) => Number(point.revenue || 0))
                    : [80, 175, 80, 198, 140, 180, 70],
                borderColor: '#b34cf4',
                backgroundColor: 'rgba(179, 76, 244, 0.18)',
                fill: true,
                tension: 0.44,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
            {
                label: 'Premium User',
                data: revenueChartData.length
                    ? revenueChartData.map((point) => Number(point.revenue || 0) * 1.7 + 120)
                    : [200, 340, 205, 338, 220, 310, 190],
                borderColor: '#55d6d2',
                backgroundColor: 'rgba(85, 214, 210, 0.14)',
                fill: true,
                tension: 0.44,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    const revenueMixData = {
        labels: ['Platform', 'Creators', 'Viewers', 'Withdrawn'],
        datasets: [
            {
                data: [
                    Number(revenueStats.totalPlatformRevenue || 0),
                    Number(revenueStats.totalCreatorEarnings || 0),
                    Number(revenueStats.totalViewerEarnings || 0),
                    Number(revenueStats.totalWithdrawn || 0),
                ],
                backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#f43f5e'],
                borderColor: '#08111f',
                borderWidth: 4,
                hoverOffset: 8,
            },
        ],
    };

    const activityRows = recentActivities.recentWithdrawals?.slice(0, 5) ?? [];
    const creatorRows = topCreators?.slice(0, 5) ?? [];
    const topPostRows = topPosts?.slice(0, 5) ?? [];
    const pendingApprovalCount = pendingAdCampaigns.length + pendingAdCreatives.length;
    const ctr = dailyStats.adImpressions > 0 ? (dailyStats.adClicks / dailyStats.adImpressions) * 100 : 0;
    const financeSummary = financialTransactions?.summary ?? {};
    const recentFinanceRows = financialTransactions?.recent?.slice(0, 8) ?? [];
    const monetizationPayers = financialTransactions?.monetization_payers ?? [];
    const onlineReportRows = userActivityReport?.online_users?.slice(0, 8) ?? activeUsers.slice(0, 8);
    const login24hRows = userActivityReport?.login_24h_users?.slice(0, 8) ?? [];
    const locationRows = userLocationReport?.recent_users?.slice(0, 10) ?? [];
    const topLocationRows = userLocationReport?.top_locations?.slice(0, 6) ?? [];
    const locationMapView = buildTileMapView(topLocationRows);
    const monthlyRows = monthlyPlatformReport?.months ?? [];
    const monthlySummary = monthlyPlatformReport?.summary ?? {
        total_onboarded: 0,
        active_accounts: 0,
        inactive_accounts: 0,
        active_users: 0,
        badge_revenue: 0,
        monetization_revenue: 0,
        ad_wallet_revenue: 0,
        total_revenue: 0,
    };
    const monthlyLabels = monthlyRows.map((row) => row.label);
    const monthlyUserData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Onboarded users',
                data: monthlyRows.map((row) => Number(row.onboarded_users || 0)),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.18)',
                fill: true,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
            {
                label: 'Cumulative users',
                data: monthlyRows.map((row) => Number(row.cumulative_users || 0)),
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                fill: false,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };
    const monthlyRevenueData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Badge payments',
                data: monthlyRows.map((row) => Number(row.badge_revenue || 0)),
                backgroundColor: 'rgba(16, 185, 129, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Monetization',
                data: monthlyRows.map((row) => Number(row.monetization_revenue || 0)),
                backgroundColor: 'rgba(168, 85, 247, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Ads wallet',
                data: monthlyRows.map((row) => Number(row.ad_wallet_revenue || 0)),
                backgroundColor: 'rgba(14, 165, 233, 0.82)',
                borderRadius: 12,
            },
        ],
    };
    const monthlyAccountData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Active accounts',
                data: monthlyRows.map((row) => Number(row.active_accounts || 0)),
                backgroundColor: 'rgba(34, 197, 94, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Inactive accounts',
                data: monthlyRows.map((row) => Number(row.inactive_accounts || 0)),
                backgroundColor: 'rgba(248, 113, 113, 0.74)',
                borderRadius: 12,
            },
        ],
    };
    const monthlyActiveUsersData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Active users',
                data: monthlyRows.map((row) => Number(row.active_users || 0)),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                fill: true,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };
    const monthlyStackedOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                stacked: true,
            },
            y: {
                ...chartOptions.scales.y,
                stacked: true,
            },
        },
    };
    const monthlyLineOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: true,
                position: 'bottom' as const,
            },
        },
    };
    const monthlyStackedLegendOptions = {
        ...monthlyStackedOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: true,
                position: 'bottom' as const,
            },
        },
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout>
                <div className="space-y-6">
                    <section className="grid gap-6 xl:grid-cols-[1fr,0.95fr]">
                        <div className="space-y-5">
                            <h2 className="karads-heading text-2xl font-semibold text-slate-700 dark:text-slate-300">Status statistics</h2>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className={polluxPanelClass}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-500">Transactions</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-300">{compactNumber(platformStats.totalPosts)}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">+1.37%</span>
                                    </div>
                                    <TinyLine />
                                </div>

                                <div className={polluxPanelClass}>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-slate-500">Sales</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-300">{compactNumber(platformStats.totalAds)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Orders</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-300">{compactNumber(platformStats.totalActiveCampaigns)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Revenue</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-300">{compactNumber(revenueStats.totalPlatformRevenue)}</p>
                                        </div>
                                    </div>
                                    <TinyLine tone="blue" />
                                </div>

                                <div className={polluxPanelClass}>
                                    <p className="text-sm text-slate-500">Sales Analytics</p>
                                    <div className="mt-2 flex items-end justify-between">
                                        <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{compactNumber(dailyStats.adImpressions)}</p>
                                        <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{ctr.toFixed(0)}%</p>
                                    </div>
                                    <TinyBars />
                                </div>

                                <div className={polluxPanelClass}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500">CPU</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-300">{compactNumber(platformStats.totalUsers)}</p>
                                            <TinyBars colors={['#ef3d5d', '#ff5b70']} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Memory</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-300">{compactNumber(platformStats.totalAppDownloads)}</p>
                                            <TinyBars colors={['#55d6d2', '#67e8f9']} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h2 className="karads-heading text-2xl font-semibold text-slate-700 dark:text-slate-300">Income statistics</h2>
                            <div className={cn(polluxPanelClass, 'min-h-[374px]')}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-300">Monthly Increase</p>
                                        <p className="mt-4 text-4xl font-bold text-slate-700 dark:text-slate-300">{compactNumber(revenueStats.totalPlatformRevenue)}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-300">
                                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#b34cf4]" /> Register User</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#55d6d2]" /> Premium User</span>
                                    </div>
                                </div>
                                <div className="mt-4 h-64">
                                    <Line options={chartOptions} data={incomeAreaData} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[0.9fr,0.9fr,0.9fr]">
                        <div className={cn(polluxPanelClass, 'min-h-[320px]')}>
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-semibold uppercase text-slate-600 dark:text-slate-300">Overall Sales</p>
                                <Button size="sm" className="rounded bg-[#8d50d7] px-4 text-white hover:bg-[#7d43c8]">Last 30 days</Button>
                            </div>
                            <div className="mx-auto h-56 max-w-xs">
                                <Doughnut
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                    }}
                                    data={revenueMixData}
                                />
                            </div>
                        </div>

                        <div className="flex min-h-[320px] flex-col items-center justify-center rounded bg-gradient-to-br from-[#ffd089] via-[#ff9b5f] to-[#f56a3e] p-8 text-center text-white shadow-sm">
                            <h3 className="text-2xl font-medium">Newsletter</h3>
                            <Input placeholder="email address" className="mt-4 h-11 max-w-[260px] rounded-full border-0 bg-white/70 text-center text-slate-800 placeholder:text-slate-700" />
                            <Button className="mt-3 rounded-full bg-[#e93152] px-10 text-white hover:bg-[#d52647]">Subscribe</Button>
                        </div>

                        <div className={cn(polluxPanelClass, 'min-h-[320px]')}>
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-semibold uppercase text-slate-600 dark:text-slate-300">Sales Statistics</p>
                                <Button size="sm" className="rounded bg-[#8d50d7] px-4 text-white hover:bg-[#7d43c8]">Last 7 days</Button>
                            </div>
                            <div className="h-56">
                                <Bar options={chartOptions} data={adPerformanceData} />
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
                        <StatTile label="Users" value={compactNumber(platformStats.totalUsers)} hint={`${dailyStats.newUsers} joined today`} icon={Users} accent="bg-cyan-400/30" />
                        <StatTile label="Posts" value={compactNumber(platformStats.totalPosts)} hint={`${dailyStats.newPosts} new today`} icon={FileText} accent="bg-emerald-400/30" />
                        <StatTile label="Revenue" value={formatCompactCurrency(revenueStats.totalPlatformRevenue)} hint="Billable ad revenue" icon={BadgeDollarSign} accent="bg-sky-400/30" />
                        <StatTile label="Pending Withdrawals" value={compactNumber(platformStats.totalPendingWithdrawals)} hint={formatCurrency(revenueStats.pendingWithdrawal)} icon={Wallet} accent="bg-amber-400/30" />
                        <StatTile label="Total Withdrawn" value={formatCompactCurrency(revenueStats.totalWithdrawn)} hint={`${compactNumber(financeSummary.withdrawals?.count ?? 0)} requests`} icon={Wallet} accent="bg-rose-400/30" />
                        <StatTile label="Downloads" value={compactNumber(platformStats.totalAppDownloads)} hint={`${dailyStats.appDownloadsToday} today`} icon={Download} accent="bg-rose-400/30" />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
                        <AdminPanel title="Financials" description="All money movement from badge payments, ad wallet funding, earnings, ledgers, and withdrawals." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Badge payments</p>
                                    <p className="mt-2 text-2xl font-black">{formatCurrency(financeSummary.badge_payments?.amount ?? 0)}</p>
                                    <p className="text-xs text-muted-foreground">{compactNumber(financeSummary.badge_payments?.count ?? 0)} transactions</p>
                                </div>
                                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-400/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">Monetization payments</p>
                                    <p className="mt-2 text-2xl font-black">{formatCurrency(financeSummary.monetization_payments?.amount ?? revenueStats.monetizationRevenue ?? 0)}</p>
                                    <p className="text-xs text-muted-foreground">{compactNumber(financeSummary.monetization_payments?.count ?? 0)} paid users</p>
                                </div>
                                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">Ad wallet funding</p>
                                    <p className="mt-2 text-2xl font-black">{formatCurrency(financeSummary.ad_wallet_payments?.amount ?? 0)}</p>
                                    <p className="text-xs text-muted-foreground">{compactNumber(financeSummary.ad_wallet_payments?.count ?? 0)} payments</p>
                                </div>
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">User earnings</p>
                                    <p className="mt-2 text-2xl font-black">{formatCurrency(financeSummary.user_earnings?.amount ?? 0)}</p>
                                    <p className="text-xs text-muted-foreground">{compactNumber(financeSummary.user_earnings?.count ?? 0)} earning records</p>
                                </div>
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/20 dark:bg-rose-400/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-200">Total withdrawals</p>
                                    <p className="mt-2 text-2xl font-black">{formatCurrency(revenueStats.totalWithdrawn ?? 0)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Today {formatCurrency(dailyStats.dailyWithdrawals ?? 0)} · {formatCurrency(revenueStats.pendingWithdrawal ?? 0)} pending
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">{compactNumber(financeSummary.withdrawals?.count ?? 0)} total requests</p>
                                </div>
                                <div className={`rounded-2xl border p-4 ${
                                    interfaceBalance == null
                                        ? 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                                        : interfaceBalance.available_balance < 50000
                                        ? 'border-red-300 bg-red-50 dark:border-red-400/30 dark:bg-red-400/10'
                                        : interfaceBalance.available_balance < 200000
                                        ? 'border-amber-300 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-400/10'
                                        : 'border-teal-200 bg-teal-50 dark:border-teal-400/20 dark:bg-teal-400/10'
                                }`}>
                                    <p className={`text-xs font-bold uppercase tracking-[0.18em] ${
                                        interfaceBalance == null
                                            ? 'text-slate-500'
                                            : interfaceBalance.available_balance < 50000
                                            ? 'text-red-700 dark:text-red-300'
                                            : interfaceBalance.available_balance < 200000
                                            ? 'text-amber-700 dark:text-amber-300'
                                            : 'text-teal-700 dark:text-teal-200'
                                    }`}>Kwatibank Float</p>
                                    <p className="mt-2 text-2xl font-black">
                                        {interfaceBalance != null ? formatCurrency(interfaceBalance.available_balance) : '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {interfaceBalance != null
                                            ? interfaceBalance.available_balance < 50000
                                                ? 'Critical — top up needed now'
                                                : interfaceBalance.available_balance < 200000
                                                ? 'Running low'
                                                : 'Payout account balance'
                                            : 'Unable to fetch'}
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {interfaceBalance != null ? `Ledger: ${formatCurrency(interfaceBalance.balance)}` : 'Account 9625761482'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 overflow-x-auto rounded-2xl border border-violet-200 dark:border-violet-400/20">
                                <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50 px-4 py-3 dark:border-violet-400/10 dark:bg-violet-400/10">
                                    <div>
                                        <p className="font-bold">People who paid for monetization</p>
                                        <p className="text-xs text-muted-foreground">
                                            Total paid: {formatCurrency(financeSummary.monetization_payments?.amount ?? 0)}
                                        </p>
                                    </div>
                                    <Badge className="bg-violet-600 text-white hover:bg-violet-600">
                                        {compactNumber(financeSummary.monetization_payments?.count ?? 0)} users
                                    </Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>User</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Wallet balance</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Paid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monetizationPayers.length ? monetizationPayers.map((payer) => (
                                            <TableRow key={payer.id}>
                                                <TableCell>
                                                    <span className="font-semibold">{payer.name || 'Unknown user'}</span>
                                                    <span className="block text-xs text-muted-foreground">{payer.email || `@${payer.username}`}</span>
                                                </TableCell>
                                                <TableCell>{formatCurrency(Number(payer.amount || 0))}</TableCell>
                                                <TableCell>{formatCurrency(Number(payer.wallet_balance || 0))}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">{String(payer.provider || 'unknown').replaceAll('_', ' ')}</Badge>
                                                    {payer.reference ? <span className="mt-1 block max-w-[180px] truncate text-xs text-muted-foreground">{payer.reference}</span> : null}
                                                </TableCell>
                                                <TableCell>{payer.paid_at ? new Date(payer.paid_at).toLocaleString() : 'Recorded'}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No monetization payments recorded yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>Type</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentFinanceRows.length ? recentFinanceRows.map((row) => (
                                            <TableRow key={`${row.type}-${row.id}`}>
                                                <TableCell className="font-medium">{row.type}</TableCell>
                                                <TableCell>
                                                    <span>{row.user?.name || 'Platform'}</span>
                                                    {row.user?.email ? <span className="block text-xs text-muted-foreground">{row.user.email}</span> : null}
                                                </TableCell>
                                                <TableCell>{formatCurrency(Number(row.amount || 0))}</TableCell>
                                                <TableCell><Badge variant="secondary" className="capitalize">{String(row.status || 'recorded').replaceAll('_', ' ')}</Badge></TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No financial transactions recorded yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>

                        <AdminPanel title="Live and active now" description="People currently online plus streams broadcasting right now." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Active accounts</p>
                                    <p className="mt-1 text-2xl font-black">{compactNumber(userActivityReport?.active_user_count ?? 0)}</p>
                                </div>
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Online now</p>
                                    <p className="mt-1 text-2xl font-black">{compactNumber(userActivityReport?.online_user_count ?? activeUsers.length)}</p>
                                </div>
                                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-400/20 dark:bg-sky-400/10">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">Login 24hrs</p>
                                    <p className="mt-1 text-2xl font-black">{compactNumber(userActivityReport?.login_24h_count ?? 0)}</p>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="font-semibold">Online users</p>
                                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{onlineReportRows.length} shown</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {onlineReportRows.length ? onlineReportRows.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{user.username || 'user'} · {user.last_seen_at ? new Date(user.last_seen_at).toLocaleTimeString() : 'online'}</p>
                                                </div>
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
                                            </div>
                                        )) : <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground dark:border-white/10">No active users detected in the last few minutes.</p>}
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="font-semibold">Logged in within 24hrs</p>
                                        <Badge variant="outline">{login24hRows.length} shown</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {login24hRows.length ? login24hRows.map((user) => (
                                            <div key={user.id} className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                                                <p className="font-medium">{user.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    @{user.username || 'user'} · {user.last_activity_at ? new Date(user.last_activity_at).toLocaleString() : 'recent activity'}
                                                </p>
                                            </div>
                                        )) : <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground dark:border-white/10">No users detected in the last 24 hours yet.</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="font-semibold">Live streams</p>
                                    <Badge variant="outline">{liveStreams.length} live</Badge>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {liveStreams.length ? liveStreams.map((stream) => (
                                        <div key={stream.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-medium">{stream.title}</p>
                                                <Badge className="bg-rose-600 text-white hover:bg-rose-600">Live</Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">{stream.user?.name || 'Unknown host'} · {compactNumber(stream.viewer_count || 0)} viewers</p>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground">No one is live right now.</p>}
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="font-semibold">People engagement</p>
                                    <Badge variant="outline">{recentEngagement.length} recent</Badge>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {recentEngagement.length ? recentEngagement.slice(0, 12).map((item) => {
                                        const Icon = engagementIcon(item.type);

                                        return (
                                            <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                                                <div className="flex items-start gap-3">
                                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold">
                                                            {item.user?.name || 'Someone'} {item.action}
                                                        </p>
                                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                                            {item.target?.title || item.content || 'Karaads activity'}
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            {item.created_at ? new Date(item.created_at).toLocaleString() : 'recently'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-sm text-muted-foreground">No engagement recorded yet.</p>}
                                </div>
                            </div>
                        </AdminPanel>
                    </section>

                    <section className="grid gap-6">
                        <AdminPanel
                            title="Month-on-month platform report"
                            description="Onboarded users, revenue, and account activity from the first tracked month to today."
                            className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30"
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <AdminMetricCard
                                    label="Total onboarded"
                                    value={compactNumber(monthlySummary.total_onboarded)}
                                    hint="All users tracked month on month"
                                    icon={Users}
                                    tone="success"
                                />
                                <AdminMetricCard
                                    label="Active accounts"
                                    value={compactNumber(monthlySummary.active_accounts)}
                                    hint="Accounts currently active by status"
                                    icon={Activity}
                                    tone="default"
                                />
                                <AdminMetricCard
                                    label="Inactive accounts"
                                    value={compactNumber(monthlySummary.inactive_accounts)}
                                    hint="Accounts currently inactive by status"
                                    icon={Users}
                                    tone="danger"
                                />
                                <AdminMetricCard
                                    label="Active users"
                                    value={compactNumber(monthlySummary.active_users)}
                                    hint="Users seen active by login month"
                                    icon={Radio}
                                    tone="warning"
                                />
                            </div>

                            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Onboarded vs cumulative users</p>
                                            <p className="text-xs text-muted-foreground">New signups and total users tracked every month.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-64">
                                        <Line options={monthlyLineOptions} data={monthlyUserData} />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Revenue by source</p>
                                            <p className="text-xs text-muted-foreground">Badge payments, monetization, and ads wallet funding.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-64">
                                        <Bar options={monthlyStackedLegendOptions} data={monthlyRevenueData} />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Active vs inactive accounts</p>
                                            <p className="text-xs text-muted-foreground">Accounts grouped by current status for each onboarding month.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-64">
                                        <Bar options={monthlyStackedLegendOptions} data={monthlyAccountData} />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Active users by login month</p>
                                            <p className="text-xs text-muted-foreground">Current active accounts with recorded login activity.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-64">
                                        <Line options={monthlyLineOptions} data={monthlyActiveUsersData} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>Month</TableHead>
                                            <TableHead>Onboarded</TableHead>
                                            <TableHead>Cumulative</TableHead>
                                            <TableHead>Active</TableHead>
                                            <TableHead>Inactive</TableHead>
                                            <TableHead>Active users</TableHead>
                                            <TableHead>Badge revenue</TableHead>
                                            <TableHead>Monetization</TableHead>
                                            <TableHead>Ads wallet</TableHead>
                                            <TableHead>Total revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthlyRows.length ? monthlyRows.map((row) => (
                                            <TableRow key={row.month}>
                                                <TableCell className="font-medium">{row.label}</TableCell>
                                                <TableCell>{compactNumber(row.onboarded_users)}</TableCell>
                                                <TableCell>{compactNumber(row.cumulative_users)}</TableCell>
                                                <TableCell>{compactNumber(row.active_accounts)}</TableCell>
                                                <TableCell>{compactNumber(row.inactive_accounts)}</TableCell>
                                                <TableCell>{compactNumber(row.active_users)}</TableCell>
                                                <TableCell>{formatCurrency(Number(row.badge_revenue || 0))}</TableCell>
                                                <TableCell>{formatCurrency(Number(row.monetization_revenue || 0))}</TableCell>
                                                <TableCell>{formatCurrency(Number(row.ad_wallet_revenue || 0))}</TableCell>
                                                <TableCell className="font-semibold">{formatCurrency(Number(row.total_revenue || 0))}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                                    No monthly report data available yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </section>

                    <AdminPanel title="People location" description="Saved profile locations are shown first, with login activity used as fallback." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                        <div className="mb-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Tracked people</p>
                                <p className="mt-2 text-3xl font-black">{compactNumber(userLocationReport?.tracked_user_count ?? 0)}</p>
                            </div>
                            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Top locations</p>
                                <p className="mt-2 text-3xl font-black">{compactNumber(topLocationRows.length)}</p>
                            </div>
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Profile locations</p>
                                <p className="mt-2 text-3xl font-black">{compactNumber(userLocationReport?.profile_location_count ?? 0)}</p>
                            </div>
                        </div>

                        <div className="mb-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-inner dark:border-white/10 dark:bg-slate-950">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600 dark:text-red-300">Karaads map</p>
                                    <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Real map with user red pins</h3>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        Pins are grouped by saved profile country, state, city, or login location.
                                    </p>
                                </div>
                                <Badge className="bg-red-600 text-white hover:bg-red-600">{locationMapView.markers.length} map pins</Badge>
                            </div>

                            <div className="relative mt-4 h-[360px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/10 dark:bg-slate-900">
                                {locationMapView.tiles.map((tile) => (
                                    <img
                                        key={tile.key}
                                        src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
                                        alt=""
                                        draggable={false}
                                        className="absolute select-none object-cover"
                                        style={{
                                            left: `${tile.left}%`,
                                            top: `${tile.top}%`,
                                            width: `${tile.width}%`,
                                            height: `${tile.height}%`,
                                        }}
                                    />
                                ))}
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_35%,rgba(15,23,42,0.08))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.16),transparent_35%,rgba(2,6,23,0.24))]" />

                                <div className="absolute left-4 top-4 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg dark:border-white/10 dark:bg-slate-950">
                                    <button type="button" className="flex h-8 w-8 items-center justify-center border-b border-slate-200 text-lg font-black text-slate-700 dark:border-white/10 dark:text-white">+</button>
                                    <button type="button" className="flex h-8 w-8 items-center justify-center text-lg font-black text-slate-700 dark:text-white">-</button>
                                </div>

                                <div className="absolute left-16 top-4 max-w-[calc(100%-7rem)] rounded-full border border-slate-300 bg-white/95 px-4 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/90 dark:text-white">
                                    Center: {locationMapView.center.lat.toFixed(3)}, {locationMapView.center.lng.toFixed(3)} · Zoom {locationMapView.zoom}
                                </div>

                                {locationMapView.markers.length ? locationMapView.markers.map((point) => (
                                    <a
                                        key={point.key}
                                        href={`https://www.google.com/maps?q=${point.lat},${point.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group absolute -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                        title={point.location_name || 'Open in Google Maps'}
                                    >
                                        <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-red-500/30" />
                                        <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-red-600 shadow-[0_0_0_5px_rgba(255,255,255,0.88),0_12px_28px_rgba(220,38,38,0.55)] ring-2 ring-red-100 transition group-hover:scale-110 dark:ring-red-300/40">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                        </span>
                                        <div className="pointer-events-none absolute left-1/2 top-7 z-10 hidden w-56 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-xl group-hover:block dark:border-white/10 dark:bg-slate-950">
                                            <p className="truncate text-sm font-black text-slate-950 dark:text-white">{point.location_name || 'Unknown location'}</p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {compactNumber(point.users || 0)} users · {point.source || 'profile'}
                                            </p>
                                            <p className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-300">Open in Google Maps</p>
                                        </div>
                                    </a>
                                )) : (
                                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-white/70">
                                            No saved user locations yet.
                                        </p>
                                    </div>
                                )}

                                <div className="absolute bottom-3 right-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow dark:bg-slate-950/90 dark:text-white/70">
                                    © OpenStreetMap contributors
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
                            <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="font-semibold">Top locations</p>
                                    <Badge variant="outline">{topLocationRows.length} shown</Badge>
                                </div>
                                <div className="space-y-2">
                                    {topLocationRows.length ? topLocationRows.map((location) => (
                                        <div key={location.location_name || location.ip_address} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                                    <MapPin className="h-4 w-4" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">{location.location_name || 'Unknown location'}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : 'recent activity'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-cyan-600 text-white hover:bg-cyan-600">{compactNumber(location.users || 0)} users</Badge>
                                        </div>
                                    )) : <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground dark:border-white/10">No location data has been captured yet.</p>}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="font-semibold">Recent people</p>
                                    <Badge variant="outline">{locationRows.length} shown</Badge>
                                </div>
                                <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Last seen</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {locationRows.length ? locationRows.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <span className="font-medium">{user.name}</span>
                                                        <span className="block text-xs text-muted-foreground">{user.email || `@${user.username || 'user'}`}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-semibold">{user.location_name || 'Unknown location'}</span>
                                                        <Badge variant="secondary" className="ml-2 capitalize">{user.source || 'login'}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'recently'}
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No recent user locations yet.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </AdminPanel>

                    <section className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
                        <AdminPanel
                            title={showingBadgePayments ? 'Badge payments' : 'Search users'}
                            description={
                                showingBadgePayments
                                    ? 'Users who paid for the Kara Verified badge are shown here.'
                                    : 'Find people by name, email, or username.'
                            }
                            className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30"
                        >
                            <form onSubmit={handleUserSearch} className="flex flex-col gap-3 sm:flex-row">
                                <Input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users..." className="rounded-2xl" />
                                <Button type="submit" className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                                {showingBadgePayments ? (
                                    <Button asChild type="button" variant="outline" className="rounded-2xl">
                                        <Link href={admin.dashboard.url()}>All users</Link>
                                    </Button>
                                ) : (
                                    <Button asChild type="button" variant="outline" className="rounded-2xl">
                                        <Link href={`${admin.dashboard.url()}?badge_payments=1`}>Badge payments</Link>
                                    </Button>
                                )}
                            </form>

                            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Badge payment</TableHead>
                                            <TableHead className="text-right">Open</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dashboardUsers.length ? (
                                            dashboardUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{user.name}</span>
                                                            <span className="text-xs text-muted-foreground">@{user.username || 'no-username'} · {user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                            {user.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.kara_badge_payment_status === 'paid' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <Badge className="w-fit bg-emerald-600 text-white hover:bg-emerald-600">
                                                                    Badge paid
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatCurrency(Number(user.kara_badge_payment_amount || 0))}
                                                                </span>
                                                            </div>
                                                        ) : user.kara_badge_payment_status ? (
                                                            <Badge variant="secondary" className="capitalize">
                                                                {String(user.kara_badge_payment_status).replaceAll('_', ' ')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Not paid</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="outline" size="sm" className="rounded-full">
                                                            <Link href={admin.users.show(user.id).url}>View</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    {filters.user_search ? 'No user matched your search.' : 'Search above to find users.'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>

                        <AdminPanel title="Ads approval runway" description="Approve funded campaigns and creatives without leaving the dashboard." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                            <div className="grid gap-4 xl:grid-cols-2">
                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                        <p className="font-semibold">Campaigns</p>
                                    </div>
                                    <Table>
                                        <TableBody>
                                            {pendingAdCampaigns.length ? (
                                                pendingAdCampaigns.map((campaign) => (
                                                    <TableRow key={campaign.id}>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <p className="font-semibold">{campaign.name}</p>
                                                                <p className="text-xs text-muted-foreground">{campaign.user?.name || 'Unknown'} · {formatCurrency(Number(campaign.budget_total || 0))}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <QueueButton isLoading={approvingAdId === `campaign-${campaign.id}`} onClick={() => approveCampaign(campaign.id)} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell className="py-8 text-center text-muted-foreground">No campaigns waiting.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                        <p className="font-semibold">Creatives</p>
                                    </div>
                                    <Table>
                                        <TableBody>
                                            {pendingAdCreatives.length ? (
                                                pendingAdCreatives.map((creative) => (
                                                    <TableRow key={creative.id}>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <p className="font-semibold">{creative.title || 'Untitled creative'}</p>
                                                                <p className="text-xs text-muted-foreground">{creative.campaign?.name || 'Unknown campaign'} · {creative.media_type || 'media'}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <QueueButton isLoading={approvingAdId === `creative-${creative.id}`} onClick={() => approveCreative(creative.id)} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell className="py-8 text-center text-muted-foreground">No creatives waiting.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </AdminPanel>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1fr,0.85fr]">
                        <AdminPanel title="Recent payouts" description="Latest payout movement across manual and rewarded withdrawals." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Source</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activityRows.length ? (
                                            activityRows.map((withdrawal, index) => (
                                                <TableRow key={`${withdrawal.reference ?? withdrawal.created_at ?? index}`}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{withdrawal.user?.name || 'Unknown user'}</span>
                                                            <span className="text-xs text-muted-foreground">{withdrawal.created_at || 'No timestamp'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}>
                                                            {withdrawal.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(withdrawal.amount || 0)}</TableCell>
                                                    <TableCell className="capitalize">{withdrawal.source || 'manual'}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No recent payout activity.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>

                        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                                <Activity className="h-5 w-5 text-cyan-600" />
                                <p className="mt-4 text-sm text-muted-foreground">Active campaigns</p>
                                <p className="text-3xl font-black">{platformStats.totalActiveCampaigns}</p>
                            </div>
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                                <Megaphone className="h-5 w-5 text-emerald-600" />
                                <p className="mt-4 text-sm text-muted-foreground">Ad creatives</p>
                                <p className="text-3xl font-black">{platformStats.totalAds}</p>
                            </div>
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                                <MousePointer className="h-5 w-5 text-amber-600" />
                                <p className="mt-4 text-sm text-muted-foreground">Ad clicks today</p>
                                <p className="text-3xl font-black">{compactNumber(dailyStats.adClicks)}</p>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <AdminPanel title="Top creators" description="Highest earning creators in the current snapshot." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Earnings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {creatorRows.length ? (
                                            creatorRows.map((creator, index) => (
                                                <TableRow key={creator.id ?? `${creator.name}-${index}`}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{creator.name}</span>
                                                            <span className="text-xs text-muted-foreground">{creator.email ?? 'Creator account'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(creator.earnings_sum_amount || 0)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                                                    No creator earnings data available.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>

                        <AdminPanel title="Top posts" description="Posts leading by earnings in the dashboard dataset." className="border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-white/5">
                                            <TableHead>Post</TableHead>
                                            <TableHead>Creator</TableHead>
                                            <TableHead>Earnings</TableHead>
                                            <TableHead className="text-right">Control</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topPostRows.length ? (
                                            topPostRows.map((post, index) => (
                                                <TableRow key={post.id ?? index}>
                                                    <TableCell className="max-w-sm truncate">{post.content || 'Untitled post'}</TableCell>
                                                    <TableCell>{post.user?.name || 'Unknown user'}</TableCell>
                                                    <TableCell>{formatCurrency(post.earnings_sum_amount || 0)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="outline" size="sm" className="rounded-full">
                                                            <Link href={`/admin/earnings/by-post/${post.id}`}>Manage</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No post monetization data available.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}
