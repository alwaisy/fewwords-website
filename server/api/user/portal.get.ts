import { eq } from "drizzle-orm";

import { users } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const userId = (session.user as { id: string }).id;
  const db = await useDb(event);
  
  const userRows = await db
    .select({ polarCustomerId: users.polarCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const polarCustomerId = userRows[0]?.polarCustomerId;

  if (!polarCustomerId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No active billing profile found.",
    });
  }

  const portalHandler = CustomerPortal({
    accessToken: config.private.polarAccessToken,
    server: config.private.polarServer as "sandbox" | "production",
    getCustomerId: () => Promise.resolve(polarCustomerId),
  });

  return portalHandler(event);
});
