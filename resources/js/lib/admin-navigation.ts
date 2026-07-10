import type { ComponentType } from 'react';
import {
    Activity,
    BadgeDollarSign,
    BarChart3,
    Building2,
    CreditCard,
    FileWarning,
    LayoutDashboard,
    Mail,
    Megaphone,
    QrCode,
    Settings2,
    ShieldCheck,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';

import admin from '@/routes/admin';

type AccessRule = {
    roles?: string[];
    permissions?: string[];
};

export type AdminNavItem = {
    label: string;
    href?: string;
    icon: ComponentType<{ className?: string }>;
    section: string;
    requires?: AccessRule;
    children?: AdminNavItem[];
};

export type AdminAuthContext = {
    role?: string | null;
    permissions?: string[] | null;
};

const adsBase = admin.v2.ads;
const recoBase = admin.v2.reco;

export const adminNavigation: AdminNavItem[] = [
    {
        label: 'Dashboard',
        href: admin.dashboard.url(),
        icon: LayoutDashboard,
        section: 'Overview',
    },
    {
        label: 'Users',
        href: admin.users.index.url(),
        icon: Users,
        section: 'Platform',
        requires: { roles: ['super_admin', 'admin'] },
    },
    {
        label: 'Verification',
        href: `${admin.users.index.url()}?verification=requests`,
        icon: ShieldCheck,
        section: 'Platform',
        requires: { roles: ['super_admin', 'admin'] },
    },
    {
        label: 'Badge Payments',
        href: '/admin/badge-payments',
        icon: BadgeDollarSign,
        section: 'Platform',
        requires: { roles: ['super_admin', 'admin'] },
    },
    {
        label: 'Email Users',
        href: '/admin/email-users',
        icon: Mail,
        section: 'Platform',
        requires: { roles: ['super_admin', 'admin'] },
    },
    {
        label: 'QR Download',
        href: '/admin/qr-code',
        icon: QrCode,
        section: 'Platform',
        requires: { roles: ['super_admin', 'admin'] },
    },
    {
        label: 'System Staff',
        href: admin.systemStaff.index.url(),
        icon: UserCog,
        section: 'Platform',
        requires: { roles: ['super_admin'] },
    },
    {
        label: 'Content',
        icon: FileWarning,
        section: 'Operations',
        requires: { permissions: ['moderate_content', 'review_posts', 'review_comments'] },
        children: [
            { label: 'Posts', href: admin.content.posts.url(), icon: FileWarning, section: 'Operations' },
            { label: 'Content Verification', href: `${admin.content.posts.url()}?validation=1`, icon: ShieldCheck, section: 'Operations' },
            { label: 'Comments', href: admin.content.comments.url(), icon: FileWarning, section: 'Operations' },
            { label: 'Reports', href: admin.content.reports.url(), icon: ShieldCheck, section: 'Operations' },
        ],
    },
    {
        label: 'Earnings',
        href: admin.earnings.index.url(),
        icon: Wallet,
        section: 'Finance',
        requires: { permissions: ['manage_earnings', 'view_financial_reports'] },
    },
    {
        label: 'Post Earnings',
        href: '/admin/earnings/by-post',
        icon: BadgeDollarSign,
        section: 'Finance',
        requires: { permissions: ['manage_earnings', 'view_financial_reports'] },
    },
    {
        label: 'Withdrawals',
        href: admin.withdrawals.index.url(),
        icon: CreditCard,
        section: 'Finance',
        requires: { permissions: ['manage_withdrawals', 'view_financial_reports'] },
    },
    {
        label: 'Monetization',
        href: admin.monetizationSettings.index.url(),
        icon: BadgeDollarSign,
        section: 'Finance',
        requires: { permissions: ['manage_earnings', 'manage_withdrawals', 'view_financial_reports'] },
    },
    {
        label: 'Analytics',
        icon: BarChart3,
        section: 'Insights',
        requires: { permissions: ['view_analytics', 'view_financial_reports'] },
        children: [
            { label: 'Overview', href: admin.analytics.index.url(), icon: BarChart3, section: 'Insights' },
            { label: 'Revenue', href: admin.analytics.revenue.url(), icon: Activity, section: 'Insights' },
            { label: 'Users', href: admin.analytics.users.url(), icon: Users, section: 'Insights' },
            { label: 'Reports', href: admin.reports.financial.url(), icon: Activity, section: 'Insights' },
            { label: 'Monthly report', href: admin.reports.monthly.url(), icon: BarChart3, section: 'Insights' },
        ],
    },
    {
        label: 'Monthly report',
        href: admin.reports.monthly.url(),
        icon: BarChart3,
        section: 'Reports',
        requires: { roles: ['super_admin', 'admin'] },
    },
    {
        label: 'Ads',
        icon: Megaphone,
        section: 'Growth',
        requires: { permissions: ['manage_ads', 'manage_campaigns'] },
        children: [
            { label: 'Dashboard', href: '/admin/v2/ads/dashboard', icon: LayoutDashboard, section: 'Growth' },
            { label: 'Adapters', href: adsBase.adapters.index.url(), icon: Building2, section: 'Growth' },
            { label: 'All Paid Ads', href: `${adsBase.moderation.queue.url()}?paid=1`, icon: BadgeDollarSign, section: 'Growth' },
            { label: 'Moderation', href: adsBase.moderation.queue.url(), icon: Megaphone, section: 'Growth' },
            { label: 'Placements', href: adsBase.placements.index.url(), icon: Building2, section: 'Growth' },
            { label: 'Payments', href: adsBase.finance.payments.url(), icon: CreditCard, section: 'Growth' },
            { label: 'Payout Batches', href: adsBase.finance.payoutBatches.url(), icon: CreditCard, section: 'Growth' },
        ],
    },
    {
        label: 'Recommendations',
        href: recoBase.configs.page.url(),
        icon: Settings2,
        section: 'Growth',
        requires: { permissions: ['view_analytics'] },
    },
];

export function canAccessAdminItem(
    item: Pick<AdminNavItem, 'requires'>,
    auth: AdminAuthContext,
): boolean {
    const role = auth.role ?? '';
    const permissions = auth.permissions ?? [];

    if (!item.requires) {
        return true;
    }

    if (role === 'super_admin') {
        return true;
    }

    if (item.requires.roles?.includes(role)) {
        return true;
    }

    if (item.requires.permissions?.some((permission) => permissions.includes(permission))) {
        return true;
    }

    return false;
}

export function findActiveAdminItem(items: AdminNavItem[], pathname: string): AdminNavItem | null {
    for (const item of items) {
        if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
            return item;
        }

        if (item.children) {
            const childMatch = findActiveAdminItem(item.children, pathname);
            if (childMatch) {
                return childMatch;
            }
        }
    }

    return null;
}
