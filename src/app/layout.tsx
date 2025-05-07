import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className='flex flex-col h-full '>
            <Header />
            <div className=' h-[calc(100vh-57px)] p-5 rounded-lg bg-muted/50 '>
              {children}
            </div>
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}
