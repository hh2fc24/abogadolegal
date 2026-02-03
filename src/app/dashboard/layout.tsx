import type { ReactNode } from 'react';
import Sidebar from '@/app/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 md:px-6">
        <aside className="hidden shrink-0 md:block md:w-[260px]">
          <Sidebar />
        </aside>
        <main className="flex-1 px-6 pb-12 pt-6">{children}</main>
      </div>
    </div>
  );
}