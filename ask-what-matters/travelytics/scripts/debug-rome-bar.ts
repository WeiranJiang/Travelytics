import { prisma } from "../src/lib/prisma";

async function run() {
  const property = await prisma.property.findFirst({
    where: {
      city: "Rome",
      country: "Italy",
      cluster: {
        clusterId: 2
      }
    },
    include: {
      gapScores: {
        where: {
          label: "bar"
        }
      }
    }
  });

  if (!property) {
    console.log("No matching property found in Rome, Italy for Cluster 2.");
    return;
  }

  console.log("Property Found:", property.egPropertyId);
  console.log("Gap Scores for 'bar':", JSON.stringify(property.gapScores, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
