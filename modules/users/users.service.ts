import { and, ilike, ne, or } from "drizzle-orm";
import { db } from "../../drizzle/db.js";
import { user } from "../../drizzle/schema.js";
import { auth } from "../../lib/auth.js";

export async function updateUserProfile(
  headers: Headers,
  name?: string,
  image?: string,
) {
  const updateBody: Record<string, unknown> = {};
  if (name !== undefined) updateBody.name = name;
  if (image !== undefined) updateBody.image = image;

  return auth.api.updateUser({ body: updateBody, headers });
}

export async function findUsers(userId: string, q: string, limit: number) {
  const searchPattern = `%${q}%`;
  return db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(
      and(
        or(ilike(user.name, searchPattern), ilike(user.email, searchPattern)),
        ne(user.id, userId),
      ),
    )
    .limit(limit);
}
