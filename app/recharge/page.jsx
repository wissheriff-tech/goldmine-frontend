'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Recharge() {
  const router = useRouter();
  useEffect(() => { router.replace('/deposit'); }, [router]);
  return null;
}
