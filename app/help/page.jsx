'use client';

import { useState } from 'react';
import { Send, MessageCircle, X, Bot, User, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.7rem 0.875rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '0.35rem' };

const FAQS = [
  { accent: '#a78bfa', q: 'How do I invest?', a: 'Recharge your account, go to Products, select a VIP package, and tap invest. Your returns accumulate daily.' },
  { accent: '#60a5fa', q: 'How long does withdrawal take?', a: "Withdrawals are processed within 24–48 hours. You'll get a notification once completed." },
  { accent: '#10b981', q: 'Is my money safe?', a: 'Yes — bank-level encryption and optional 2FA protect your account. Enable 2FA in Account › Security.' },
  { accent: '#f59e0b', q: 'How does the referral program work?', a: 'Share your unique code and earn L1 3%, L2 2%, L3 1% commission on every investment your referrals make.' },
];

const generateBotResponse = (input) => {
  if (input.includes('invest') || input.includes('vip')) return 'We offer VIP packages (VIP0–VIP8) with different investment amounts and daily returns. Check the Products page for details.';
  if (input.includes('withdraw')) return 'Go to Withdraw, enter your amount, and submit. Processing takes 24–48 hours. A 10% fee applies.';
  if (input.includes('recharge') || input.includes('deposit')) return 'Head to the Recharge section in your dashboard. Your account credits within minutes after confirmation.';
  if (input.includes('referral') || input.includes('refer')) return 'Find your unique referral code in the Referrals section. Earn multi-level commissions when friends invest.';
  if (input.includes('account') || input.includes('profile')) return 'Manage your account from Account settings — update profile, change password, enable 2FA, and complete KYC.';
  if (input.includes('security') || input.includes('2fa')) return 'We recommend enabling 2FA in Account › Security for extra protection. We use end-to-end encryption.';
  if (input.includes('hi') || input.includes('hello') || input.includes('hey')) return "Hello! Welcome to SalonMoney support. How can I help you with investments, withdrawals, or your account?";
  return "For detailed help, fill out the contact form or reach our support team via the Contact page. We're available 24/7.";
};

export default function HelpCenter() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen]   = useState(false);
  const [messages, setMessages]   = useState([{ sender: 'bot', text: "Hello! I'm your SalonMoney assistant. How can I help you today?" }]);
  const [chatInput, setChatInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(m => [...m, { sender: 'user', text: chatInput }]);
    setTimeout(() => setMessages(m => [...m, { sender: 'bot', text: generateBotResponse(chatInput.toLowerCase()) }]), 800);
    setChatInput('');
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, position: 'relative' }}>
      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .08)', filter: 'blur(120px)', top: -150, right: -100 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(100px)', bottom: -80, left: -80 }} />
      </div>

      {/* Chat modal */}
      {chatOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 560, height: 560, display: 'flex', flexDirection: 'column', background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(124,58,237,0.3)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="#a78bfa" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>SalonMoney Assistant</p>
                  <p style={{ fontSize: '0.7rem', color: '#10b981' }}>Online</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 0 }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: msg.sender === 'bot' ? 'rgba(167,139,250,0.2)' : 'rgba(96,165,250,0.2)', border: `1px solid ${msg.sender === 'bot' ? 'rgba(167,139,250,0.4)' : 'rgba(96,165,250,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {msg.sender === 'bot' ? <Bot size={14} color="#a78bfa" /> : <User size={14} color="#60a5fa" />}
                  </div>
                  <div style={{ maxWidth: '72%', padding: '0.625rem 0.875rem', borderRadius: msg.sender === 'bot' ? '4px 14px 14px 14px' : '14px 4px 14px 14px', background: msg.sender === 'bot' ? 'rgba(255,255,255,0.07)' : 'rgba(96,165,250,0.15)', border: `1px solid ${msg.sender === 'bot' ? 'rgba(255,255,255,0.1)' : 'rgba(96,165,250,0.25)'}`, fontSize: '0.82rem', color: '#fff', lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleChat} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.875rem', display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message…" style={{ ...inputStyle, flex: 1 }} />
              <button type="submit" style={{ padding: '0 1rem', borderRadius: 10, background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', cursor: 'pointer', lineHeight: 0 }}><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <HelpCircle size={28} color="#a78bfa" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Help Center</h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>Send us a message or chat with our assistant</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Contact form */}
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
              <Send size={18} color="#a78bfa" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Send Us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your full name" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="your@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} placeholder="What's this about?" />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} placeholder="Tell us how we can help…" />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', borderRadius: 12, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', fontWeight: 800, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* FAQ */}
            <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {FAQS.map(({ accent, q, a }) => (
                  <div key={q} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '0.875rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>{q}</p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Chat CTA */}
            <div style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 20, padding: '1.75rem', textAlign: 'center' }}>
              <MessageCircle size={36} color="#a78bfa" style={{ margin: '0 auto 0.875rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Need Quick Help?</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.25rem' }}>Chat with our AI assistant for instant answers</p>
              <button onClick={() => setChatOpen(true)} style={{ padding: '0.75rem 2rem', borderRadius: 12, background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>Start Chat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
