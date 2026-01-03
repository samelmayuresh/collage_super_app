import { Loader } from '../../components/ui/Loader';

export default function DashboardLoading() {
    return (
        <div className="flex-1 flex items-center justify-center bg-[#FDFBF6]">
            <Loader />
        </div>
    );
}
