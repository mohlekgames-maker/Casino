import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <main className="lg:mr-72 flex-1 flex flex-col">
        <div className="p-6 lg:p-8 flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
