import { Store, Users, Coffee, Heart } from "lucide-react";
//homepage

export default function HomePage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-6 py-8 pb-24">
			{/* Logo/Welcome Section */}
			<div className="text-center mb-8">
				<div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Store className="h-12 w-12 text-emerald-600" />
				</div>
				<h1 className="text-3xl font-bold text-neutral-900 mb-2">ALFA-C Kiosk</h1>
				<p className="text-lg text-neutral-600">Canteen Ordering System</p>
			</div>

			{/* About Section */}
			<div className="max-w-md w-full bg-neutral-50 rounded-xl p-6 mb-6">
				<h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
					<Heart className="h-5 w-5 text-red-500" />
					About This App
				</h2>
				<p className="text-neutral-600 leading-relaxed mb-4">
					Welcome to the <strong>ALFA-C Canteen Kiosk App</strong>! This application was developed 
					by the <strong>Alfamart IT Department</strong> to provide a seamless and convenient 
					food ordering experience for our employees.
				</p>
				<p className="text-neutral-600 leading-relaxed">
					Simply browse the menu, add items to your cart, and place your order. 
					You&apos;ll receive a notification when your food is ready for pickup!
				</p>
			</div>

			{/* Features */}
			<div className="max-w-md w-full">
				<h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">How It Works</h3>
				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col items-center text-center">
						<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
							<Coffee className="h-6 w-6 text-blue-600" />
						</div>
						<p className="text-sm text-neutral-600">Browse Menu</p>
					</div>
					<div className="flex flex-col items-center text-center">
						<div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
							<Store className="h-6 w-6 text-orange-600" />
						</div>
						<p className="text-sm text-neutral-600">Place Order</p>
					</div>
					<div className="flex flex-col items-center text-center">
						<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
							<Users className="h-6 w-6 text-green-600" />
						</div>
						<p className="text-sm text-neutral-600">Pick Up</p>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-8 text-center text-sm text-neutral-400">
				<p>Developed by Alfamart IT Department</p>
				<p className="mt-1">© 2026 All Rights Reserved</p>
			</div>
		</div>
	);
}
