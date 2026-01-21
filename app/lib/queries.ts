import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from './api';

// Cash sessions
export const useOpenSessions = () =>
    useQuery({ queryKey: ['cash','sessions','open'], queryFn: () => apiGet('/cash/sessions?status=open') });

export const useOpenSession = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { registerId: string; openingFloat: number }) =>
            apiPost('/cash/sessions/open', payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cash','sessions','open'] }),
    });
};

export const useCloseSession = (sessionId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { declaredTotal: number }) =>
            apiPost(`/cash/sessions/${sessionId}/close`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cash','sessions','open'] });
            qc.invalidateQueries({ queryKey: ['cash','sessions','closed'] });
        },
    });
};

export const useCashMovements = (sessionId?: string) =>
    useQuery({
        queryKey: ['cash','movements',sessionId ?? 'all'],
        queryFn: () => apiGet(`/cash/movements${sessionId ? `?sessionId=${sessionId}` : ''}`),
        enabled: !!sessionId,
    });

export const useCreateMovement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { sessionId: string; type: 'deposit'|'withdrawal'|'adjustment'|'sale'; amount: number; reference?: string }) =>
            apiPost('/cash/movements', payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['cash','movements', vars.sessionId] });
            qc.invalidateQueries({ queryKey: ['cash','summary', vars.sessionId] });
        },
    });
};

export const useCashSummary = (sessionId?: string) =>
    useQuery({
        queryKey: ['cash','summary', sessionId ?? 'none'],
        queryFn: () => apiGet(`/cash/summary?sessionId=${sessionId}`),
        enabled: !!sessionId,
    });

// Invoices
export const useCreateInvoice = () => useMutation({
    mutationFn: (payload: {
        patientId?: string | null;
        preclinicId?: string | null;
        locationId: string;
        registerId?: string | null;
        invoiceNo?: string;
    }) => apiPost('/invoice', payload),
});

export const useInvoice = (id?: string) =>
    useQuery({ queryKey: ['invoice', id], queryFn: () => apiGet(`/invoices/${id}`), enabled: !!id });

export const useAddLine = (invoiceId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: {
            itemType: 'service'|'product';
            serviceId?: string; productId?: string;
            description?: string;
            qty: number; unitPrice: number; discountPct?: number; taxRatePct?: number; providerId?: string;
        }) => apiPost(`/invoices/${invoiceId}/lines`, p),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
    });
};

export const usePostInvoice = (invoiceId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => apiPost(`/invoices/${invoiceId}/post`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
    });
};

export const usePayInvoice = (invoiceId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: {
            method: 'cash'|'card'|'transfer'|'other';
            amount: number;
            sessionId?: string; // required for cash
            currency?: string;
            reference?: string;
            posTerminalId?: string;
            transferStatus?: 'completed'|'not_completed';
            amountTendered?: number; // for change
        }) => apiPost(`/invoices/${invoiceId}/payments`, p),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
    });
};