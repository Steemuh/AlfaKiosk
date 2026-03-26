"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle, Loader2, Bell } from "lucide-react";
import { useOrderStore, type Order } from "@saleor/shared/lib/orderStore";

export default function OrdersPage() {
	const [mounted, setMounted] = useState(false);
	const orders = useOrderStore((state) => state.orders);

	useEffect(() => {
		setMounted(true);
		
		// Clean up any orders with invalid IDs (from old format)
		// Valid order IDs should be numbers like "26" or short strings
		const store = useOrderStore.getState();
		const hasInvalidOrders = orders.some(order => 
			order.orderId && order.orderId.length > 10
		);
		
		if (hasInvalidOrders) {
			console.log('Cleaning up invalid order IDs');
			const validOrders = orders.filter(order => 
				order.orderId && order.orderId.length <= 10
			);
			store.setOrders(validOrders);
		}
	}, []);

	if (!mounted) {
		return (
			<div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
				<Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
			</div>
		);
	}

	const getStatusBadge = (status: Order["status"]) => {
		switch (status) {
			case "new":
			case "incoming":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
						<Clock className="h-3 w-3" />
						Order Received
					</span>
				);
			case "preparing":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
						<Loader2 className="h-3 w-3 animate-spin" />
						Preparing
					</span>
				);
			case "ready":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
						<Bell className="h-3 w-3" />
						Ready for Pickup!
					</span>
				);
			default:
				return null;
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	return (
		<div className="min-h-[calc(100vh-12rem)] px-4 py-6 pb-24">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
						<ClipboardList className="h-5 w-5 text-emerald-600" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-neutral-900">My Orders</h1>
						<p className="text-sm text-neutral-500">View your order history and status</p>
					</div>
				</div>

				{/* Orders List */}
				{orders.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<ClipboardList className="h-8 w-8 text-neutral-400" />
						</div>
						<h3 className="text-lg font-medium text-neutral-700 mb-1">No orders yet</h3>
						<p className="text-sm text-neutral-500">
							Your order history will appear here after you place an order.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{orders.map((order) => (
							<div
								key={order.id}
								className={`bg-white rounded-lg border p-4 shadow-sm ${
									order.status === "ready" ? "border-green-300 bg-green-50" : "border-neutral-200"
								}`}
							>
								{/* Order Header */}
								<div className="flex items-start justify-between mb-3">
									<div>
										<div className="flex items-center gap-2">
											<span className="font-semibold text-neutral-900">
												Order #{order.orderId}
											</span>
											{order.status === "ready" && (
												<CheckCircle className="h-5 w-5 text-green-500" />
											)}
										</div>
										<p className="text-sm text-neutral-500 mt-0.5">
											{formatTime(order.createdAt)}
										</p>
									</div>
									{getStatusBadge(order.status)}
								</div>

								{/* Ready Alert */}
								{order.status === "ready" && (
									<div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-3">
										<div className="flex items-center gap-2">
											<Bell className="h-5 w-5 text-green-600 animate-pulse" />
											<p className="text-sm font-medium text-green-700">
												Your order is ready! Please proceed to the counter.
											</p>
										</div>
									</div>
								)}

								{/* Customer Info */}
								<div className="text-sm text-neutral-600 mb-3">
									<span className="font-medium">Name:</span> {order.customerName}
									<span className="mx-2">•</span>
									<span className="font-medium">Pickup:</span> {order.pickupTime}
								</div>

								{/* Order Items */}
								<div className="border-t border-neutral-100 pt-3">
									<p className="text-xs font-medium text-neutral-500 uppercase mb-2">
										Items
									</p>
									<ul className="space-y-1">
										{order.items.map((item, index) => (
											<li
												key={index}
												className="flex justify-between text-sm text-neutral-700"
											>
												<span>
													{item.quantity}x {item.name}
												</span>
												<span className="font-medium">
													₱{(item.price * item.quantity).toFixed(2)}
												</span>
											</li>
										))}
									</ul>
								</div>

								{/* Total */}
								<div className="border-t border-neutral-200 mt-3 pt-3 flex justify-between">
									<span className="font-semibold text-neutral-900">Total</span>
									<span className="font-bold text-emerald-600">
										₱{order.totalPrice.toFixed(2)}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
