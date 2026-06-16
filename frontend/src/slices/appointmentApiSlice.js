import { apiSlice } from './apiSlice';

export const appointmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: () => '/api/appointments',
      providesTags: ['Appointment'],
    }),
    bookAppointment: builder.mutation({
      query: (data) => ({
        url: '/api/appointments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Appointment'],
    }),
    updateAppointment: builder.mutation({
      query: (data) => ({
        url: `/api/appointments/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Appointment'],
    }),
    deleteAppointment: builder.mutation({
      query: (id) => ({
        url: `/api/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const { 
  useGetAppointmentsQuery, 
  useBookAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation
} = appointmentApiSlice;
