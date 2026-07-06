import { useEffect, useState } from "react";
import { getSessionContext } from "./sessionService";

/**
 * Shared screen bootstrap: resolves the signed-in profile id + household id
 * once on mount. `bootstrapped` flips true when resolution finished (even if
 * the user has no profile/household yet), so screens can render empty states
 * instead of spinners forever.
 */
export function useSessionBootstrap(): {
  profileId: string | null;
  householdId: string | null;
  bootstrapped: boolean;
} {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const context = await getSessionContext();
      if (!active) return;
      setProfileId(context.profileId);
      setHouseholdId(context.householdId);
      setBootstrapped(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { profileId, householdId, bootstrapped };
}
