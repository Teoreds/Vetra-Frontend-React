import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";
import { invoiceKeys } from "../api/invoices.queries";
import type { InvoiceCreate, InvoiceRowUpdate, InvoiceUpdate } from "../types/invoice.types";

function useInvalidate() {
  const queryClient = useQueryClient();
  return (invoiceGuid?: string) => {
    queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    queryClient.invalidateQueries({ queryKey: [...invoiceKeys.all, "billable-ddts"] });
    if (invoiceGuid) {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceGuid) });
    }
  };
}

export function useCreateInvoice() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: InvoiceCreate) => {
      const { data, error } = await invoicesApi.create(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInvoice(invoiceGuid: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: InvoiceUpdate) => {
      const { data, error } = await invoicesApi.update(invoiceGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(invoiceGuid),
  });
}

export function useDeleteInvoice() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (invoiceGuid: string) => {
      const { error } = await invoicesApi.delete(invoiceGuid);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });
}

export function useIssueInvoice(invoiceGuid: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await invoicesApi.issue(invoiceGuid);
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(invoiceGuid),
  });
}

export function useSetInvoiceStatus(invoiceGuid: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (statusCode: string) => {
      const { data, error } = await invoicesApi.setStatus(invoiceGuid, statusCode);
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(invoiceGuid),
  });
}

export function useUpdateInvoiceRow(invoiceGuid: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ rowGuid, body }: { rowGuid: string; body: InvoiceRowUpdate }) => {
      const { data, error } = await invoicesApi.updateRow(rowGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(invoiceGuid),
  });
}

export function useDeleteInvoiceRow(invoiceGuid: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (rowGuid: string) => {
      const { error } = await invoicesApi.deleteRow(rowGuid);
      if (error) throw error;
    },
    onSuccess: () => invalidate(invoiceGuid),
  });
}
