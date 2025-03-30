import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AvailabilityScheduler from '../../components/tutor/AvailabilityScheduler';

const TutorAvailability = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">Availability Management</h1>
                <p className="text-gray-600">Set your weekly teaching schedule and manage when you're available for sessions</p>
            </header>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <AvailabilityScheduler />
            </div>
        </div>
    );
};

export default TutorAvailability;
