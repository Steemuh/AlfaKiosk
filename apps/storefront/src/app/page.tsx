import { redirect } from 'next/navigation';

export default function EmptyPage() {
	// Customer app no longer has role selector
	// Redirect to the channel home or a default route
	redirect('/en-US');
};
