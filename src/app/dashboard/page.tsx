import { getSession } from '../../actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/signin');
    }

    if (session.role === 'ADMIN') {
        redirect('/dashboard/admin');
    } else if (session.role === 'STAFF') {
        redirect('/dashboard/staff');
    } else if (session.role === 'TEACHING') {
        redirect('/dashboard/teaching');
    } else if (session.role === 'STUDENT') {
        redirect('/dashboard/student');
    } else if (session.role === 'OFFICE_STAFF') {
        redirect('/dashboard/office');
    } else if (session.role === 'APPLICANT') {
        redirect('/dashboard/applicant');
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Welcome, {session.name}</h1>
            <p>Redirecting to your dashboard...</p>
        </div>
    )
}
