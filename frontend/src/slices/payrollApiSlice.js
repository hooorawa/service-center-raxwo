import { apiSlice } from './apiSlice';

export const payrollApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollHistory: builder.query({
      query: () => '/api/payroll',
      providesTags: ['Payroll'],
    }),
    getPayrollItems: builder.query({
      query: (id) => `/api/payroll/${id}`,
      providesTags: ['Payroll'],
    }),
    processPayroll: builder.mutation({
      query: (data) => ({
        url: '/api/payroll/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payroll', 'Finance'],
    }),
  }),
});

export const {
  useGetPayrollHistoryQuery,
  useGetPayrollItemsQuery,
  useProcessPayrollMutation,
} = payrollApiSlice;
