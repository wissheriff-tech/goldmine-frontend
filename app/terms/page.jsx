'use client';

import { Shield, AlertCircle, CheckCircle, TrendingUp, Users, Lock } from 'lucide-react';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

function Section({ icon, title, children }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
          {icon}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{title}</h2>
        </div>
      )}
      {children}
    </section>
  );
}

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: BG, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .08)', filter: 'blur(120px)', top: -150, right: -100 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(100px)', bottom: -80, left: -80 }} />
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Shield size={32} color="#a78bfa" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Terms of Service</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>Last Updated: November 2025</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '2rem' }}>
          {/* Welcome */}
          <div style={{ borderLeft: '3px solid #a78bfa', paddingLeft: '1.25rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Welcome to Gold Mine</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
              Thank you for choosing Gold Mine as your trusted investment platform. By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully to understand your rights and obligations.
            </p>
          </div>

          <Section icon={<TrendingUp size={20} color="#a78bfa" />} title="About Our Platform">
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Gold Mine is a VIP investment platform designed to help users grow their wealth through structured investment packages.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={16} color="#10b981" />
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>How Our Platform Works</p>
              </div>
              {['Register and verify your account', 'Recharge your balance through secure payment methods', 'Choose from VIP0–VIP8 investment packages', 'Earn daily returns based on your selected package', 'Withdraw your earnings at any time', 'Earn referral commissions by inviting friends'].map(item => (
                <p key={item} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', paddingLeft: '1.25rem', marginBottom: '0.3rem', lineHeight: 1.5 }}>• {item}</p>
              ))}
            </div>
          </Section>

          <Section icon={<TrendingUp size={20} color="#10b981" />} title="Investment Packages">
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '0.875rem' }}>
              We offer multiple VIP levels, each catering to different investment capacities and goals.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[['VIP0 – VIP4', 'Entry-level packages for beginners with lower capital requirements.'], ['VIP5 – VIP8', 'Premium packages with higher returns for experienced investors.']].map(([title, desc]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#fff', marginBottom: '0.35rem', fontSize: '0.875rem' }}>{title}</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Users size={20} color="#60a5fa" />} title="Your Responsibilities">
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.125rem' }}>
              {['Provide accurate and truthful information during registration', 'Maintain the security and confidentiality of your account credentials', 'Enable Two-Factor Authentication (2FA) for enhanced security', 'Comply with all applicable laws and regulations in your jurisdiction', 'Not engage in fraudulent activities or attempt to manipulate the system', 'Report any suspicious activities or security breaches immediately'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<AlertCircle size={20} color="#f59e0b" />} title="Risk Disclosure">
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderLeft: '3px solid #f59e0b', borderRadius: 12, padding: '1.125rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '0.875rem' }}>
                All investments carry inherent risks. Please consider the following:
              </p>
              {[['Market Volatility', 'Investment returns may fluctuate based on market conditions'], ['Capital Risk', 'Only invest what you can afford to lose'], ['No Guarantees', 'Past performance does not guarantee future results'], ['Withdrawal Processing', 'Withdrawals may take 24–48 hours to process']].map(([bold, text]) => (
                <div key={bold} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}><strong style={{ color: '#fff' }}>{bold}:</strong> {text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Lock size={20} color="#a78bfa" />} title="Security & Privacy">
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '0.875rem' }}>
              Your security is our top priority. We implement industry-leading measures to protect your account and funds.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[['Bank-Level Encryption', 'SSL/TLS protocols protect all data in transit.', '#60a5fa', Shield], ['Two-Factor Auth', 'Optional 2FA for enhanced account protection.', '#a78bfa', Lock], ['Secure Payments', 'PCI-compliant payment processing systems.', '#10b981', Shield], ['Regular Audits', 'Continuous security monitoring and updates.', '#f59e0b', Lock]].map(([title, desc, color, Icon]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <Icon size={14} color={color} />
                    <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>{title}</p>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Users size={20} color="#f472b6" />} title="Referral Program">
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '0.875rem' }}>
              Earn additional income by inviting friends and family to join Gold Mine:
            </p>
            {['Receive a unique referral code from your dashboard', 'Earn L1 3%, L2 2%, L3 1% commission on investments', 'Track referral earnings in real-time', 'Withdraw referral commissions alongside regular earnings'].map(item => (
              <p key={item} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', paddingLeft: '1rem', marginBottom: '0.3rem', lineHeight: 1.5 }}>• {item}</p>
            ))}
          </Section>

          {[['Account Termination', 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activities, or pose security risks. Users may also close their accounts voluntarily at any time.'], ['Modifications to Terms', 'Gold Mine reserves the right to update these Terms of Service at any time. Users will be notified of significant changes via email or platform notifications. Continued use constitutes acceptance of the updated terms.']].map(([title, text]) => (
            <Section key={title} title={title}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{text}</p>
            </Section>
          ))}

          {/* CTA banner */}
          <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <TrendingUp size={24} color="#a78bfa" />
            </div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>Start Your Investment Journey Today!</h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 540, margin: '0 auto 1.25rem' }}>
              Join thousands of satisfied investors who trust Gold Mine for their financial growth. Competitive returns, robust security, and exceptional support.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {[['24/7', 'Customer Support', '#60a5fa'], ['8', 'VIP Packages', '#a78bfa'], ['Secure', 'Transactions', '#10b981']].map(([value, label, color]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.875rem 1.25rem', textAlign: 'left' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Questions?</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              Visit our{' '}
              <a href="/help" style={{ color: '#a78bfa', textDecoration: 'none' }}>Help Center</a>
              {' '}or{' '}
              <a href="/contact" style={{ color: '#a78bfa', textDecoration: 'none' }}>Contact Us</a>
              . Our support team is available 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
