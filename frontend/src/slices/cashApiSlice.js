import { apiSlice } from './apiSlice';

export const cashApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRegisters: builder.query({
      query: () => '/api/cash/registers',
      providesTags: ['CashRegister'],
    }),
    createRegister: builder.mutation({
      query: (data) => ({
        url: '/api/cash/registers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CashRegister'],
    }),
    openRegister: builder.mutation({
      query: (data) => ({
        url: `/api/cash/registers/${data.id}/open`,
        method: 'POST',
        body: { openingBalance: data.openingBalance },
      }),
      invalidatesTags: ['CashRegister'],
    }),
    closeRegister: builder.mutation({
      query: (data) => ({
        url: `/api/cash/registers/${data.id}/close`,
        method: 'POST',
        body: { actualBalance: data.actualBalance, notes: data.notes },
      }),
      invalidatesTags: ['CashRegister'],
    }),
    adjustCash: builder.mutation({
      query: (data) => ({
        url: `/api/cash/registers/${data.id}/adjust`,
        method: 'POST',
        body: { type: data.type, amount: data.amount, reason: data.reason },
      }),
      invalidatesTags: ['CashRegister'],
    }),
    getRegisterTransactions: builder.query({
      query: (id) => `/api/cash/registers/${id}/transactions`,
      providesTags: ['CashTransaction'],
    }),
  }),
});

export const {
  useGetRegistersQuery,
  useCreateRegisterMutation,
  useOpenRegisterMutation,
  useCloseRegisterMutation,
  useAdjustCashMutation,
  useGetRegisterTransactionsQuery,
} = cashApiSlice;
