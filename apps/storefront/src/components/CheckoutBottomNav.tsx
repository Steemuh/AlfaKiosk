"use client";

import { BottomNavBar } from "@/components/BottomNavBar";
import { DefaultChannelSlug } from "@/app/config";

export const CheckoutBottomNav = () => {
	return <BottomNavBar channel={DefaultChannelSlug} />;
};
