import { Outlet } from 'react-router-dom';
import TutorSidebar from '../../components/common/TutorSidebar';

const TutorLayout = () => {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
                <TutorSidebar />
            </div>
            <div className="flex-grow">
                <Outlet />
            </div>
        </div>
    );
};

export default TutorLayout;
