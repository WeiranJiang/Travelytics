import { useEffect, useState } from 'react';
import type { Property, SubmitReviewResult, User } from '@/api/types';
import { getCurrentUser, signOut, unwrap } from '@/api/client';
import { Header } from '@/components/layout/Header';
import { SignInModal } from '@/components/auth/SignInModal';
import { SearchResults } from '@/pages/SearchResults';
import { PropertyPage } from '@/pages/PropertyPage';
import { ReviewFlow } from '@/pages/ReviewFlow';
import { ThankYou } from '@/pages/ThankYou';
import { AdminDashboard } from '@/pages/AdminDashboard';

type View =
  | { name: 'search' }
  | { name: 'property'; propertyId: string }
  | { name: 'review'; propertyId: string }
  | { name: 'thankyou'; result: SubmitReviewResult; property: Property };

export default function App() {
  const [view, setView] = useState<View>({ name: 'search' });
  const [user, setUser] = useState<User | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await unwrap(getCurrentUser());
      setUser(u);
    })();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        onHomeClick={() => setView({ name: 'search' })}
        onSignInClick={() => setSignInOpen(true)}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 bg-white">
        {user?.role === 'admin' && view.name === 'search' ? (
          <AdminDashboard user={user} />
        ) : (
          <>
        {view.name === 'search' && (
          <SearchResults
            onSelect={(propertyId) => setView({ name: 'property', propertyId })}
          />
        )}
        {view.name === 'property' && (
          <PropertyPage
            propertyId={view.propertyId}
            onBack={() => setView({ name: 'search' })}
            onLeaveReview={() => {
              if (!user) {
                setSignInOpen(true);
                return;
              }
              setView({ name: 'review', propertyId: view.propertyId });
            }}
          />
        )}
        {view.name === 'review' && (
          <ReviewFlow
            propertyId={view.propertyId}
            onBack={() => setView({ name: 'property', propertyId: view.propertyId })}
            onSubmitted={(result, property) =>
              setView({ name: 'thankyou', result, property })
            }
          />
        )}
        {view.name === 'thankyou' && (
          <ThankYou
            property={view.property}
            result={view.result}
            onDone={() =>
              setView({ name: 'property', propertyId: view.property.eg_property_id })
            }
          />
        )}
          </>
        )}
      </main>

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={(u) => {
          setUser(u);
          setSignInOpen(false);
        }}
      />
    </div>
  );
}
