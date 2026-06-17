import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/common/AuthProvider';

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('salonmoney-theme');
    var legacy = localStorage.getItem('darkMode');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : legacy === 'true' ? 'dark' : 'light';
    var root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {}
})();
`;

export const metadata = {
  title: 'SalonMoney - Secure Salon Financial Platform',
  description: 'Invest in salon services, earn daily income, and grow your wealth',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
