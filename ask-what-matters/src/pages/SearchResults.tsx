import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import type { Property } from '@/api/types';
import { listProperties, unwrap } from '@/api/client';
import { PropertyCard } from '@/components/property/PropertyCard';
import { SearchResultsSkeleton } from '@/components/ui/Skeleton';

export function SearchResults({
  onSelect,
}: {
  onSelect: (propertyId: string) => void;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('All');
  const [sort, setSort] = useState<'recommended' | 'rating' | 'price_low' | 'price_high'>(
    'recommended',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await unwrap(listProperties());
        setProperties(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countries = useMemo(
    () => ['All', ...Array.from(new Set(properties.map((p) => p.country).filter(Boolean)))],
    [properties],
  );

  const filtered = useMemo(() => {
    let out = properties;
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (p) =>
          p.display_name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q),
      );
    }
    if (country !== 'All') out = out.filter((p) => p.country === country);
    const priceOf = (p: Property) => Math.round(120 + p.guestrating_avg_expedia * 30);
    const sorted = [...out];
    if (sort === 'rating') sorted.sort((a, b) => b.guestrating_avg_expedia - a.guestrating_avg_expedia);
    else if (sort === 'price_low') sorted.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === 'price_high') sorted.sort((a, b) => priceOf(b) - priceOf(a));
    return sorted;
  }, [properties, query, country, sort]);

  return (
    <div>
      {/* Hero search bar */}
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">Stays worldwide</h1>
          <p className="mt-2 text-white/80">
            Explore {properties.length || 13} hotels across {countries.length - 1} countries.
          </p>

          <div className="mt-6 bg-white rounded-lg p-2 flex flex-col md:flex-row items-stretch gap-2 shadow-float">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-divider">
              <Search size={18} className="text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, country, or hotel"
                className="flex-1 bg-transparent text-navy placeholder:text-ink-muted focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-divider md:w-56">
              <MapPin size={18} className="text-ink-muted" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flex-1 bg-transparent text-navy focus:outline-none"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button className="bg-action text-white font-medium rounded-full px-6 hover:bg-action-hover">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-navy font-semibold">
            {loading ? 'Loading…' : `${filtered.length} properties`}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter size={14} className="text-ink-muted" />
            <label className="text-ink-muted">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-white border border-divider rounded-md px-2 py-1 text-navy focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest rated</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <SearchResultsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">
            <div className="text-lg font-semibold text-navy">No properties match your search.</div>
            <div className="mt-1 text-sm">Try clearing the filter or broadening your query.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((p) => (
              <PropertyCard
                key={p.eg_property_id}
                property={p}
                onSelect={() => onSelect(p.eg_property_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
