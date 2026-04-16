// import { NextResponse } from "next/server";

// const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
// const saleorAppToken = process.env.SALEOR_APP_TOKEN;
// const defaultChannel = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL;

// const ordersQuery = `
// query Orders($first: Int!, $channel: String) {
// 	orders(first: $first, channel: $channel) {
// 		edges {
// 			node {
// 				id
// 				number
// 				status
// 				created
// 				userEmail
// 				billingAddress {
// 					firstName
// 					lastName
// 				}
// 				total {
// 					gross {
// 						amount
// 						currency
// 					}
// 				}
// 				lines {
// 					quantity
// 					variant {
// 						name
// 						product {
// 							name
// 						}
// 						pricing {
// 							price {
// 								gross {
// 									amount
// 									currency
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// }
// `;

// const mapStatus = (status: string | null | undefined) => {
// 	switch (status) {
// 		case "UNCONFIRMED":
// 			return "new";
// 		case "FULFILLED":
// 			return "ready";
// 		default:
// 			return "incoming";
// 	}
// };

// const formatPickupTime = (created: string | null | undefined) => {
// 	if (!created) {
// 		return "ASAP";
// 	}

// 	const createdDate = new Date(created);
// 	if (Number.isNaN(createdDate.getTime())) {
// 		return "ASAP";
// 	}

// 	createdDate.setMinutes(createdDate.getMinutes() + 45);
// 	return createdDate.toTimeString().slice(0, 5);
// };

// export async function GET() {
// 	if (!saleorApiUrl) {
// 		return NextResponse.json({ error: "Missing NEXT_PUBLIC_SALEOR_API_URL" }, { status: 500 });
// 	}

// 	if (!saleorAppToken) {
// 		return NextResponse.json({ error: "Missing SALEOR_APP_TOKEN" }, { status: 500 });
// 	}

// 	const response = await fetch(saleorApiUrl, {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json",
// 			Authorization: `Bearer ${saleorAppToken}`,
// 		},
// 		body: JSON.stringify({
// 			query: ordersQuery,
// 			variables: {
// 				first: 50,
// 				channel: defaultChannel,
// 			},
// 		}),
// 	});

// 	if (!response.ok) {
// 		const errorText = await response.text();
// 		return NextResponse.json({ error: errorText }, { status: 500 });
// 	}

// 	const data = (await response.json()) as {
// 		data?: {
// 			orders?: {
// 				edges?: Array<{ node: any }>;
// 			};
// 		};
// 	};

// 	const orders =
// 		data.data?.orders?.edges?.map(({ node }) => {
// 			const items = node.lines?.map((line: any) => ({
// 				name: line.variant?.product?.name ?? line.variant?.name ?? "Item",
// 				quantity: line.quantity ?? 1,
// 				price: line.variant?.pricing?.price?.gross?.amount ?? 0,
// 			})) ?? [];

// 			const customerName = node.billingAddress
// 				? `${node.billingAddress.firstName ?? ""} ${node.billingAddress.lastName ?? ""}`.trim()
// 				: node.userEmail ?? "Customer";

// 			return {
// 				id: node.id,
// 				orderId: `#${node.number}`,
// 				customerName: customerName || "Customer",
// 				pickupTime: formatPickupTime(node.created),
// 				items,
// 				status: mapStatus(node.status),
// 				createdAt: node.created ? new Date(node.created).getTime() : Date.now(),
// 				totalPrice: node.total?.gross?.amount ?? 0,
// 			};
// 		}) ?? [];

// 	return NextResponse.json({ orders });
// }



import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		ok: true,
		message: "cashier api route works",
	});
}