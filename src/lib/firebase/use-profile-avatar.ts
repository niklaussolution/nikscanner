"use client";

import { useEffect, useSyncExternalStore } from "react";
import { authedJson } from "@/lib/firebase/api";
import { useAuth } from "@/lib/firebase/auth-context";
import type { ProfileResult } from "@/lib/firebase/nikscanner-types";

interface AvatarState {
  uid: string | null;
  avatar: string | null;
  avatarPublic: boolean;
  loaded: boolean;
}

const EMPTY: AvatarState = { uid: null, avatar: null, avatarPublic: false, loaded: false };

/** Module-level store so the navbar's account button and the profile page share one copy of
 *  the signed-in user's photo — uploading on the profile page updates the navbar instantly,
 *  and GET /api/user/profile is fetched once per signed-in user, not once per component. */
let state: AvatarState = EMPTY;
let inflightFor: string | null = null;
const listeners = new Set<() => void>();

function emit(next: AvatarState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Call after a successful POST /api/user/avatar so every consumer re-renders with the change. */
export function setProfileAvatar(uid: string, patch: Partial<Pick<AvatarState, "avatar" | "avatarPublic">>) {
  if (state.uid !== uid) return;
  emit({ ...state, ...patch, loaded: true });
}

export function useProfileAvatar(): AvatarState {
  const { user } = useAuth();
  const snapshot = useSyncExternalStore(subscribe, () => state, () => EMPTY);
  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) {
      if (state.uid !== null) emit(EMPTY);
      return;
    }
    if (state.uid === uid || inflightFor === uid) return;
    inflightFor = uid;
    emit({ ...EMPTY, uid });
    authedJson<ProfileResult>("/api/user/profile")
      .then((profile) => {
        if (state.uid === uid) emit({ uid, avatar: profile.avatar ?? null, avatarPublic: profile.avatar_public === true, loaded: true });
      })
      .catch(() => {
        // Non-fatal: consumers fall back to the initial-letter avatar.
        if (state.uid === uid) emit({ ...state, loaded: true });
      })
      .finally(() => {
        if (inflightFor === uid) inflightFor = null;
      });
  }, [uid]);

  return snapshot.uid === uid ? snapshot : EMPTY;
}
