import { apiSlice } from './apiSlice';

export const communicationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSMSLogs: builder.query({
      query: () => '/api/communication/sms',
      providesTags: ['Communication'],
    }),
    getEmailLogs: builder.query({
      query: () => '/api/communication/email',
      providesTags: ['Communication'],
    }),
  }),
});

export const {
  useGetSMSLogsQuery,
  useGetEmailLogsQuery,
} = communicationApiSlice;
