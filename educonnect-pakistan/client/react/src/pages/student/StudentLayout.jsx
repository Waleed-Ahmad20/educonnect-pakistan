import { Outlet } from 'react-router-dom';
import StudentSidebar from '../../components/common/StudentSidebar';
import './StudentLayout.css';

const StudentLayout = () => {
  console.log('StudentLayout rendered');
  
  return (
    <div className="student-layout">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4 lg:w-1/5">
          <StudentSidebar />
        </div>
        <div className="md:w-3/4 lg:w-4/5 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout; 