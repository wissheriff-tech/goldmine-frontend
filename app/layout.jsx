import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'SalonMoney - Secure Salon Financial Platform',
  description: 'Invest in salon services, earn daily income, and grow your wealth',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
