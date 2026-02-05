'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DefaultChannelSlug } from './config';

export default function RoleSelector() {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<'customer' | 'cashier' | null>(null);

	const handleRoleSelect = (role: 'customer' | 'cashier') => {
		setSelectedRole(role);
		// Store role in localStorage for persistence
		localStorage.setItem('userRole', role);
		
		if (role === 'customer') {
			router.push(`/${DefaultChannelSlug}`);
		} else {
			router.push('/cashier');
		}
	};

	return (
		<div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			<div className="w-full max-w-md mx-auto px-4">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-white mb-3">Store Operations</h1>
					<p className="text-slate-400 text-lg">Select your role to continue</p>
				</div>

				<div className="space-y-4">
					{/* Customer Button */}
					<button
						onClick={() => handleRoleSelect('customer')}
						disabled={selectedRole === 'cashier'}
						className={`w-full py-6 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
							selectedRole === 'cashier'
								? 'opacity-50 cursor-not-allowed'
								: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
						}`}
					>
						<div className="flex items-center justify-center gap-3">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 11V7a4 4 0 00-8 0v4M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
								/>
							</svg>
							<div className="text-left">
								<div className="font-bold text-white text-lg">Customer</div>
								<div className="text-blue-100 text-sm">Browse & Order</div>
							</div>
						</div>
					</button>

					{/* Cashier Button */}
					<button
						onClick={() => handleRoleSelect('cashier')}
						disabled={selectedRole === 'customer'}
						className={`w-full py-6 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
							selectedRole === 'customer'
								? 'opacity-50 cursor-not-allowed'
								: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl'
						}`}
					>
						<div className="flex items-center justify-center gap-3">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
								/>
							</svg>
							<div className="text-left">
								<div className="font-bold text-white text-lg">Cashier</div>
								<div className="text-emerald-100 text-sm">Manage Orders & Fulfillment</div>
							</div>
						</div>
					</button>
				</div>

				<div className="mt-8 text-center text-slate-500 text-sm">
					<p>Choose your role to access the appropriate interface</p>
				</div>
			</div>
		</div>
	);
}
