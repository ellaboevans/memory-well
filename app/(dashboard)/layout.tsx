import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Dashboard sidebar and header will be added here */}
      <div className="flex">
        {/* Sidebar placeholder */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-zinc-900 border-r border-zinc-800">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-white">Memory Well</span>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {/* Navigation items will be added here */}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-zinc-900 border-b border-zinc-800">
            {/* Top bar placeholder */}
          </div>
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
