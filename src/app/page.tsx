'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '../components/shared/SplashScreen';

export default function BootRoute() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('habit-tracker-session');
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };

    const timer = setTimeout(() => {
      checkSession();
      // Even if pushed, we can hide splash after the delay
      setShowSplash(false);
    }, 1500); // Between 800ms and 2000ms

    return () => clearTimeout(timer);
  }, [router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return null;
}
