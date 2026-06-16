import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { ThemeProvider } from './context/ThemeContext';

// Static imports (original pages — known working)
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Appointments from './pages/Appointments';
import JobCards from './pages/JobCards';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Repairs from './pages/Repairs';
import Insurance from './pages/Insurance';
import Warranty from './pages/Warranty';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Loans from './pages/Loans';
import Quotations from './pages/Quotations';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Services from './pages/Services';
import CashRegister from './pages/CashRegister';
import WorkshopQueue from './pages/WorkshopQueue';
import PortalLogin from './pages/PortalLogin';
import PortalDashboard from './pages/PortalDashboard';
import CustomerLedger from './pages/CustomerLedger';
import Banking from './pages/Banking';





// Lazy imports (new enterprise pages)
const Payroll = lazy(() => import('./pages/Payroll'));
const PettyCash = lazy(() => import('./pages/PettyCash'));
const Transactions = lazy(() => import('./pages/Transactions'));
const CommunicationLogs = lazy(() => import('./pages/CommunicationLogs'));


// Simple error boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
                    <h2>Page Error</h2>
                    <pre>{this.state.error?.message}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const Loading = () => (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading...</div>
);

import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={<ProtectedRoute />}>
                        <Route path="/" element={<AppLayout />}>
                            <Route index element={<Dashboard />} />
                            {/* CRM */}
                            <Route path="customers" element={<Customers />} />
                            <Route path="customers/:id/ledger" element={<CustomerLedger />} />
                            <Route path="vehicles" element={<Vehicles />} />

                            <Route path="appointments" element={<Appointments />} />
                            {/* Service Operations */}
                            <Route path="job-cards" element={<JobCards />} />
                            <Route path="workshop-queue" element={<WorkshopQueue />} />
                            <Route path="repairs" element={<Repairs />} />

                            <Route path="services" element={<Services />} />
                            <Route path="insurance" element={<Insurance />} />
                            <Route path="warranty" element={<Warranty />} />
                            {/* Inventory */}
                            <Route path="inventory" element={<Inventory />} />
                            <Route path="suppliers" element={<Suppliers />} />
                            <Route path="purchases" element={<Purchases />} />
                            {/* HR */}
                            <Route path="employees" element={<Employees />} />
                            <Route path="attendance" element={<Attendance />} />
                            <Route path="leave" element={<Leave />} />
                            <Route path="loans" element={<Loans />} />
                            <Route path="payroll" element={<Suspense fallback={<Loading />}><ErrorBoundary><Payroll /></ErrorBoundary></Suspense>} />
                            {/* Finance */}
                            <Route path="quotations" element={<Quotations />} />
                            <Route path="invoices" element={<Invoices />} />
                            <Route path="payments" element={<Payments />} />
                            <Route path="petty-cash" element={<Suspense fallback={<Loading />}><ErrorBoundary><PettyCash /></ErrorBoundary></Suspense>} />
                            <Route path="cash-register" element={<CashRegister />} />
                            <Route path="banking" element={<Banking />} />
                            <Route path="transactions" element={<Suspense fallback={<Loading />}><ErrorBoundary><Transactions /></ErrorBoundary></Suspense>} />


                            <Route path="communication" element={<Suspense fallback={<Loading />}><ErrorBoundary><CommunicationLogs /></ErrorBoundary></Suspense>} />
                            {/* Admin */}
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Route>

                    {/* Customer Portal Routes */}
                    <Route path="/portal/login" element={<PortalLogin />} />
                    <Route path="/portal/dashboard" element={<PortalDashboard />} />

                    {/* Catch-all: redirect unknown routes to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>

            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
