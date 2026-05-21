import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, ArrowRight, BarChart3, BriefcaseBusiness, Car, CheckCircle2,
  CreditCard,
  ClipboardList, Database, Gauge, LockKeyhole, LogOut, MessageSquare, Moon,
  Package, Phone, QrCode, ReceiptText, Shield, ShoppingCart, Sparkles, Sun, Upload, UserPlus, Users, Wrench, X
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './styles.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || '';
const GARAGE_PHONE = '+919999999999';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85';

function request(path, options = {}) {
  const token = localStorage.getItem('torqueiq_token');
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    });
}

async function downloadFile(path, filename) {
  const token = localStorage.getItem('torqueiq_token');
  const response = await fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error('Unable to download invoice PDF');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState('');
  const [section, setSection] = useState('dashboard');

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    if (!localStorage.getItem('torqueiq_token')) return;
    request('/api/auth/me')
      .then(({ user: me }) => setUser(me))
      .catch(() => localStorage.removeItem('torqueiq_token'));
  }, []);

  const logout = () => {
    localStorage.removeItem('torqueiq_token');
    setUser(null);
    setSection('dashboard');
    notify('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#f7fbfb] text-slate-950 transition dark:bg-[#081113] dark:text-white">
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>
      {!user ? (
        <Landing setUser={setUser} notify={notify} dark={dark} setDark={setDark} />
      ) : (
        <Shell user={user} logout={logout} section={section} setSection={setSection} notify={notify} dark={dark} setDark={setDark} />
      )}
    </div>
  );
}

function Toast({ message }) {
  return (
    <motion.div
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -24, opacity: 0 }}
      className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-lg border border-teal-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-premium dark:border-teal-500/30 dark:bg-[#0e1d20] dark:text-white"
    >
      {message}
    </motion.div>
  );
}

function Landing({ setUser, notify, dark, setDark }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState('login');

  const openAuth = (nextMode) => {
    setMode(nextMode);
    setAuthOpen(true);
  };

  const saveSession = (data) => {
    localStorage.setItem('torqueiq_token', data.token);
    setUser(data.user);
    setAuthOpen(false);
    notify(data.message);
  };

  return (
    <div className="relative overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#081113]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-600 text-white"><Gauge size={22} /></div>
            <div>
              <p className="text-base font-black">TorqueIQ Nexus</p>
              <p className="text-xs text-slate-500">Provided by Abhishek Jatav</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a className="icon-btn light" href={`tel:${GARAGE_PHONE}`} title="Direct call"><Phone size={18} /></a>
            <button className="icon-btn light" type="button" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="secondary-btn compact hidden sm:inline-flex" type="button" onClick={() => openAuth('login')}><LockKeyhole size={17} /> Login</button>
            <button className="primary-btn compact" type="button" onClick={() => openAuth('signup')}><UserPlus size={17} /> Signup</button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {authOpen && <AuthPopover mode={mode} setMode={setMode} close={() => setAuthOpen(false)} saveSession={saveSession} notify={notify} />}
      </AnimatePresence>

      <main>
        <section className="hero-section">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-[1fr_.82fr] lg:grid-cols-[1fr_.92fr] lg:py-16">
            <div>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="eyebrow"><Sparkles size={16} /> AI automobile service analytics</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 }} className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 dark:text-white md:text-5xl xl:text-6xl">Premium car service operations, intelligently managed.</motion.h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">A real workflow platform for customers, staff, mechanics, and the Boss dashboard. Track repairs, manage complaints, view revenue, and use AI repair intelligence after secure login.</motion.p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="primary-btn" type="button" onClick={() => openAuth('signup')}>Create account <ArrowRight size={18} /></button>
                <button className="secondary-btn light-surface" type="button" onClick={() => openAuth('login')}><LockKeyhole size={18} /> Secure login</button>
                <a className="secondary-btn light-surface" href={`tel:${GARAGE_PHONE}`}><Phone size={18} /> Call garage</a>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .1 }} className="hero-visual">
              <img src={HERO_IMAGE} alt="Modern premium sports car in a clean automotive banner" />
              <div className="hero-dashboard-card">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Live after login</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <PreviewMini icon={Wrench} label="Repairs" />
                  <PreviewMini icon={BarChart3} label="Analytics" />
                  <PreviewMini icon={Shield} label="Boss" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <PublicPreview />
      </main>
    </div>
  );
}

function PublicPreview() {
  const analytics = [
    ['Repair workload', 'Visible after real service requests are created.'],
    ['Revenue pipeline', 'Boss-only view connected to completed bills.'],
    ['Vehicle health', 'AI estimates generated from actual vehicle inputs.']
  ];
  const services = [
    ['Customer service desk', 'Vehicle details, complaints, messages, repair tracking, bills.'],
    ['Mechanic workspace', 'Accept jobs, update repair status, upload proof photos.'],
    ['Boss command center', 'Staff records, customer records, complaints, revenue, inventory.']
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Public preview</p>
            <h2 className="text-3xl font-black md:text-4xl">Analytics without exposing private data</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">This homepage shows capability previews only. Customer, staff, repair, payment, and revenue records appear only after secure signup/login and permanent database persistence.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {analytics.map(([title, body]) => <InfoCard key={title} icon={Activity} title={title} body={body} />)}
        </div>
        <PlatformQr />
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-white/10 dark:bg-white/[.03]">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="section-kicker">Service workflow</p>
            <h2 className="text-3xl font-black md:text-4xl">Built for the daily garage floor.</h2>
            <p className="mt-4 text-slate-500">Every role receives only the workspace they need. No seeded customer records, no fake repair history, no public exposure of private operations.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {services.map(([title, body]) => <InfoCard key={title} icon={CheckCircle2} title={title} body={body} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="dashboard-preview">
          <div>
            <p className="section-kicker">Dashboard preview</p>
            <h2 className="text-3xl font-black md:text-4xl">Clean, role-based control after login.</h2>
            <p className="mt-4 max-w-xl text-slate-500">Customer dashboard, staff workbench, and Boss analytics are separated with protected routes and JWT sessions.</p>
          </div>
          <div className="preview-board">
            <PreviewRow label="Customer" value="Repairs, complaints, messages" />
            <PreviewRow label="Staff" value="Assigned work and repair updates" />
            <PreviewRow label="Boss" value="Revenue, records, inventory, controls" />
          </div>
        </div>
      </section>
    </>
  );
}

function PlatformQr() {
  const [qr, setQr] = useState('');
  useEffect(() => { request('/api/invoices/platform-qr').then((data) => setQr(data.qrDataUrl)).catch(() => setQr('')); }, []);
  if (!qr) return null;
  return <div className="panel mt-5 flex flex-col gap-4 sm:flex-row sm:items-center"><img src={qr} alt="TorqueIQ Nexus platform QR code" className="h-28 w-28 rounded-lg border border-slate-200" /><div><h3 className="font-black">Scan to open TorqueIQ Nexus</h3><p className="text-sm text-slate-500">Permanent platform QR access for customers on mobile.</p></div></div>;
}

function AuthPopover({ mode, setMode, close, saveSession, notify }) {
  const [form, setForm] = useState({ role: 'customer', identifier: '', password: '', name: '', mobile: '', email: '', staffSkill: '' });
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        saveSession(await request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier: form.identifier, password: form.password })
        }));
      } else {
        saveSession(await request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            mobile: form.mobile,
            password: form.password,
            role: form.role,
            staffSkill: form.staffSkill
          })
        }));
      }
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: .98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: .98 }}
      className="auth-popover"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-black">{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
          <p className="text-sm text-slate-500">Secure access to TorqueIQ Nexus</p>
        </div>
        <button className="icon-btn light" type="button" onClick={close} title="Close"><X size={18} /></button>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-white/10">
        <button type="button" onClick={() => setMode('login')} className={`tab-btn ${mode === 'login' ? 'tab-active' : ''}`}>Login</button>
        <button type="button" onClick={() => setMode('signup')} className={`tab-btn ${mode === 'signup' ? 'tab-active' : ''}`}>Signup</button>
      </div>
      <form onSubmit={submit} className="grid gap-3">
        {mode === 'signup' && (
          <>
            <Field label="Full name" value={form.name} onChange={(value) => update('name', value)} />
            <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} required={false} />
            <Field label="Mobile number" value={form.mobile} onChange={(value) => update('mobile', value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Role" value={form.role} onChange={(value) => update('role', value)} options={['customer', 'staff']} />
              <Field label="Staff skill" value={form.staffSkill} onChange={(value) => update('staffSkill', value)} disabled={form.role !== 'staff'} required={form.role === 'staff'} />
            </div>
          </>
        )}
        {mode === 'login' && <Field label="Email, mobile, or Boss ID" value={form.identifier} onChange={(value) => update('identifier', value)} />}
        <Field label="Password" type="password" value={form.password} onChange={(value) => update('password', value)} />
        {mode === 'login' && <p className="text-xs text-slate-500">Boss: boss2026 · Accounts: account2026</p>}
        <button className="primary-btn w-full justify-center" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
    </motion.div>
  );
}

function Shell({ user, logout, section, setSection, notify, dark, setDark }) {
  const roleNav = {
    customer: [['dashboard', BarChart3], ['vehicles', Car], ['repairs', Wrench], ['marketplace', ShoppingCart], ['payments', CreditCard], ['complaints', ClipboardList], ['messages', MessageSquare], ['ai', Sparkles]],
    staff: [['dashboard', BarChart3], ['repairs', Wrench], ['marketplace', ShoppingCart], ['messages', MessageSquare], ['ai', Sparkles]],
    boss: [['dashboard', BarChart3], ['records', Users], ['complaints', ClipboardList], ['inventory', Package], ['payments', CreditCard], ['messages', MessageSquare], ['ai', Sparkles], ['system', Database]],
    accounts: [['dashboard', BarChart3], ['billing', ReceiptText], ['payments', CreditCard], ['messages', MessageSquare]]
  };
  const nav = roleNav[user.role] || roleNav.customer;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-r border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b171a] lg:w-72">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-600 text-white"><Car /></div>
          <div>
            <p className="font-black">TorqueIQ Nexus</p>
            <p className="text-xs text-slate-500">Provided by Abhishek Jatav</p>
          </div>
        </div>
        <div className="mb-5 rounded-lg bg-slate-100 p-3 text-sm dark:bg-white/5">
          <p className="font-semibold">{user.name}</p>
          <p className="capitalize text-slate-500">{user.role} workspace</p>
        </div>
        <nav className="grid gap-2">
          {nav.map(([item, Icon]) => <button key={item} type="button" onClick={() => setSection(item)} className={`nav-btn ${section === item ? 'nav-active' : ''}`}><Icon size={18} /> {item}</button>)}
        </nav>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <button className="icon-btn light" type="button" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <a className="icon-btn light" href={`tel:${GARAGE_PHONE}`} title="Call garage"><Phone size={17} /></a>
          <button className="icon-btn light" type="button" onClick={logout} title="Logout"><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-7">
        <Section section={section} user={user} notify={notify} />
      </main>
    </div>
  );
}

function Section({ section, user, notify }) {
  if (section === 'dashboard' && user.role === 'accounts') return <AccountsDashboard notify={notify} />;
  if (section === 'dashboard') return <Dashboard user={user} />;
  if (section === 'billing') return <AccountsBilling notify={notify} />;
  if (section === 'vehicles') return <Vehicles notify={notify} />;
  if (section === 'repairs') return user.role === 'staff' ? <StaffJobs notify={notify} /> : <Repairs notify={notify} />;
  if (section === 'records') return <BossRecords notify={notify} />;
  if (section === 'complaints') return <Complaints user={user} notify={notify} />;
  if (section === 'inventory' || section === 'marketplace') return <Inventory user={user} notify={notify} />;
  if (section === 'payments') return <Payments user={user} notify={notify} />;
  if (section === 'messages') return <Messages notify={notify} />;
  if (section === 'system') return <SystemManagement notify={notify} />;
  return <AIStudio notify={notify} />;
}

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    request('/api/analytics/dashboard').then(setData).catch((err) => setError(err.message));
  }, []);
  const status = data?.statusCounts || {};
  const hasStatus = Object.values(status).some(Boolean);
  return (
    <Page title={`${user.role === 'boss' ? 'Master' : user.role === 'staff' ? 'Staff' : 'Customer'} Dashboard`} icon={Gauge}>
      {error && <Empty text={error} />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {user.role === 'customer' && <Metric label="Customer ID" value={user.customerId || 'Pending'} icon={QrCode} />}
        <Metric label="Total customers" value={data?.totalCustomers ?? 'Role scoped'} icon={Shield} />
        <Metric label="Pending repairs" value={data?.pendingRepairs ?? 0} icon={Wrench} />
        <Metric label="Completed repairs" value={data?.completedRepairs ?? 0} icon={CheckCircle2} />
        <Metric label="Revenue" value={`Rs. ${data?.revenue ?? 0}`} icon={BriefcaseBusiness} />
        {user.role === 'boss' && <Metric label="Product sales" value={data?.productSales ?? 0} icon={ShoppingCart} />}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Panel title="Repair status mix">{hasStatus ? <Doughnut data={{ labels: Object.keys(status), datasets: [{ data: Object.values(status), backgroundColor: ['#0f766e', '#14b8a6', '#22c55e', '#f59e0b', '#64748b'] }] }} /> : <Empty text="No repair records yet." />}</Panel>
        <Panel title="Vehicle analytics">{data?.vehicleAnalytics?.length ? <Bar data={{ labels: data.vehicleAnalytics.map((v) => v._id), datasets: [{ label: 'Vehicles', data: data.vehicleAnalytics.map((v) => v.count), backgroundColor: '#0f766e' }] }} /> : <Empty text="Vehicle analytics appear after customers add vehicles." />}</Panel>
      </div>
      <Panel title="AI insights" className="mt-5">
        <div className="grid gap-3 md:grid-cols-3">{(data?.aiInsights || []).map((item) => <div className="rounded-lg border border-slate-200 p-4 text-sm dark:border-white/10 dark:bg-white/5" key={item}>{item}</div>)}</div>
      </Panel>
    </Page>
  );
}

function Vehicles({ notify }) {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ registrationNumber: '', make: '', model: '', year: '', fuelType: 'petrol', odometerKm: '' });
  const load = () => request('/api/customer/vehicles').then(setVehicles).catch((error) => notify(error.message));
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await request('/api/customer/vehicles', { method: 'POST', body: JSON.stringify(form) });
      notify('Vehicle added');
      setForm({ registrationNumber: '', make: '', model: '', year: '', fuelType: 'petrol', odometerKm: '' });
      load();
    } catch (error) { notify(error.message); }
  };
  return <Page title="Vehicle Garage" icon={Car}><FormGrid onSubmit={submit}>{Object.keys(form).map((key) => key === 'fuelType' ? <Select key={key} label="Fuel type" value={form[key]} onChange={(v) => setForm({ ...form, [key]: v })} options={['petrol', 'diesel', 'cng', 'ev', 'hybrid']} /> : <Field key={key} label={labelize(key)} value={form[key]} onChange={(v) => setForm({ ...form, [key]: v })} />)}<button className="primary-btn justify-center">Save vehicle</button></FormGrid><List items={vehicles} empty="No vehicles yet. Add your real vehicle to begin service tracking." render={(v) => <Card title={`${v.registrationNumber} - ${v.make} ${v.model}`} meta={`${v.fuelType} - ${v.odometerKm || 0} km`} />} /></Page>;
}

function Repairs({ notify }) {
  const [jobs, setJobs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ vehicle: '', issueType: '', description: '', priority: 'normal' });
  const load = () => {
    request('/api/customer/jobs').then(setJobs).catch((error) => notify(error.message));
    request('/api/customer/vehicles').then(setVehicles).catch(() => setVehicles([]));
  };
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await request('/api/customer/jobs', { method: 'POST', body: fd });
      notify('Service request submitted with AI estimate');
      load();
      e.currentTarget.reset();
    } catch (error) { notify(error.message); }
  };
  return <Page title="Repair Requests" icon={Wrench}><form onSubmit={submit} className="panel grid gap-3 md:grid-cols-2"><Select native name="vehicle" label="Vehicle" value={form.vehicle} onChange={(v) => setForm({ ...form, vehicle: v })} options={vehicles.map((v) => ({ label: `${v.registrationNumber} ${v.make} ${v.model}`, value: v._id }))} /><Field name="issueType" label="Issue/problem" value={form.issueType} onChange={(v) => setForm({ ...form, issueType: v })} /><Select native name="priority" label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={['normal', 'high', 'emergency']} /><Field name="description" label="Complaint description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} /><label className="field md:col-span-2"><span>Issue photos</span><input name="photos" type="file" multiple accept="image/*" /></label><button className="primary-btn justify-center md:col-span-2"><Upload size={18} /> Submit repair</button></form><List items={jobs} empty="No repair history yet." render={(j) => <Card title={`${j.issueType} - ${j.status}`} meta={`${j.vehicle?.registrationNumber || ''} - AI estimate Rs. ${j.aiEstimate?.costMin || 0} to Rs. ${j.aiEstimate?.costMax || 0} - Health ${j.aiEstimate?.healthScore || 0}`} action={j.status === 'completed' && !j.completedByCustomer ? <button className="secondary-btn light-surface" type="button" onClick={() => request(`/api/customer/jobs/${j._id}/complete`, { method: 'PATCH' }).then(() => { notify('Work marked completed'); load(); })}>Mark completed</button> : null} />} /></Page>;
}

function StaffJobs({ notify }) {
  const [open, setOpen] = useState([]);
  const [mine, setMine] = useState([]);
  const load = () => {
    request('/api/staff/jobs/open').then(setOpen).catch((error) => notify(error.message));
    request('/api/staff/jobs/mine').then(setMine).catch(() => setMine([]));
  };
  useEffect(() => { load(); }, []);
  const update = async (id, status) => {
    try {
      await request(`/api/staff/jobs/${id}`, { method: 'PATCH', body: JSON.stringify({ status, note: `Moved to ${status}` }) });
      notify('Repair status updated');
      load();
    } catch (error) { notify(error.message); }
  };
  return <Page title="Mechanic Dashboard" icon={Wrench}><Panel title="Customer requests"><List items={open} empty="No open customer requests right now." render={(j) => <Card title={`${j.issueType} - ${j.priority}`} meta={`${j.customer?.name || ''} - ${j.vehicle?.registrationNumber || ''}`} action={<button className="primary-btn" type="button" onClick={() => request(`/api/staff/jobs/${j._id}/accept`, { method: 'PATCH' }).then(() => { notify('Job accepted'); load(); })}>Accept</button>} />} /></Panel><Panel title="Assigned work" className="mt-5"><List items={mine} empty="Accepted jobs will appear here." render={(j) => <Card title={`${j.issueType} - ${j.status}`} meta={`${j.customer?.name || ''} - ${j.vehicle?.make || ''} ${j.vehicle?.model || ''}`} action={<select className="input" value={j.status} onChange={(e) => update(j._id, e.target.value)}><option>accepted</option><option>diagnosing</option><option>repairing</option><option>quality_check</option><option>completed</option></select>} />} /></Panel></Page>;
}

function BossRecords({ notify }) {
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const load = () => {
    request('/api/boss/staff').then(setStaff).catch((error) => notify(error.message));
    request('/api/boss/customers').then(setCustomers).catch(() => setCustomers([]));
    request('/api/boss/users').then(setUsers).catch(() => setUsers([]));
    request('/api/boss/login-history').then(setHistory).catch(() => setHistory([]));
  };
  useEffect(() => { load(); }, []);
  return <Page title="Staff & Customer Records" icon={Users}><div className="grid gap-5 xl:grid-cols-2"><Panel title="All registered users"><List items={users} empty="No users yet." render={(u) => <Card title={`${u.name} - ${u.role}`} meta={`${u.mobile} - ${u.customerId || u.loginId || 'No ID'} - Last activity ${u.lastActivity || 'Not active yet'}`} />} /></Panel><Panel title="Login history"><List items={history} empty="No login history yet." render={(h) => <Card title={`${h.name} - ${h.role}`} meta={`${h.username || h.email || h.mobile} - ${h.login_at}`} />} /></Panel><Panel title="Staff records"><List items={staff} empty="No staff accounts have signed up yet." render={(s) => <Card title={s.name} meta={`${s.mobile} - ${s.loginId || 'No ID'} - ${s.status}`} />} /></Panel><Panel title="Customer records"><List items={customers} empty="No customer accounts have signed up yet." render={(c) => <Card title={`${c.name} - ${c.customerId || 'No customer ID'}`} meta={`${c.mobile} - ${c.email || 'No email'} - ${c.status}`} />} /></Panel></div></Page>;
}

function Complaints({ user, notify }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: 'service_request', title: '', description: '' });
  const load = () => request(user.role === 'boss' ? '/api/boss/complaints' : '/api/customer/complaints').then(setItems).catch((error) => notify(error.message));
  useEffect(() => { load(); }, [user.role]);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await request('/api/customer/complaints', { method: 'POST', body: JSON.stringify(form) });
      notify('Complaint sent to Boss dashboard');
      setForm({ type: 'service_request', title: '', description: '' });
      load();
    } catch (error) { notify(error.message); }
  };
  if (user.role === 'boss') return <Page title="Customer Complaints" icon={ClipboardList}><List items={items} empty="No complaints yet." render={(c) => <Card title={`${c.title} - ${c.status}`} meta={`${c.customer?.name || ''} - ${c.type} - ${c.description}`} action={<button className="secondary-btn light-surface" type="button" onClick={() => request(`/api/boss/complaints/${c._id}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved', adminReply: 'Resolved by Boss dashboard' }) }).then(() => { notify('Complaint resolved'); load(); })}>Resolve</button>} />} /></Page>;
  return <Page title="Complaints & Service Tracking" icon={ClipboardList}><FormGrid onSubmit={submit}><Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={['service_request', 'complaint', 'emergency']} /><Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} /><button className="primary-btn justify-center">Send to Boss</button></FormGrid><List items={items} empty="No complaints or service requests yet." render={(c) => <Card title={`${c.title} - ${c.status}`} meta={`${c.type} - ${c.description}`} />} /></Page>;
}

function Inventory({ user, notify }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Engine Oil', description: '', price: '', stock: '' });
  const seenProducts = useRef(null);
  const load = (silent = false) => request('/api/inventory').then((next) => {
    if (silent && seenProducts.current !== null && next.length > seenProducts.current) notify('New product uploaded');
    seenProducts.current = next.length;
    setItems(next);
  }).catch((error) => !silent && notify(error.message));
  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 8000);
    return () => clearInterval(timer);
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await request('/api/inventory', { method: 'POST', body: fd });
      notify('New product uploaded');
      setForm({ name: '', category: 'Engine Oil', description: '', price: '', stock: '' });
      e.currentTarget.reset();
      load();
    } catch (error) { notify(error.message); }
  };
  return (
    <Page title={user.role === 'boss' ? 'Product Marketplace Manager' : 'Car & Bike Marketplace'} icon={Package}>
      {user.role === 'boss' && (
        <form onSubmit={submit} className="panel mb-5 grid gap-3 md:grid-cols-2">
          <Field name="name" label="Product name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Select native name="category" label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={['Engine Oil', 'Battery', 'Indicators', 'Tyres', 'Brake Pads', 'Engine Repair Kits', 'Car Accessories', 'Bike Accessories']} />
          <Field name="price" label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          <Field name="stock" label="Stock" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          <Field name="description" label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <label className="field"><span>Product photos</span><input name="photos" type="file" multiple accept="image/*" /></label>
          <button className="primary-btn justify-center md:col-span-2"><Upload size={18} /> Upload product</button>
        </form>
      )}
      <List items={items} empty="No products have been uploaded yet." render={(i) => <Card title={`${i.name} - Rs. ${i.price}`} meta={`${i.category} - Stock ${i.stock} - ${i.description || 'Ready for purchase or service booking'}`} image={i.imageUrl} action={user.role === 'customer' ? <button className="primary-btn" type="button" onClick={() => setSelected(i)}><ShoppingCart size={18} /> Purchase</button> : user.role === 'boss' ? <button className="secondary-btn light-surface" type="button" onClick={() => notify('Edit price/stock by re-uploading an updated product entry')}>Manage</button> : null} />} />
      {selected && <PaymentDialog product={selected} close={() => setSelected(null)} notify={notify} onPaid={() => { setSelected(null); load(); }} />}
    </Page>
  );
}

function PaymentDialog({ product, close, notify, onPaid }) {
  const [form, setForm] = useState({ method: 'UPI', transactionId: '', utrNumber: '', quantity: 1 });
  const subtotal = Number(product.price) * Number(form.quantity || 1);
  const gstAmount = Math.round(subtotal * 0.18);
  const finalAmount = subtotal + gstAmount;
  const submit = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    fd.set('subtotal', String(subtotal));
    fd.set('productCost', String(subtotal));
    fd.set('gstRate', '18');
    fd.set('gstAmount', String(gstAmount));
    fd.set('amount', String(finalAmount));
    fd.set('productId', product.id || product._id);
    try {
      const response = await request('/api/payments', { method: 'POST', body: fd });
      notify(response.message || 'Payment successful');
      onPaid();
    } catch (error) { notify(error.message); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form onSubmit={submit} className="panel w-full max-w-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div><h3 className="text-xl font-black">Complete Payment</h3><p className="text-sm text-slate-500">{product.name} - Rs. {product.price} + GST</p></div>
          <button className="icon-btn light" type="button" onClick={close}><X size={18} /></button>
        </div>
        <div className="grid gap-3">
          <Select native name="method" label="Payment method" value={form.method} onChange={(v) => setForm({ ...form, method: v })} options={['UPI', 'Card', 'Cash', 'Net Banking']} />
          <Field name="quantity" label="Quantity" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
          <Field name="transactionId" label="Transaction ID" value={form.transactionId} onChange={(v) => setForm({ ...form, transactionId: v })} required={false} />
          <Field name="utrNumber" label="UTR number" value={form.utrNumber} onChange={(v) => setForm({ ...form, utrNumber: v })} required={false} />
          <label className="field"><span>Payment screenshot</span><input name="screenshot" type="file" accept="image/*" /></label>
          <div className="rounded-lg bg-teal-50 p-3 text-sm text-slate-700">GST 18%: Rs. {gstAmount} · Final amount: Rs. {finalAmount}</div>
          <button className="primary-btn justify-center">Pay Rs. {finalAmount}</button>
        </div>
      </form>
    </div>
  );
}

function Messages({ notify }) {
  const [items, setItems] = useState([]);
  const [body, setBody] = useState('');
  const load = () => request('/api/messages').then(setItems).catch((error) => notify(error.message));
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await request('/api/messages', { method: 'POST', body: JSON.stringify({ body }) });
      notify('Message sent');
      setBody('');
      load();
    } catch (error) { notify(error.message); }
  };
  return <Page title="Messaging Center" icon={MessageSquare}><form onSubmit={submit} className="panel flex flex-col gap-3 sm:flex-row"><input className="input flex-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message support/admin" /><button className="primary-btn">Send</button></form><List items={items} empty="No messages yet." render={(m) => <Card title={m.sender?.name || 'Message'} meta={m.body} />} /></Page>;
}

function Payments({ user, notify }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState({ customerId: '', invoiceNumber: '' });
  const load = () => request(user.role === 'boss' ? '/api/boss/payments' : user.role === 'accounts' ? '/api/accounts/payments' : '/api/invoices/mine').then(setItems).catch((error) => notify(error.message));
  useEffect(() => { load(); }, [user.role]);
  const search = async (event) => {
    event.preventDefault();
    try {
      const params = new URLSearchParams();
      if (query.customerId) params.set('customerId', query.customerId);
      if (query.invoiceNumber) params.set('invoiceNumber', query.invoiceNumber);
      setItems(await request(`/api/invoices/search?${params.toString()}`));
    } catch (error) { notify(error.message); }
  };
  return (
    <Page title={user.role === 'boss' || user.role === 'accounts' ? 'Payment History' : 'My Smart Bills & Invoices'} icon={CreditCard}>
      <form onSubmit={search} className="panel mb-5 grid gap-3 md:grid-cols-3">
        <Field label="Check bill using Customer ID" value={query.customerId} onChange={(v) => setQuery({ ...query, customerId: v })} required={false} />
        <Field label="Invoice number" value={query.invoiceNumber} onChange={(v) => setQuery({ ...query, invoiceNumber: v })} required={false} />
        <button className="primary-btn justify-center">Search bill</button>
      </form>
      <List
        items={items}
        empty="No payment records yet."
        render={(p) => <Card title={`${p.customerName || p.product?.name || p.invoiceNumber || 'Payment'} - Rs. ${p.finalAmount || p.amount}`} meta={`${p.method || p.paymentStatus || p.status} - ${p.transactionId || 'No transaction ID'} - Customer ID ${p.customerId || 'N/A'} - Invoice ${p.invoiceNumber}`} image={p.screenshotUrl} action={<div className="flex flex-wrap gap-2"><InvoiceActions invoice={p} />{user.role === 'accounts' && p.status === 'pending' && <button className="primary-btn" type="button" onClick={() => request(`/api/accounts/payments/${p.id}/approve`, { method: 'PATCH' }).then((response) => { notify(response.message); load(); }).catch((error) => notify(error.message))}>Approve</button>}</div>} />}
      />
    </Page>
  );
}

function InvoiceActions({ invoice }) {
  const pdfUrl = invoice.pdfUrl || (invoice.invoiceId ? `/api/invoices/${invoice.invoiceId}/pdf` : '');
  return (
    <div className="flex flex-wrap gap-2">
      {pdfUrl && <button className="secondary-btn light-surface" type="button" onClick={() => downloadFile(pdfUrl, `${invoice.invoiceNumber || 'invoice'}.pdf`)}>PDF</button>}
      {invoice.whatsappInvoiceLink && <a className="secondary-btn light-surface" href={invoice.whatsappInvoiceLink} target="_blank" rel="noreferrer">WhatsApp</a>}
      {invoice.whatsappSupportLink && <a className="secondary-btn light-surface" href={invoice.whatsappSupportLink} target="_blank" rel="noreferrer">Support</a>}
    </div>
  );
}

function AccountsDashboard({ notify }) {
  const [data, setData] = useState(null);
  useEffect(() => { request('/api/accounts/summary').then(setData).catch((error) => notify(error.message)); }, []);
  return (
    <Page title="Accounts Department" icon={ReceiptText}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Metric label="Total revenue" value={`Rs. ${data?.totalRevenue ?? 0}`} icon={BriefcaseBusiness} />
        <Metric label="Daily income" value={`Rs. ${data?.dailyIncome ?? 0}`} icon={CreditCard} />
        <Metric label="Monthly income" value={`Rs. ${data?.monthlyIncome ?? 0}`} icon={BarChart3} />
        <Metric label="GST collected" value={`Rs. ${data?.gstCollected ?? 0}`} icon={ReceiptText} />
        <Metric label="Pending payments" value={data?.pendingPayments ?? 0} icon={ClockIcon} />
        <Metric label="Successful transactions" value={data?.successfulTransactions ?? 0} icon={CheckCircle2} />
      </div>
    </Page>
  );
}

function ClockIcon(props) {
  return <CreditCard {...props} />;
}

function AccountsBilling({ notify }) {
  const [form, setForm] = useState({ customerId: '', repairCharges: '', productCost: '', gstRate: 18, serviceTax: '', method: 'UPI', transactionId: '', utrNumber: '', notes: '' });
  const submit = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    try {
      const response = await request('/api/accounts/bills', { method: 'POST', body: fd });
      notify(response.message || 'Smart bill created');
      event.currentTarget.reset();
      setForm({ customerId: '', repairCharges: '', productCost: '', gstRate: 18, serviceTax: '', method: 'UPI', transactionId: '', utrNumber: '', notes: '' });
    } catch (error) { notify(error.message); }
  };
  return (
    <Page title="Smart Billing & GST Invoice" icon={ReceiptText}>
      <form onSubmit={submit} className="panel grid gap-3 md:grid-cols-2">
        <Field name="customerId" label="Customer unique ID" value={form.customerId} onChange={(v) => setForm({ ...form, customerId: v })} />
        <Select native name="method" label="Payment method" value={form.method} onChange={(v) => setForm({ ...form, method: v })} options={['UPI', 'Card', 'Cash', 'Net Banking']} />
        <Field name="repairCharges" label="Repair charges" value={form.repairCharges} onChange={(v) => setForm({ ...form, repairCharges: v })} />
        <Field name="productCost" label="Product cost" value={form.productCost} onChange={(v) => setForm({ ...form, productCost: v })} />
        <Field name="gstRate" label="GST rate" value={form.gstRate} onChange={(v) => setForm({ ...form, gstRate: v })} />
        <Field name="serviceTax" label="Service tax" value={form.serviceTax} onChange={(v) => setForm({ ...form, serviceTax: v })} required={false} />
        <Field name="transactionId" label="Transaction ID" value={form.transactionId} onChange={(v) => setForm({ ...form, transactionId: v })} required={false} />
        <Field name="utrNumber" label="UTR number" value={form.utrNumber} onChange={(v) => setForm({ ...form, utrNumber: v })} required={false} />
        <Field name="notes" label="Product/service details" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} required={false} />
        <label className="field"><span>Payment screenshot</span><input name="screenshot" type="file" accept="image/*" /></label>
        <button className="primary-btn justify-center md:col-span-2">Create bill for approval</button>
      </form>
    </Page>
  );
}

function AIStudio({ notify }) {
  const [form, setForm] = useState({ issueType: '', odometerKm: '', year: '', priority: 'normal' });
  const [result, setResult] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try {
      setResult(await request('/api/ai/predict-repair', { method: 'POST', body: JSON.stringify(form) }));
    } catch (error) { notify(error.message); }
  };
  return <Page title="AI Repair Intelligence" icon={Sparkles}><FormGrid onSubmit={submit}>{Object.keys(form).map((key) => key === 'priority' ? <Select key={key} label="Priority" value={form[key]} onChange={(v) => setForm({ ...form, [key]: v })} options={['normal', 'high', 'emergency']} /> : <Field key={key} label={labelize(key)} value={form[key]} onChange={(v) => setForm({ ...form, [key]: v })} />)}<button className="primary-btn justify-center">Predict cost and health</button></FormGrid>{result && <Panel title="AI result" className="mt-5"><div className="grid gap-4 md:grid-cols-4"><Metric label="Cost min" value={`Rs. ${result.costMin}`} icon={Gauge} /><Metric label="Cost max" value={`Rs. ${result.costMax}`} icon={Gauge} /><Metric label="Health score" value={result.healthScore} icon={CheckCircle2} /><Metric label="Risk" value={result.risk} icon={Shield} /></div><p className="mt-4 text-slate-500">{result.recommendation}</p></Panel>}</Page>;
}

function SystemManagement({ notify }) {
  const [secretCode, setSecretCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const changePassword = async (event) => {
    event.preventDefault();
    try {
      await request('/api/boss/password', { method: 'PATCH', body: JSON.stringify({ secretCode, newPassword }) });
      notify('Boss password changed');
      setNewPassword('');
    } catch (error) { notify(error.message); }
  };
  const resetSystem = async () => {
    try {
      await request('/api/boss/system-reset', { method: 'POST', body: JSON.stringify({ secretCode }) });
      notify('System reset completed');
    } catch (error) { notify(error.message); }
  };
  return <Page title="System Management" icon={Database}><Panel title="Secret-code protected actions"><form onSubmit={changePassword} className="grid gap-3 md:grid-cols-3"><Field label="Secret code" value={secretCode} onChange={setSecretCode} /><Field label="New Boss password" type="password" value={newPassword} onChange={setNewPassword} /><button className="primary-btn justify-center">Change password</button></form><button type="button" className="secondary-btn light-surface mt-4" onClick={resetSystem}>Reset operational data</button></Panel></Page>;
}

function Page({ title, icon: Icon, children }) {
  return <div><div className="mb-6 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-600 text-white"><Icon /></div><div><h2 className="text-2xl font-black">{title}</h2><p className="text-sm text-slate-500">Secure real-workflow workspace</p></div></div>{children}</div>;
}

function Panel({ title, children, className = '' }) {
  return <section className={`panel ${className}`}><h3 className="mb-4 font-bold">{title}</h3>{children}</section>;
}

function Metric({ label, value, icon: Icon }) {
  return <div className="panel"><div className="mb-3 flex items-center justify-between text-slate-500"><span className="text-sm">{label}</span><Icon size={18} /></div><p className="break-words text-3xl font-black">{value}</p></div>;
}

function Field({ label, value, onChange, type = 'text', disabled = false, name, required = true }) {
  return <label className="field"><span>{label}</span><input name={name} disabled={disabled} className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required && !disabled} /></label>;
}

function Select({ label, value, onChange, options, native = false, name }) {
  const opts = options.map((x) => typeof x === 'string' ? { label: x, value: x } : x);
  return <label className="field"><span>{label}</span><select name={name} className="input" value={value} onChange={(e) => onChange(e.target.value)} required={native}>{native && <option value="">Select</option>}{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}

function FormGrid({ children, onSubmit }) {
  return <form onSubmit={onSubmit} className="panel mb-5 grid gap-3 md:grid-cols-2">{children}</form>;
}

function Empty({ text }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/15">{text}</div>;
}

function Card({ title, meta, action, image }) {
  return <div className="panel flex flex-col gap-4 sm:flex-row sm:items-center"><div className="h-16 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10 sm:w-20">{image && <img src={image} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="font-bold">{title}</p><p className="break-words text-sm text-slate-500">{meta}</p></div>{action}</div>;
}

function List({ items, empty, render }) {
  return <div className="mt-5 grid gap-3">{items?.length ? items.map((item) => <React.Fragment key={item._id}>{render(item)}</React.Fragment>) : <Empty text={empty} />}</div>;
}

function InfoCard({ icon: Icon, title, body }) {
  return <div className="panel"><div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"><Icon size={20} /></div><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></div>;
}

function PreviewMini({ icon: Icon, label }) {
  return <div className="rounded-lg bg-white/90 p-3 text-center shadow-sm dark:bg-[#0b171a]/90"><Icon className="mx-auto text-teal-600" size={18} /><p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</p></div>;
}

function PreviewRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-0 dark:border-white/10"><p className="font-bold">{label}</p><p className="text-right text-sm text-slate-500">{value}</p></div>;
}

function labelize(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

createRoot(document.getElementById('root')).render(<App />);
