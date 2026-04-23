import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreStatus {
	isOpen: boolean;
	lastUpdated: number;
	closedAt?: number;
	closureReason?: string;
	operatingHours: {
		monday: { open: string; close: string; enabled: boolean };
		tuesday: { open: string; close: string; enabled: boolean };
		wednesday: { open: string; close: string; enabled: boolean };
		thursday: { open: string; close: string; enabled: boolean };
		friday: { open: string; close: string; enabled: boolean };
		saturday: { open: string; close: string; enabled: boolean };
		sunday: { open: string; close: string; enabled: boolean };
	};
	staffOnDuty: number;
	deliveryAvailable: boolean;
	takeoutAvailable: boolean;
	dineInAvailable: boolean;
	ordersInProgress: number;
	closureHistory: Array<{
		closedAt: number;
		reopenedAt?: number;
		reason?: string;
	}>;
}

interface StoreStatusStore {
	status: StoreStatus;
	setStoreOpen: (isOpen: boolean, reason?: string) => void;
	setOperatingHours: (day: keyof StoreStatus['operatingHours'], hours: { open: string; close: string; enabled: boolean }) => void;
	setStaffOnDuty: (count: number) => void;
	setDeliveryAvailable: (available: boolean) => void;
	setTakeoutAvailable: (available: boolean) => void;
	setDineInAvailable: (available: boolean) => void;
	setOrdersInProgress: (count: number) => void;
	getStoreStatus: () => StoreStatus;
}

const defaultOperatingHours = {
	monday: { open: '09:00', close: '22:00', enabled: true },
	tuesday: { open: '09:00', close: '22:00', enabled: true },
	wednesday: { open: '09:00', close: '22:00', enabled: true },
	thursday: { open: '09:00', close: '22:00', enabled: true },
	friday: { open: '09:00', close: '23:00', enabled: true },
	saturday: { open: '10:00', close: '23:00', enabled: true },
	sunday: { open: '10:00', close: '22:00', enabled: true },
};

export const useStoreStatusStore = create<StoreStatusStore>()(
	persist(
		(set, get) => ({
			status: {
				isOpen: true,
				lastUpdated: Date.now(),
				operatingHours: defaultOperatingHours,
				staffOnDuty: 3,
				deliveryAvailable: true,
				takeoutAvailable: true,
				dineInAvailable: true,
				ordersInProgress: 0,
				closureHistory: [],
			},

			setStoreOpen: (isOpen, reason) => {
				set((state) => {
					const newStatus: StoreStatus = {
						...state.status,
						isOpen,
						lastUpdated: Date.now(),
					};

					if (!isOpen) {
						newStatus.closedAt = Date.now();
						newStatus.closureReason = reason;
						newStatus.closureHistory = [
							...state.status.closureHistory,
							{
								closedAt: Date.now(),
								reason,
							},
						];
					} else {
						// Mark last closure as reopened
						if (newStatus.closureHistory.length > 0) {
							const lastClosure = newStatus.closureHistory[newStatus.closureHistory.length - 1];
							if (!lastClosure.reopenedAt) {
								lastClosure.reopenedAt = Date.now();
							}
						}
						newStatus.closedAt = undefined;
						newStatus.closureReason = undefined;
					}

					return { status: newStatus };
				});
			},

			setOperatingHours: (day, hours) => {
				set((state) => ({
					status: {
						...state.status,
						operatingHours: {
							...state.status.operatingHours,
							[day]: hours,
						},
						lastUpdated: Date.now(),
					},
				}));
			},

			setStaffOnDuty: (count) => {
				set((state) => ({
					status: {
						...state.status,
						staffOnDuty: count,
						lastUpdated: Date.now(),
					},
				}));
			},

			setDeliveryAvailable: (available) => {
				set((state) => ({
					status: {
						...state.status,
						deliveryAvailable: available,
						lastUpdated: Date.now(),
					},
				}));
			},

			setTakeoutAvailable: (available) => {
				set((state) => ({
					status: {
						...state.status,
						takeoutAvailable: available,
						lastUpdated: Date.now(),
					},
				}));
			},

			setDineInAvailable: (available) => {
				set((state) => ({
					status: {
						...state.status,
						dineInAvailable: available,
						lastUpdated: Date.now(),
					},
				}));
			},

			setOrdersInProgress: (count) => {
				set((state) => ({
					status: {
						...state.status,
						ordersInProgress: count,
						lastUpdated: Date.now(),
					},
				}));
			},

			getStoreStatus: () => {
				return get().status;
			},
		}),
		{
			name: 'store-status-storage',
		}
	)
);
