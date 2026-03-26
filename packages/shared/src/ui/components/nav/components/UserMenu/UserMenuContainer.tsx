
import { UserMenu } from "./UserMenu";
import { CurrentUserDocument } from "@saleor/shared/gql/graphql";
import { executeGraphQL } from "@saleor/shared/lib/graphql";


export async function UserMenuContainer() {
	const { me: user } = await executeGraphQL(CurrentUserDocument, {
		cache: "no-cache",
	});

	if (user) {
		return <UserMenu user={user} />;
	}

	return null;
}
