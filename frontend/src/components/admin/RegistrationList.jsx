import React, { useState } from 'react';
import { adminService } from '../../services/adminService';

const RegistrationList = ({ eventId, registrations = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(registrations);
  
  // Mock data for UI testing if no data provided
  const mockData = [
    { 
      id: 1, 
      name: "Rahul Sharma", 
      email: "rahul.sharma@college.edu", 
      collegeId: "2023CS101", 
      registeredAt: "2024-01-15T10:30:00Z",
      department: "Computer Science",
      status: "confirmed"
    },
    { 
      id: 2, 
      name: "Priya Patel", 
      email: "priya.patel@college.edu", 
      collegeId: "2023EC105", 
      registeredAt: "2024-01-14T14:20:00Z",
      department: "Electronics",
      status: "pending"
    },
    { 
      id: 3, 
      name: "Amit Kumar", 
      email: "amit.kumar@college.edu", 
      collegeId: "2023ME110", 
      registeredAt: "2024-01-13T09:15:00Z",
      department: "Mechanical",
      status: "confirmed"
    },
  ];
  
  // Use provided data or mock data
  const displayData = data.length > 0 ? data : mockData;
  
  const handleExport = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.exportRegistrationsCSV(eventId);
      
      // Create download link for CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('CSV exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusUpdate = async (registrationId, newStatus) => {
    try {
      await adminService.updateRegistrationStatus(eventId, registrationId, newStatus);
      // Update local state
      setData(prev => prev.map(item => 
        item.id === registrationId ? { ...item, status: newStatus } : item
      ));
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Event Registrations</h2>
          <p className="text-gray-600 mt-1">
            Event ID: <span className="font-semibold">{eventId}</span> | 
            Total: <span className="font-semibold">{displayData.length}</span> students registered
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Refresh registrations
              adminService.getEventRegistrations(eventId)
                .then(response => setData(response.data))
                .catch(error => console.error('Failed to fetch:', error));
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            disabled={isLoading || displayData.length === 0}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered On
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {student.collegeId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {student.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(student.registeredAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(student.id, 'confirmed')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(student.id, 'rejected')}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {displayData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-lg">No registrations yet</p>
            <p className="text-sm mt-1">Registrations will appear here once students register</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationList;