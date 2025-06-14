import "styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '../context/ToastContext';

export default function App({ Component, pageProps }) {
  const { session, ...restPageProps } = pageProps;
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <link rel="icon" href="/logo.jpg" />
        <Component {...restPageProps} />
      </ToastProvider>
    </SessionProvider>
  );
}