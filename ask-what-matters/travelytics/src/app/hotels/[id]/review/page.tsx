import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/data";
import { ReviewFlow } from "@/components/ReviewFlow";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const name = property.propertyDescription?.slice(0, 60) || id;

  return <ReviewFlow propertyId={id} propertyName={name} />;
}
