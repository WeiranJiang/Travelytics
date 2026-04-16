import { getProperties } from "@/lib/data";
import { PropertyListing } from "@/components/PropertyListing";

export default async function HomePage() {
  const properties = await getProperties();
  return <PropertyListing properties={properties} />;
}