import { apiSlice } from './apiSlice';

export const jobCardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getJobCards: builder.query({
      query: () => '/api/jobcards',
      providesTags: ['JobCard'],
    }),
    getJobCardById: builder.query({
      query: (id) => `/api/jobcards/${id}`,
      providesTags: ['JobCard'],
    }),
    createJobCard: builder.mutation({
      query: (data) => ({
        url: '/api/jobcards',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['JobCard', 'Vehicle'],
    }),
    updateJobCard: builder.mutation({
      query: (data) => ({
        url: `/api/jobcards/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['JobCard'],
    }),
    deleteJobCard: builder.mutation({
      query: (id) => ({
        url: `/api/jobcards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['JobCard'],
    }),
  }),
});

export const { 
  useGetJobCardsQuery, 
  useGetJobCardByIdQuery,
  useCreateJobCardMutation,
  useUpdateJobCardMutation,
  useDeleteJobCardMutation
} = jobCardApiSlice;
