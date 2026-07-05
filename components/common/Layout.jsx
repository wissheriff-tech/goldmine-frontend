'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ProfileSidebar from '../profile/ProfileSidebar';
import api from '@/utils/api';

export default function Layout({ children }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [whatsappSupport, setWhatsappSupport] = useState('');

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  useEffect(() => {
    api.get('/admin/community-links')
      .then(({ data }) => { if (data.whatsapp) setWhatsappSupport(data.whatsapp); })
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Navbar */}
      <Navbar onProfileClick={toggleProfile} isProfileOpen={isProfileOpen} />

      {/* Profile Sidebar */}
      <ProfileSidebar isOpen={isProfileOpen} onClose={closeProfile} />

      {/* Main Content — extra bottom padding on mobile for the fixed bottom nav */}
      <main className="app-main flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer — hidden on mobile (bottom nav serves that purpose) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Floating WhatsApp Support Button */}
      {whatsappSupport && (
        <a
          href={whatsappSupport}
          target="_blank"
          rel="noopener noreferrer"
          title="Join our WhatsApp group"
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.25rem',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#25d366',
            boxShadow: '0 4px 16px rgba(37,211,102,0.45)',
            textDecoration: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,211,102,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,211,102,0.45)'; }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.677 4.8 1.854 6.8L2 30l7.4-1.832A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 0 1-5.9-1.62l-.42-.252-4.396 1.088 1.12-4.284-.276-.44A11.562 11.562 0 0 1 4.4 16C4.4 9.592 9.592 4.4 16 4.4S27.6 9.592 27.6 16 22.408 27.6 16 27.6zm6.324-8.572c-.348-.174-2.056-1.012-2.376-1.128-.32-.116-.552-.174-.784.174-.232.348-.9 1.128-1.104 1.36-.204.232-.406.26-.754.086-.348-.174-1.47-.542-2.8-1.726-1.034-.92-1.732-2.056-1.936-2.404-.204-.348-.022-.536.152-.71.156-.154.348-.406.522-.608.174-.204.232-.348.348-.58.116-.232.058-.436-.028-.61-.088-.174-.784-1.888-1.074-2.586-.282-.68-.568-.588-.784-.598l-.666-.012c-.232 0-.61.086-.928.434-.32.348-1.218 1.19-1.218 2.9s1.246 3.364 1.42 3.596c.174.232 2.452 3.742 5.942 5.248.83.358 1.48.572 1.986.732.834.264 1.594.226 2.194.138.67-.1 2.056-.84 2.348-1.652.29-.812.29-1.508.204-1.652-.086-.144-.318-.232-.666-.406z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
