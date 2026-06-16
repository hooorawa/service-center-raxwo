import { apiSlice } from './apiSlice';

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: () => '/api/finance/invoices',
      providesTags: ['Invoice'],
    }),
    getQuotations: builder.query({
      query: () => '/api/finance/quotations',
      providesTags: ['Quotation'],
    }),
    getPayments: builder.query({
      query: () => '/api/finance/payments',
      providesTags: ['Payment'],
    }),
    generateQuotation: builder.mutation({
      query: (data) => ({
        url: '/api/finance/quotations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quotation'],
    }),
    deleteQuotation: builder.mutation({
      query: (id) => ({
        url: `/api/finance/quotations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quotation'],
    }),
    generateInvoice: builder.mutation({
      query: (data) => ({
        url: '/api/finance/invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoice', 'JobCard'],
    }),
    updateInvoice: builder.mutation({
      query: (data) => ({
        url: `/api/finance/invoices/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Invoice'],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/api/finance/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoice'],
    }),
    recordPayment: builder.mutation({
      query: (data) => ({
        url: '/api/finance/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoice', 'Payment'],
    }),
    recordSplitPayment: builder.mutation({
      query: (data) => ({
        url: '/api/finance/payments/transactions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Appointment', 'Payment', 'Invoice'],
    }),
    getAppointmentTransactions: builder.query({
      query: (appointmentId) => `/api/finance/payments/transactions/${appointmentId}`,
      providesTags: ['Payment'],
    }),
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/api/finance/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payment', 'Invoice'],
    }),
    getBankAccounts: builder.query({
      query: () => '/api/finance/banking/accounts',
      providesTags: ['Finance'],
    }),
    createBankAccount: builder.mutation({
      query: (data) => ({
        url: '/api/finance/banking/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance'],
    }),
    getPettyCashFunds: builder.query({
      query: () => '/api/finance/petty-cash',
      providesTags: ['Finance'],
    }),
    createPettyCashFund: builder.mutation({
      query: (data) => ({
        url: '/api/finance/petty-cash',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance'],
    }),
    recordPettyCashTransaction: builder.mutation({
      query: (data) => ({
        url: '/api/finance/petty-cash/transactions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance'],
    }),
    getTransactions: builder.query({
      query: () => '/api/finance/transactions',
      providesTags: ['Finance'],
    }),
    sendInvoiceEmail: builder.mutation({
        query: (id) => ({
            url: `/api/finance/invoices/${id}/send-email`,
            method: 'POST',
        }),
    }),
    sendInvoiceSMS: builder.mutation({
        query: (id) => ({
            url: `/api/finance/invoices/${id}/send-sms`,
            method: 'POST',
        }),
    }),
    refundPayment: builder.mutation({
        query: (id) => ({
            url: `/api/finance/payments/${id}/refund`,
            method: 'POST',
        }),
        invalidatesTags: ['Payment', 'Invoice'],
    }),
    generatePaymentLink: builder.mutation({
        query: (id) => ({
            url: `/api/finance/invoices/${id}/payment-link`,
            method: 'POST',
        }),
        invalidatesTags: ['Invoice'],
    }),
  }),
});


export const { 
  useGetInvoicesQuery, 
  useGetQuotationsQuery,
  useGetPaymentsQuery,
  useGenerateQuotationMutation,
  useDeleteQuotationMutation,
  useGenerateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useRecordPaymentMutation,
  useDeletePaymentMutation,
  useRecordSplitPaymentMutation,
  useGetAppointmentTransactionsQuery,
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useGetPettyCashFundsQuery,
  useCreatePettyCashFundMutation,
  useRecordPettyCashTransactionMutation,
  useGetTransactionsQuery,
  useSendInvoiceEmailMutation,
  useSendInvoiceSMSMutation,
  useRefundPaymentMutation,
  useGeneratePaymentLinkMutation,
} = financeApiSlice;

