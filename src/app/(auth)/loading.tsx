import { Loader } from '../../components/ui/Loader';

export default function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF6]">
            <Loader />
        </div>
    );
}
