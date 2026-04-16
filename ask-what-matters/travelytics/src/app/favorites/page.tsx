import { getProperties } from "@/lib/data";
import { FavoritesClient } from "./FavoritesClient";

export default async function FavoritesPage() {
  // Fetch all properties server-side statically/cached
  const allProperties = await getProperties();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-navy text-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Your Saved Stays</h1>
          <p className="mt-2 text-white/70">Hotels and properties you have favorited</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <FavoritesClient properties={allProperties} />
      </div>
    </div>
  );
}
