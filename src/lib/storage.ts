/**
 * Generates a scoped key for localStorage based on the userId.
 * Falls back to 'guest' if no user is provided.
 */
export const getScopedKey = (userId: string | undefined | null, key: string) => {
  if (!userId) return `guest_${key}`;
  return `user_${userId}_${key}`;
};
