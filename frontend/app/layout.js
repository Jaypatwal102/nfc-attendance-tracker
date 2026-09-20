import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'NFC Attendance Tracker',
  description: 'NFC-based Academic Attendance Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-950 text-slate-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
