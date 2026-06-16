import { apiSlice } from './apiSlice';

export const servicesManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServicesCatalog: builder.query({
      query: () => '/api/services',
      providesTags: ['Service'],
    }),
    createService: builder.mutation({
      query: (data) => ({
        url: '/api/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation({
      query: (data) => ({
        url: `/api/services/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/api/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useGetServicesCatalogQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesManagementApiSlice;
