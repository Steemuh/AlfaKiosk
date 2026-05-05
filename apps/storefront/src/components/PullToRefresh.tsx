"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PullToRefreshProps {
	children: React.ReactNode;
	threshold?: number;
}

export const PullToRefresh = ({ children, threshold = 70 }: PullToRefreshProps) => {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const startYRef = useRef<number | null>(null);
	const [pullDistance, setPullDistance] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const onTouchStart = (event: TouchEvent) => {
			if (window.scrollY > 0) return;
			startYRef.current = event.touches[0]?.clientY ?? null;
		};

		const onTouchMove = (event: TouchEvent) => {
			if (startYRef.current === null) return;
			const currentY = event.touches[0]?.clientY ?? 0;
			const distance = Math.max(0, currentY - startYRef.current);

			if (distance > 0 && window.scrollY === 0) {
				setPullDistance(Math.min(distance, threshold * 1.5));
				event.preventDefault();
			}
		};

		const onTouchEnd = () => {
			if (pullDistance >= threshold && !isRefreshing) {
				setIsRefreshing(true);
				router.refresh();
				window.setTimeout(() => {
					setIsRefreshing(false);
					setPullDistance(0);
				}, 800);
			} else {
				setPullDistance(0);
			}
			startYRef.current = null;
		};

		container.addEventListener("touchstart", onTouchStart, { passive: true });
		container.addEventListener("touchmove", onTouchMove, { passive: false });
		container.addEventListener("touchend", onTouchEnd, { passive: true });

		return () => {
			container.removeEventListener("touchstart", onTouchStart);
			container.removeEventListener("touchmove", onTouchMove);
			container.removeEventListener("touchend", onTouchEnd);
		};
	}, [pullDistance, isRefreshing, router, threshold]);

	return (
		<div ref={containerRef} className="relative">
			<div
				className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center"
				style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}
			>
				{pullDistance > 0 && (
					<div className="mt-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
						{isRefreshing ? "Refreshing..." : "Release to refresh"}
					</div>
				)}
			</div>
			<div style={{ transform: pullDistance ? `translateY(${pullDistance / 3}px)` : "none" }}>
				{children}
			</div>
		</div>
	);
};
