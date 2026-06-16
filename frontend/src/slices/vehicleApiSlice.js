import { apiSlice } from './apiSlice';

export const vehicleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query({
      query: () => '/api/vehicles',
      providesTags: ['Vehicle'],
    }),
    getVehicleById: builder.query({
      query: (id) => `/api/vehicles/${id}`,
      providesTags: ['Vehicle'],
    }),
    registerVehicle: builder.mutation({
      query: (data) => ({
        url: '/api/vehicles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: builder.mutation({
      query: (data) => ({
        url: `/api/vehicles/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `/api/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const { 
  useGetVehiclesQuery, 
  useGetVehicleByIdQuery,
  useRegisterVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation
} = vehicleApiSlice;
