import React, { useState, useEffect } from 'react';

const panelBg = { background: '#f7fafc', color: '#222', minHeight: '100vh' };
const cardStyle = { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, marginBottom: 20 };

function UserPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '', service: '', time: '' });
  const [success, setSuccess] = useState('');
  const [payUrl, setPayUrl] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(r => r.json())
      .then(setServices);
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    setSuccess('');
    setPayUrl('');
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSuccess('Buyurtma qabul qilindi!');
      setForm({ name: '', phone: '', address: '', service: '', time: '' });
      // Click to‘lov linkini olish
      const serviceObj = services.find(s => s.name === form.service);
      if (serviceObj) {
        const payRes = await fetch('http://localhost:5000/api/click-pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: serviceObj.price, phone: form.phone })
        });
        const payData = await payRes.json();
        setPayUrl(payData.url);
      }
    }
  };

  return (
    <div style={panelBg}>
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
        <h2 style={{ color: '#0077cc' }}>BILLUR — Kimyoviy Tozalash Marketi</h2>
        <div style={cardStyle}>
          <h3>Xizmatlar</h3>
          <ul>
            {services.map((s, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{s.name} — {s.price} so‘m</li>
            ))}
          </ul>
        </div>
        <div style={cardStyle}>
          <h3>Buyurtma berish</h3>
          <form onSubmit={handleOrder}>
            <input placeholder="Ism" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ width: '100%', marginBottom: 8 }} />
            <input placeholder="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required style={{ width: '100%', marginBottom: 8 }} />
            <input placeholder="Manzil" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required style={{ width: '100%', marginBottom: 8 }} />
            <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} required style={{ width: '100%', marginBottom: 8 }}>
              <option value="">Xizmatni tanlang</option>
              {services.map((s, i) => (
                <option key={i} value={s.name}>{s.name}</option>
              ))}
            </select>
            <input placeholder="Vaqt (masalan, 15:00)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required style={{ width: '100%', marginBottom: 8 }} />
            <button type="submit" style={{ background: '#0077cc', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', width: '100%' }}>Buyurtma berish</button>
          </form>
          {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
          {payUrl && (
            <div style={{ marginTop: 15 }}>
              <a href={payUrl} target="_blank" rel="noopener" style={{ background: '#00c896', color: '#fff', padding: '10px 20px', borderRadius: 4, textDecoration: 'none', display: 'inline-block' }}>
                Click orqali to‘lov qilish
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    if (res.ok) {
      setLoggedIn(true);
    } else {
      setError('Parol noto‘g‘ri');
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetch('http://localhost:5000/api/services')
        .then(r => r.json())
        .then(setServices);
      fetch('http://localhost:5000/api/orders')
        .then(r => r.json())
        .then(setOrders);
    }
  }, [loggedIn]);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    await fetch('http://localhost:5000/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService)
    });
    setNewService({ name: '', price: '' });
    fetch('http://localhost:5000/api/services')
      .then(r => r.json())
      .then(setServices);
  };

  if (!showAdmin) {
    return (
      <div>
        <UserPage />
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <button onClick={() => setShowAdmin(true)} style={{ background: '#0077cc', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px' }}>Admin panelga o‘tish</button>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div style={{ ...panelBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...cardStyle, maxWidth: 400 }}>
          <h2 style={{ color: '#0077cc' }}>Admin panelga kirish</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label>Ism:</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
            </div>
            <div style={{ marginTop: 10 }}>
              <label>Parol:</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} />
            </div>
            {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
            <button type="submit" style={{ marginTop: 15, background: '#0077cc', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}>Kirish</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={panelBg}>
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 20 }}>
        <h2 style={{ color: '#0077cc' }}>Admin panel</h2>
        <div style={cardStyle}>
          <h3>Xizmat qo‘shish</h3>
          <form onSubmit={handleAddService} style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Xizmat nomi" value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} required style={{ flex: 2 }} />
            <input placeholder="Narxi" value={newService.price} onChange={e => setNewService(s => ({ ...s, price: e.target.value }))} required style={{ flex: 1 }} />
            <button type="submit" style={{ background: '#0077cc', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px' }}>Qo‘shish</button>
          </form>
          <ul style={{ marginTop: 20 }}>
            {services.map((s, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{s.name} — {s.price} so‘m</li>
            ))}
          </ul>
        </div>
        <div style={cardStyle}>
          <h3>Buyurtmalar ro‘yxati</h3>
          <ul>
            {orders.map((o, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                <b>{o.name}</b> — {o.phone} — {o.address} — {o.service} — {o.time}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <button onClick={() => setShowAdmin(false)} style={{ background: '#0077cc', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px' }}>Foydalanuvchi sahifasiga o‘tish</button>
        </div>
      </div>
    </div>
  );
}
