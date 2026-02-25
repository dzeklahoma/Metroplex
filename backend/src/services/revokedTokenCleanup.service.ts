import { prisma } from "../prisma";

export async function cleanupRevokedTokens(): Promise<number> {
  const res = await prisma.revokedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return res.count;
}
