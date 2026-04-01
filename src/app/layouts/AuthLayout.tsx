import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f6f4f0]">
      <Outlet />
    </div>
  );
}
