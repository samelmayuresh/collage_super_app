import { redirect } from 'next/navigation';

// Location page redirects to floors page where location is actually set
export default function LocationPage() {
    redirect('/dashboard/staff/floors');
}
