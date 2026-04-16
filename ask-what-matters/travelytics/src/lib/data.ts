import { prisma } from "@/lib/prisma";

export async function getProperties() {
  return prisma.property.findMany({
    orderBy: [{ guestRatingAvgExpedia: "desc" }, { city: "asc" }],
    include: { _count: { select: { reviews: true } } },
  });
}

export async function getPropertyById(egPropertyId: string) {
  if (!egPropertyId) return null;
  return prisma.property.findUnique({
    where: { egPropertyId },
    include: {
      reviews: {
        orderBy: { acquisitionDate: "desc" },
        take: 300,   // fetch enough for accurate rating computation
      },
      gapScores: {
        orderBy: { finalScore: "desc" },
        take: 20,
      },
      cluster: true,
    },
  });
}

export async function getAdminGapRows() {
  return prisma.propertyFinalGap.findMany({
    include: {
      property: {
        select: {
          egPropertyId: true,
          city: true,
          country: true,
          starRating: true,
        },
      },
    },
    orderBy: { finalScore: "desc" },
    take: 100,
  });
}

/** Full property details for the Expedia-style admin card view */
export async function getAdminProperties() {
  return prisma.property.findMany({
    include: {
      gapScores: { orderBy: { finalScore: "desc" }, take: 50 },
      reviews: { orderBy: { acquisitionDate: "desc" }, take: 3 },
      cluster: true,
    },
    orderBy: [{ guestRatingAvgExpedia: "desc" }, { city: "asc" }],
  });
}