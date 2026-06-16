import { apiSlice } from './apiSlice';

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: () => '/api/customers',
      providesTags: ['Customer'],
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: '/api/customers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation({
      query: (data) => ({
        url: `/api/customers/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Customer'],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/api/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const { 
  useGetCustomersQuery, 
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation
} = customerApiSlice;
