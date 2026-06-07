import React, { useContext } from 'react';
import Sidebar from './sidebar';
import { Navbar } from './navbar';
import { Outlet } from 'react-router-dom';
import { sideBarContext } from '../../context/sidebarContext';

 
const AdminLayout: React.FC = () => {
    const context = useContext(sideBarContext);
    if (!context) {
        throw new Error('sideBarContext must be used within a Provider');
    }
    const { isExpand, toggleExpand, setIsExpand } = context;

    return (
        <div className="flex flex-col w-full h-screen">  
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isExpand={isExpand} toggleExpand={toggleExpand} setIsExpand={setIsExpand}/>    
                <main className='flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800'><Outlet/></main>
            </div>
        </div>
    )
}

export default AdminLayout
