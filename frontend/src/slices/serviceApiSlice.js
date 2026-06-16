import { apiSlice } from './apiSlice';

export const serviceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInsurancePolicies: builder.query({
      query: () => '/api/service/insurance',
      providesTags: ['Insurance'],
    }),
    createInsurancePolicy: builder.mutation({
      query: (data) => ({
        url: '/api/service/insurance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Insurance'],
    }),
    deleteInsurancePolicy: builder.mutation({
      query: (id) => ({
        url: `/api/service/insurance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Insurance'],
    }),
    getWarrantyClaims: builder.query({
      query: () => '/api/service/warranty',
      providesTags: ['Warranty'],
    }),
    createWarrantyClaim: builder.mutation({
      query: (data) => ({
        url: '/api/service/warranty',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Warranty'],
    }),
    updateWarrantyClaim: builder.mutation({
      query: (data) => ({
        url: `/api/service/warranty/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Warranty'],
    }),
    deleteWarrantyClaim: builder.mutation({
      query: (id) => ({
        url: `/api/service/warranty/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Warranty'],
    }),
    getRepairList: builder.query({
      query: () => '/api/service/repairs',
      providesTags: ['JobCard'],
    }),
    getInspectionByJobCard: builder.query({
      query: (id) => `/api/service/inspections/jobcard/${id}`,
      providesTags: ['Inspection'],
    }),
    upsertInspection: builder.mutation({
      query: (data) => ({
        url: '/api/service/inspections',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inspection', 'JobCard'],
    }),
    approveInspection: builder.mutation({
      query: (id) => ({
        url: `/api/service/inspections/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Inspection'],
    }),
  }),
});


export const { 
  useGetInsurancePoliciesQuery, 
  useCreateInsurancePolicyMutation,
  useDeleteInsurancePolicyMutation,
  useGetWarrantyClaimsQuery,
  useCreateWarrantyClaimMutation,
  useUpdateWarrantyClaimMutation,
  useDeleteWarrantyClaimMutation,
  useGetRepairListQuery,
  useGetInspectionByJobCardQuery,
  useUpsertInspectionMutation,
  useApproveInspectionMutation,
} = serviceApiSlice;

