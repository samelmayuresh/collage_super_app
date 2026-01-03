import { AdminSidebar } from '../../../components/dashboard/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <AdminSidebar />
            <main className="flex-1 overflow-auto pt-14 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
