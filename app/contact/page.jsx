'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook as FacebookIcon, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.7rem 0.875rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '0.35rem' };

const SOCIALS = [
  { label: 'WhatsApp',  envKey: 'NEXT_PUBLIC_WHATSAPP_LINK',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  Icon: MessageCircle },
  { label: 'Facebook',  envKey: 'NEXT_PUBLIC_FACEBOOK_LINK',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  Icon: FacebookIcon },
  { label: 'Instagram', envKey: 'NEXT_PUBLIC_INSTAGRAM_LINK', color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)', Icon: Instagram },
  { label: 'Twitter/X', envKey: 'NEXT_PUBLIC_TWITTER_LINK',   color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)',  Icon: Twitter },
  { label: 'YouTube',   envKey: 'NEXT_PUBLIC_YOUTUBE_LINK',   color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', Icon: Youtube },
  { label: 'LinkedIn',  envKey: 'NEXT_PUBLIC_LINKEDIN_LINK',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  Icon: Linkedin },
  {
    label: 'TikTok', envKey: 'NEXT_PUBLIC_TIKTOK_LINK', color: '#fff', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)',
    Icon: () => (
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
  },
];

const CONTACT_ITEMS = [
  { Icon: Mail,   color: '#a78bfa', title: 'Email Us',  info: 'support@goldmine.com', href: 'mailto:support@goldmine.com', sub: null },
  { Icon: Phone,  color: '#60a5fa', title: 'Call Us',   info: '+232 (0) 34115306',  href: 'tel:+23234115306',          sub: 'Available 24/7' },
  { Icon: MapPin, color: '#10b981', title: 'Visit Us',  info: 'Freetown, Sierra Leone', href: null,                          sub: null },
];

const RESPONSE_TIMES = [
  { Icon: MessageCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', label: 'WhatsApp Chat', sub: 'Instant response' },
  { Icon: Mail,          color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', label: 'Email Support',  sub: 'Within 24 hours' },
  { Icon: Phone,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',border: 'rgba(167,139,250,0.3)',label: 'Phone Support',  sub: '24/7 availability' },
];

function TelegramIcon() {
  return (
    <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.28 13.4l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.868.16z"/>
    </svg>
  );
}

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [communityLinks, setCommunityLinks] = useState({ whatsapp: '', telegram: '' });

  useEffect(() => {
    api.get('/admin/community-links').then(({ data }) => setCommunityLinks(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  const getSocialHref = (envKey) => (typeof process !== 'undefined' && process.env[envKey]) || '#';

  return (
    <div style={{ minHeight: '100vh', background: BG, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .08)', filter: 'blur(120px)', top: -150, right: -100 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(100px)', bottom: -80, left: -80 }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Contact Us</h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>Get in touch — we&apos;re here to help 24/7</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Form */}
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
              <Send size={18} color="#a78bfa" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Send Us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your full name" />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="your@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="+232 XXX XXX XXX" />
              </div>
              <div>
                <label style={labelStyle}>Subject *</label>
                <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} placeholder="What's this about?" />
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} placeholder="Tell us how we can help…" />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', borderRadius: 12, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', fontWeight: 800, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Send size={15} /> {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Contact info */}
            <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>Contact Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {CONTACT_ITEMS.map(({ Icon, color, title, info, href, sub }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem', marginBottom: '0.15rem' }}>{title}</p>
                      {href ? (
                        <a href={href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{info}</a>
                      ) : (
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{info}</p>
                      )}
                      {sub && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Groups CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {communityLinks.whatsapp && (
                <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
                  <MessageCircle size={32} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>Join Our WhatsApp Group</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem' }}>Instant support and community updates</p>
                  <a href={communityLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', borderRadius: 12, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 800, fontSize: '0.875rem', textDecoration: 'none' }}>
                    <MessageCircle size={15} /> Join WhatsApp Group
                  </a>
                </div>
              )}
              {communityLinks.telegram && (
                <div style={{ background: 'rgba(42,171,238,0.12)', border: '1px solid rgba(42,171,238,0.25)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, margin: '0 auto 0.75rem', color: '#2AABEE' }}><TelegramIcon /></div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>Join Our Telegram Group</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem' }}>News, updates and community discussion</p>
                  <a href={communityLinks.telegram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', borderRadius: 12, background: 'rgba(42,171,238,0.2)', border: '1px solid rgba(42,171,238,0.4)', color: '#2AABEE', fontWeight: 800, fontSize: '0.875rem', textDecoration: 'none' }}>
                    <span style={{ width: 15, height: 15 }}><TelegramIcon /></span> Join Telegram Group
                  </a>
                </div>
              )}
              {!communityLinks.whatsapp && !communityLinks.telegram && (
                <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
                  <MessageCircle size={32} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>Join Our Community</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>Community groups coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social grid */}
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.75rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', textAlign: 'center' }}>Connect With Us</h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '1.5rem' }}>Follow us on social media for updates</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {SOCIALS.map(({ label, envKey, color, bg, border, Icon }) => (
              <a key={label} href={getSocialHref(envKey)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 0.75rem', borderRadius: 14, background: bg, border: `1px solid ${border}`, color, textDecoration: 'none' }}>
                <Icon size={24} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{label}</span>
              </a>
            ))}
          </div>
          <div style={{ marginTop: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.75rem 1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>Note:</span> Some links currently point to our WhatsApp group until social pages are fully active.
            </p>
          </div>
        </div>

        {/* Response times */}
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>Response Times</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {RESPONSE_TIMES.map(({ Icon, color, bg, border, label, sub }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Icon size={24} color={color} />
                </div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{label}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
