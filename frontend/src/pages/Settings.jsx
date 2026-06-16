import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Building, Mail, Lock, Bell, Globe, Database } from 'lucide-react';

const SettingsSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center space-x-3">
            <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-xl"><Icon className="h-5 w-5 text-primary" /></div>
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-8 space-y-6">{children}</div>
    </div>
);

const Field = ({ label, defaultValue, type = 'text', placeholder }) => (
    <div>
        <label className="block text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</label>
        <input type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white" />
    </div>
);

const Toggle = ({ label, description, defaultChecked = false }) => {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="flex justify-between items-center bg-slate-50/20 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
            <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{label}</p>
                {description && <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 font-medium">{description}</p>}
            </div>
            <button
                onClick={() => setOn(!on)}
                className={`relative w-12 h-6 rounded-full transition-all ${on ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
        </div>
    );
};

const Settings = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Configure the service center ERP system preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SettingsSection icon={Building} title="Business Information">
                <Field label="Business Name" defaultValue="Golden Auto Service Center" />
                <Field label="Registration No." defaultValue="REG-2024-001" />
                <Field label="Address" defaultValue="123 Main Street, Colombo 10" />
                <Field label="Contact Number" defaultValue="+94 11 234 5678" type="tel" />
            </SettingsSection>

            <SettingsSection icon={Mail} title="Email Configuration">
                <Field label="SMTP Host" defaultValue="smtp.gmail.com" />
                <Field label="SMTP Port" defaultValue="587" type="number" />
                <Field label="Email Address" defaultValue="admin@example.com" type="email" />
                <Field label="App Password" placeholder="App-specific password" type="password" />
            </SettingsSection>

            <SettingsSection icon={Bell} title="Notifications">
                <Toggle label="Low Stock Alerts" description="Notify when inventory falls below reorder level" defaultChecked={true} />
                <Toggle label="Appointment Reminders" description="Send reminders 24h before appointments" defaultChecked={true} />
                <Toggle label="Service Due Alerts" description="Remind customers about upcoming service schedules" defaultChecked={false} />
                <Toggle label="Payment Due Notifications" description="Alert on overdue invoices" defaultChecked={true} />
            </SettingsSection>

            <SettingsSection icon={Lock} title="Security">
                <Toggle label="Two-Factor Authentication" description="Require OTP on admin login" defaultChecked={false} />
                <Toggle label="Session Timeout" description="Auto-logout after 30 minutes of inactivity" defaultChecked={true} />
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Field label="Change Admin Password" type="password" placeholder="New password..." />
                </div>
            </SettingsSection>
        </div>

        <div className="flex justify-end">
            <button className="flex items-center px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                <Save className="mr-2 h-4 w-4" /> Save All Settings
            </button>
        </div>
    </div>
);

export default Settings;
