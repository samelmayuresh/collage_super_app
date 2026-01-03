import { Loader } from '../components/ui/Loader';

export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F3F3F3]">
            <Loader />
        </div>
    );
}
