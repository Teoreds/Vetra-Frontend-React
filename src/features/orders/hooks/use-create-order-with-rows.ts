import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";
import type { OrderRowDraft } from "../components/new-order-step-items";
import type { Step1Data } from "../components/new-order-step-details";

interface UseCreateOrderWithRowsResult {
  mutate: (data: {
    step1: Step1Data;
    availableRows: OrderRowDraft[];
    commitmentRows: OrderRowDraft[];
  }) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

export function useCreateOrderWithRows(): UseCreateOrderWithRowsResult {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate({
    step1,
    availableRows,
    commitmentRows,
  }: {
    step1: Step1Data;
    availableRows: OrderRowDraft[];
    commitmentRows: OrderRowDraft[];
  }) {
    setIsPending(true);
    setError(null);

    try {
      // 1. Create the order
      const { data: order, error: orderError } = await ordersApi.create({
        party_guid: step1.party_guid,
        order_date: step1.order_date,
        shipping_location_guid: step1.shipping_location_guid ?? null,
      });

      if (orderError || !order) {
        throw new Error("Impossibile creare l'ordine. Riprova.");
      }

      // 2. Create all rows in parallel
      // availability_status_code: "UNKNOWN" is the only value accepted by the backend.
      // The available/commitment distinction is a UI concept managed on the frontend only.
      const rowPayloads = [...availableRows, ...commitmentRows].map((r) => ({
        article_guid: r.article_guid,
        quantity: r.quantity,
        unit_price: r.unit_price,
        vat_code: r.vat_code || null,
        availability_status_code: "UNKNOWN",
      }));

      await Promise.all(rowPayloads.map((payload) => ordersApi.createRow(order.guid, payload)));

      // 3. Invalidate and navigate
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      navigate(`/orders/${order.guid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setIsPending(false);
    }
  }

  return { mutate, isPending, error };
}
