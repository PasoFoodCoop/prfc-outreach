"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Referral } from "@/schema/referral";
import { z } from "zod";

const ApiReferralSchema = z.object({
  id: z.number(),
  createdAt: z.coerce.date(),
  memberName: z.string(),
  memberEmail: z.string(),
  prospectName: z.string(),
  prospectEmail: z.string(),
  referralCode: z.string(),
  redeemed: z.boolean(),
});

interface UseReferralsReturn {
  data: Referral[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  toggleRedeemed: (id: number, currentValue: boolean) => Promise<void>;
}

export function useReferrals(): UseReferralsReturn {
  const [data, setData] = useState<Referral[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const hasFetched = useRef(false);

  const isLoading = isFetching && !hasFetched.current;

  const fetchReferrals = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch("/api/referral");
      if (!response.ok) {
        throw new Error(`Failed to fetch referrals: ${response.status}`);
      }
      const json = await response.json();
      const validated = z.array(ApiReferralSchema).parse(json);
      setData(validated);
      hasFetched.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("[useReferrals] Fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const toggleRedeemed = useCallback(async (id: number, currentValue: boolean) => {
    setData((prev) => prev.map((ref) => (ref.id === id ? { ...ref, redeemed: !currentValue } : ref)));

    try {
      const response = await fetch(`/api/referral/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to update referral ${id}: ${response.status}`);
      }
    } catch (err) {
      setData((prev) => prev.map((ref) => (ref.id === id ? { ...ref, redeemed: currentValue } : ref)));
      console.error("[useReferrals] Toggle error:", err);
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch: fetchReferrals,
    toggleRedeemed,
  };
}
