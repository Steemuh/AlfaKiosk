'use client';

import { useEffect, useState } from 'react';
import { useCashierTheme } from '../cashier-theme-context';
import { useOrderStore, type Order, type OrderItem } from '@saleor/shared/lib/orderStore';
import IncomingOrdersTab from '@/components/tabs/IncomingOrdersTab';
import PreparingOrdersTab from '@/components/tabs/PreparingOrdersTab';
import ReadyForPickupTab from '@/components/tabs/ReadyForPickupTab';
import StatisticsPage from '@/components/pages/StatisticsPage';
import StoreStatusPage from '@/components/pages/StoreStatusPage';
import OrderListsPage from '@/components/pages/OrderListsPage';

type TabType = 'incoming' | 'preparing' | 'ready';
type PageType = 'orders' | 'order-lists' | 'statistics' | 'store-status';

// Removed unused `SaleorOrderStatus` type — not required here.

function normalizeCashierStatus(
    status: unknown
): 'new' | 'incoming' | 'preparing' | 'ready' | 'completed' {
    switch (status) {
        case 'new':
        case 'incoming':
        case 'preparing':
        case 'ready':
        case 'completed':
            return status;
        case 'rejected':
            return 'completed';
        case 'UNCONFIRMED':
        case 'UNFULFILLED':
            return 'new';
        case 'PARTIALLY_FULFILLED':
            return 'preparing';
        case 'FULFILLED':
            return 'ready';
        default:
            return 'incoming';
    }
}

function asNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

function mapSaleorLineToOrderItem(rawLine: unknown): OrderItem {
    const line = (rawLine ?? {}) as Record<string, unknown>;
    const productName = asNonEmptyString(line.productName);
    const variantName = asNonEmptyString(line.variantName);

    return {
        name: [productName, variantName].filter(Boolean).join(' - ') || 'Unnamed Item',
        quantity: Math.max(0, asNumber(line.quantity, 0)),
        price: asNumber(line.unitAmount, 0),
    };
}

function mapSaleorOrderToCashierOrder(rawOrder: unknown, index: number): Order {
    const raw = (rawOrder ?? {}) as Record<string, unknown>;
    const fallbackId = `unknown-order-${index}`;
    const id = asNonEmptyString(raw.id) ?? asNonEmptyString(raw.number) ?? fallbackId;
    const orderId = asNonEmptyString(raw.number) ?? id;
    const metadataCustomerName = asNonEmptyString(raw.customerName);
    const metadataCustomerEmail = asNonEmptyString(raw.customerEmail);
    const metadataPickupTime = asNonEmptyString(raw.pickupTime);
    const billingAddress = (raw.billingAddress ?? {}) as Record<string, unknown>;
    const firstName = asNonEmptyString(billingAddress.firstName);
    const lastName = asNonEmptyString(billingAddress.lastName);
    const sanitizedLastName = lastName && lastName.toLowerCase() === 'customer' ? null : lastName;
    const customerNameFromBilling = [firstName, sanitizedLastName].filter(Boolean).join(' ').trim();
    const customerName = metadataCustomerName || customerNameFromBilling || asNonEmptyString(raw.userEmail) || 'Walk-in Customer';
    const createdRaw = asNonEmptyString(raw.created);
    const createdAt = createdRaw ? new Date(createdRaw).getTime() : Date.now();
    const rawLines = Array.isArray(raw.lines) ? raw.lines : [];
    const cashierStatus = normalizeCashierStatus(raw.cashierStatus ?? raw.status);

    return {
        id,
        orderId,
        customerName,
        customerEmail: metadataCustomerEmail ?? asNonEmptyString(raw.userEmail) ?? undefined,
        pickupTime: metadataPickupTime ?? 'ASAP',
        items: rawLines.map(mapSaleorLineToOrderItem),
        status: cashierStatus,
        createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
        totalPrice: asNumber(raw.totalAmount, 0),
        rejectionReason: asNonEmptyString(raw.rejectionReason) ?? undefined,
        paymentStatus: asNonEmptyString(raw.paymentStatus) as Order['paymentStatus'] | undefined,
        paymentMethod: asNonEmptyString(raw.paymentMethod) as Order['paymentMethod'] | undefined,
        payrexPaymentId: asNonEmptyString(raw.payrexPaymentId) ?? undefined,
        cashierUpdatedAt: asNonEmptyString(raw.cashierUpdatedAt) ?? undefined,
    };
}

export default function CashierContent() {
    const { theme, toggleTheme } = useCashierTheme();
    const { setOrders } = useOrderStore();
    const [activeTab, setActiveTab] = useState<TabType>('incoming');
    const [currentPage, setCurrentPage] = useState<PageType>('orders');
    const [showMenu, setShowMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return;
        }

        let isActive = true;

        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                console.log('[CashierContent] Fetch response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMsg = typeof errorData.error === 'string' ? errorData.error : `API error ${response.status}`;
                    console.error('[CashierContent] API returned error:', errorMsg, errorData);
                    throw new Error(errorMsg);
                }

                const data: unknown = await response.json();
                const payload = (data ?? {}) as Record<string, unknown>;
                const rawOrders = Array.isArray(payload.orders) ? payload.orders : [];
                const mappedOrders = rawOrders.map(mapSaleorOrderToCashierOrder);
                console.log('[CashierContent] API orders:', rawOrders);
                console.log('[CashierContent] mapped orders:', mappedOrders);

                if (isActive) {
                    setOrders(mappedOrders);
                    setOrdersError(null);
                    console.debug('[CashierContent] Orders loaded', {
                        rawCount: rawOrders.length,
                        mappedCount: mappedOrders.length,
                    });
                }

                if (!Array.isArray(payload.orders)) {
                    console.warn('[CashierContent] Malformed orders payload: expected data.orders to be an array.', payload);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch orders';
                console.error('[CashierContent] Failed to load orders:', message, error);

                if (isActive) {
                    setOrders([]);
                    setOrdersError(message);
                }
            }
        };

        fetchOrders();
        const intervalId = setInterval(fetchOrders, 10000);

        return () => {
            isActive = false;
            clearInterval(intervalId);
        };
    }, [mounted, setOrders]);

    if (!mounted) {
        return null;
    }

    return (
        <div className={theme === 'light' ? 'min-h-dvh bg-white' : 'min-h-dvh bg-slate-900'}>
            {/* Top Bar */}
            <div className={`${theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700'} border-b sticky top-0 z-50`}>
                <div className="mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                                theme === 'light'
                                    ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                            title="Navigation menu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className={`text-lg sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} truncate`}>
                                {currentPage === 'orders' && 'Store Fulfillment'}
                                {currentPage === 'order-lists' && 'Order Lists'}
                                {currentPage === 'statistics' && 'Statistics'}
                                {currentPage === 'store-status' && 'Store Status'}
                            </h1>
                            <p className={`text-xs sm:text-sm hidden sm:block ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                {currentPage === 'orders' && 'Order Management System'}
                                {currentPage === 'order-lists' && 'Rejected and handed-over log'}
                                {currentPage === 'statistics' && 'Performance Dashboard'}
                                {currentPage === 'store-status' && 'System Monitoring'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu Overlay - Fixed on left side */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-30 top-[68px] sm:top-20"
                        onClick={() => setShowMenu(false)}
                    />
                    {/* Menu Panel */}
                    <div className={`fixed left-0 top-[68px] sm:top-20 bottom-0 w-64 shadow-lg z-40 overflow-y-auto ${theme === 'light' ? 'bg-white border-r border-slate-300' : 'bg-slate-800 border-r border-slate-700'}`}>
                        <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2">
                            <button
                                onClick={() => {
                                    setCurrentPage('orders');
                                    setShowMenu(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    currentPage === 'orders'
                                        ? theme === 'light'
                                            ? 'bg-emerald-100 text-emerald-900'
                                            : 'bg-emerald-900/30 text-emerald-300'
                                        : theme === 'light'
                                        ? 'hover:bg-slate-100 text-slate-700'
                                        : 'hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm8-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6a1 1 0 011-1z" />
                                    </svg>
                                    <span>Orders</span>
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentPage('order-lists');
                                    setShowMenu(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    currentPage === 'order-lists'
                                        ? theme === 'light'
                                            ? 'bg-emerald-100 text-emerald-900'
                                            : 'bg-emerald-900/30 text-emerald-300'
                                        : theme === 'light'
                                        ? 'hover:bg-slate-100 text-slate-700'
                                        : 'hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 3a1 1 0 000 2h12a1 1 0 100-2H4zm0 5a1 1 0 000 2h12a1 1 0 100-2H4zm0 5a1 1 0 100 2h8a1 1 0 100-2H4z" />
                                    </svg>
                                    <span>Order Lists</span>
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentPage('statistics');
                                    setShowMenu(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    currentPage === 'statistics'
                                        ? theme === 'light'
                                            ? 'bg-emerald-100 text-emerald-900'
                                            : 'bg-emerald-900/30 text-emerald-300'
                                        : theme === 'light'
                                        ? 'hover:bg-slate-100 text-slate-700'
                                        : 'hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <span>Statistics</span>
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentPage('store-status');
                                    setShowMenu(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    currentPage === 'store-status'
                                        ? theme === 'light'
                                            ? 'bg-emerald-100 text-emerald-900'
                                            : 'bg-emerald-900/30 text-emerald-300'
                                        : theme === 'light'
                                        ? 'hover:bg-slate-100 text-slate-700'
                                        : 'hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c4.76-4.76 12.624-4.76 17.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 00-1.414-1.414 9 9 0 0112.728 0 1 1 0 00-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 00-1.415-1.415 5 5 0 017.072 0 1 1 0 00-1.415 1.415zM9.88 9.88a1 1 0 011.414 0 1 1 0 010 1.414 1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span>Store Status</span>
                                </span>
                            </button>
                            <div className={`mt-4 rounded-lg border p-3 ${theme === 'light' ? 'border-slate-300' : 'border-slate-700'}`}>
                                <button
                                    onClick={toggleTheme}
                                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                                        theme === 'light'
                                            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                            : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                                    }`}
                                >
                                    {theme === 'light' ? '🌙 Switch to dark mode' : '☀️ Switch to light mode'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Tab Navigation - Only show for Orders page */}
            {currentPage === 'orders' && (
                <div className={`sticky top-[52px] sm:top-16 z-40 overflow-x-auto ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700'} border-b`}>
                    <div className="mx-auto px-2 sm:px-4 flex">
                        <TabButton
                            label="Incoming"
                            icon="📥"
                            isActive={activeTab === 'incoming'}
                            onClick={() => setActiveTab('incoming')}
                            theme={theme}
                        />
                        <TabButton
                            label="Preparing"
                            icon="⚙️"
                            isActive={activeTab === 'preparing'}
                            onClick={() => setActiveTab('preparing')}
                            theme={theme}
                        />
                        <TabButton
                            label="Ready"
                            icon="✅"
                            isActive={activeTab === 'ready'}
                            onClick={() => setActiveTab('ready')}
                            theme={theme}
                        />
                    </div>
                </div>
            )}

            {/* Page Content */}
            <div className="mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {currentPage === 'orders' && ordersError && (
                    <div
                        className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                            theme === 'light'
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : 'border-red-900/60 bg-red-950/40 text-red-300'
                        }`}
                    >
                        Unable to refresh orders right now. Showing fallback data. ({ordersError})
                    </div>
                )}

                {currentPage === 'orders' && (
                    <>
                        {activeTab === 'incoming' && <IncomingOrdersTab theme={theme} />}
                        {activeTab === 'preparing' && <PreparingOrdersTab theme={theme} />}
                        {activeTab === 'ready' && <ReadyForPickupTab theme={theme} />}
                    </>
                )}
                {currentPage === 'statistics' && <StatisticsPage theme={theme} />}
                {currentPage === 'store-status' && <StoreStatusPage theme={theme} />}
                {currentPage === 'order-lists' && <OrderListsPage theme={theme} />}
            </div>
        </div>
    );
}

interface TabButtonProps {
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
    theme: 'light' | 'dark';
}

function TabButton({ label, icon, isActive, onClick, theme }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap ${
                isActive
                    ? theme === 'light'
                        ? 'border-emerald-500 text-emerald-600 bg-white'
                        : 'border-emerald-500 text-emerald-400 bg-slate-700/50'
                    : theme === 'light'
                    ? 'border-transparent text-slate-600 hover:text-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
        >
            <span className="mr-1">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className="inline sm:hidden">
                {label === 'Ready for Pickup' ? 'Ready' : label}
            </span>
        </button>
    );
}
