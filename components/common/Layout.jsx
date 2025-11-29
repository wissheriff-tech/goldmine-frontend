'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ProfileSidebar from '../profile/ProfileSidebar';

export default function Layout({ children }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar onProfileClick={toggleProfile} isProfileOpen={isProfileOpen} />

      {/* Profile Sidebar */}
      <ProfileSidebar isOpen={isProfileOpen} onClose={closeProfile} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
