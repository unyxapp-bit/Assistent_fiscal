import React, { useEffect, useState } from 'react';
import SplashScreen from '../features/splash/SplashScreen';

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  if (show) return <SplashScreen />;

  return <>{children}</>;
}
