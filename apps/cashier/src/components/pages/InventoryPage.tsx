'use client';

interface InventoryPageProps {
	theme: 'light' | 'dark';
}

export default function InventoryPage({ theme }: InventoryPageProps) {
	const inventoryItems = [
		{ id: 1, name: 'Beef Patty', quantity: 45, unit: 'pcs', reorderLevel: 20 },
		{ id: 2, name: 'Chicken Breast', quantity: 32, unit: 'pcs', reorderLevel: 25 },
		{ id: 3, name: 'Sesame Buns', quantity: 18, unit: 'pcs', reorderLevel: 30 },
		{ id: 4, name: 'Lettuce', quantity: 12, unit: 'kg', reorderLevel: 5 },
		{ id: 5, name: 'Tomato', quantity: 8, unit: 'kg', reorderLevel: 8 },
		{ id: 6, name: 'Cheese Slices', quantity: 15, unit: 'packs', reorderLevel: 10 },
		{ id: 7, name: 'Pickles', quantity: 6, unit: 'jars', reorderLevel: 3 },
		{ id: 8, name: 'Fries', quantity: 22, unit: 'boxes', reorderLevel: 15 },
	];

	const lowStockItems = inventoryItems.filter((item) => item.quantity <= item.reorderLevel);

	const InventoryItem = ({
		item,
		isLowStock,
	}: {
		item: (typeof inventoryItems)[0];
		isLowStock: boolean;
	}) => (
		<div
			className={`p-4 rounded-lg border-2 flex items-center justify-between ${
				isLowStock
					? theme === 'light'
						? 'bg-red-50 border-red-300'
						: 'bg-red-900/30 border-red-700'
					: theme === 'light'
					? 'bg-white border-slate-200'
					: 'bg-slate-800 border-slate-700'
			}`}
		>
			<div className="flex-1">
				<p
					className={`font-semibold ${
						theme === 'light' ? 'text-slate-900' : 'text-white'
					}`}
				>
					{item.name}
				</p>
				<p
					className={`text-sm mt-1 ${
						theme === 'light' ? 'text-slate-600' : 'text-slate-400'
					}`}
				>
					Reorder Level: {item.reorderLevel} {item.unit}
				</p>
			</div>
			<div className="text-right">
				<p
					className={`text-2xl font-bold ${
						isLowStock
							? 'text-red-600'
							: theme === 'light'
							? 'text-emerald-600'
							: 'text-emerald-400'
					}`}
				>
					{item.quantity}
				</p>
				<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
					{item.unit}
				</p>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			<div>
				<h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Inventory Management
				</h2>
				<p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
					Track stock levels and manage supplies
				</p>
			</div>

			{lowStockItems.length > 0 && (
				<div
					className={`p-4 rounded-lg border-l-4 ${
						theme === 'light'
							? 'bg-red-50 border-l-red-500 text-red-900'
							: 'bg-red-900/30 border-l-red-500 text-red-300'
					}`}
				>
					<p className="font-semibold flex items-center gap-2">
						<span>⚠️</span> {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below reorder level
					</p>
					<p className="text-sm mt-2 opacity-75">
						Please reorder {lowStockItems.map((i) => i.name).join(', ')}
					</p>
				</div>
			)}

			<div>
				<h3
					className={`text-lg font-semibold mb-4 ${
						theme === 'light' ? 'text-slate-900' : 'text-white'
					}`}
				>
					Current Stock
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{inventoryItems.map((item) => (
						<InventoryItem
							key={item.id}
							item={item}
							isLowStock={item.quantity <= item.reorderLevel}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
