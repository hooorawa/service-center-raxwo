import { apiSlice } from './apiSlice';

export const hrApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => '/api/hr',
      providesTags: ['Employee'],
    }),
    registerEmployee: builder.mutation({
      query: (data) => ({
        url: '/api/hr',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation({
      query: (data) => ({
        url: `/api/hr/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Employee'],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/api/hr/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
    recordAttendance: builder.mutation({
      query: (data) => ({
        url: '/api/hr/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getAttendance: builder.query({
      query: () => '/api/hr/attendance',
      providesTags: ['Attendance'],
    }),
    getLeaveRequests: builder.query({
      query: () => '/api/hr/leave',
      providesTags: ['Leave'],
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/hr/leave/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Leave'],
    }),
    getLoans: builder.query({
      query: () => '/api/hr/loans',
      providesTags: ['Loan'],
    }),
    createLoan: builder.mutation({
      query: (data) => ({
        url: '/api/hr/loans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Loan'],
    }),
    getAttendancePolicies: builder.query({
      query: () => '/api/hr/attendance/policies',
      providesTags: ['Attendance'],
    }),
    createAttendancePolicy: builder.mutation({
      query: (data) => ({
        url: '/api/hr/attendance/policies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getLeavePolicies: builder.query({
      query: () => '/api/hr/leave/policies',
      providesTags: ['Leave'],
    }),
    createLeavePolicy: builder.mutation({
      query: (data) => ({
        url: '/api/hr/leave/policies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Leave'],
    }),
    getSalaryAdvances: builder.query({
      query: () => '/api/hr/advances',
      providesTags: ['Loan'],
    }),
    createSalaryAdvance: builder.mutation({
      query: (data) => ({
        url: '/api/hr/advances',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Loan'],
    }),
    updateAdvanceStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/hr/advances/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Loan'],
    }),
  }),
});

export const { 
  useGetEmployeesQuery, 
  useRegisterEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useRecordAttendanceMutation,
  useGetAttendanceQuery,
  useGetLeaveRequestsQuery,
  useUpdateLeaveStatusMutation,
  useGetLoansQuery,
  useCreateLoanMutation,
  useGetAttendancePoliciesQuery,
  useCreateAttendancePolicyMutation,
  useGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useGetSalaryAdvancesQuery,
  useCreateSalaryAdvanceMutation,
  useUpdateAdvanceStatusMutation,
} = hrApiSlice;
