import { getSession } from '../../actions/auth';
import { redirect } from 'next/navigation';
import { StudentSidebar } from '../../components/dashboard/StudentSidebar';
import { TeachingSidebar } from '../../components/dashboard/TeachingSidebar';
import { StaffSidebar } from '../../components/dashboard/StaffSidebar';
import { AdminSidebar } from '../../components/dashboard/AdminSidebar';
import { OfficeSidebar } from '../../components/dashboard/OfficeSidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/signin');
    }

    // Determine background color based on role
    const getBgClass = () => {
        switch (session.role) {
            case 'TEACHING': return 'bg-[#F5F7FA]';
            case 'STAFF': return 'bg-[#F0FDF4]';
            case 'ADMIN': return 'bg-[#F8FAFC]';
            case 'OFFICE_STAFF': return 'bg-[#FFFBF0]';
            default: return 'bg-[#F4F7FE] lg:bg-white';
        }
    };

    return (
        <div className="flex min-h-screen bg-[#Fdfbf6] text-slate-800 font-sans">
            {/* Conditional Sidebar based on role */}
            {session.role === 'STUDENT' && <StudentSidebar />}
            {session.role === 'TEACHING' && <TeachingSidebar />}
            {session.role === 'STAFF' && <StaffSidebar />}
            {session.role === 'ADMIN' && <AdminSidebar />}
            {session.role === 'OFFICE_STAFF' && <OfficeSidebar />}

            {/* Applicants don't get a sidebar, just a simple header inside their page or maybe a minimal sidebar if needed. 
                For now, we let them proceed without a sidebar or default to none. 
            */}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
                <div className={`flex-1 flex overflow-auto ${getBgClass()}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
