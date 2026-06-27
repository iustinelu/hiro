import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { useJoinByCode } from "./useJoinByCode";

interface UseJoinDeepLinkArgs {
  /**
   * Only process links once the user is signed-in-and-onboarded. The caller
   * passes `authState === "authed"`. A code that arrives before then is stashed
   * and replayed once enabled flips to true.
   */
  enabled: boolean;
  /** Called once a deep-linked code has successfully joined a household. */
  onJoined: () => void;
}

/**
 * Extract a join code from a URL of form `/join/:code`, supporting both the web
 * universal link (`https://<host>/join/<code>`) and the custom scheme
 * (`hiro://join/<code>`). Returns null if the URL is not a join link.
 */
function parseJoinCode(url: string): string | null {
  const parsed = Linking.parse(url);
  // Universal link (https://<host>/join/<code>): the host is the domain, so the
  // "join" marker lives in the path → ["join", "<code>"].
  // Custom scheme (hiro://join/<code>): expo-linking treats "join" as the
  // hostname and "<code>" as the path. Handle both by prepending hostname when
  // it is the "join" marker, then look for a leading "join" segment.
  const path = parsed.path ?? "";
  const prefix = parsed.hostname === "join" ? "join/" : "";
  const segments = (prefix + path).split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === "join") {
    return segments[1];
  }
  return null;
}

/**
 * Handles incoming `/join/:code` deep links. Covers both cold start
 * (getInitialURL) and warm foreground (url event). When a code is found and the
 * session is authed, it routes through the shared useJoinByCode flow (which
 * includes the data-loss switch confirmation). If a link arrives before the
 * session is ready, the code is stashed and replayed once `enabled` is true.
 */
export function useJoinDeepLink({ enabled, onJoined }: UseJoinDeepLinkArgs) {
  const { join, error, setError } = useJoinByCode();
  const pendingCode = useRef<string | null>(null);

  // A tapped link has no inline error surface (unlike the manual form), so
  // surface a join failure (disabled/expired/invalid link) as an alert.
  useEffect(() => {
    if (error) {
      Alert.alert("Couldn't join", error);
      setError(null);
    }
  }, [error, setError]);
  // Keep the latest enabled/handlers without re-subscribing the listener.
  const enabledRef = useRef(enabled);
  const joinRef = useRef(join);
  const onJoinedRef = useRef(onJoined);
  enabledRef.current = enabled;
  joinRef.current = join;
  onJoinedRef.current = onJoined;

  function process(code: string) {
    if (enabledRef.current) {
      void joinRef.current(code, { onJoined: () => onJoinedRef.current() });
    } else {
      pendingCode.current = code;
    }
  }

  // Subscribe once: cold-start URL + warm url events.
  useEffect(() => {
    let cancelled = false;
    void Linking.getInitialURL().then((url) => {
      if (cancelled || !url) return;
      const code = parseJoinCode(url);
      if (code) process(code);
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      const code = parseJoinCode(url);
      if (code) process(code);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replay a stashed code once the session becomes authed.
  useEffect(() => {
    if (enabled && pendingCode.current) {
      const code = pendingCode.current;
      pendingCode.current = null;
      process(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
