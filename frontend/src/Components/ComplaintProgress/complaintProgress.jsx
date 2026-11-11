import React, { useState } from 'react';
import './complaint.css';
import TabularData from './../ComplaintData/dataTable';
const ComplaintProgress = () => {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [progress, setProgress] = useState(0); // Initialize progress to 0 (complaint filed)

  const handleSearch = () => {
    // Simulate fetching progress data based on the complaint number
    // Replace this with an actual API call or database query
    // For demonstration purposes, I'm incrementing the progress by 1 on each search
    setProgress((prevProgress) => prevProgress + 1);
  };

  const progressLabels = [
    'Enter Complaint ID',
    'Complaint Filed',
    'Complaint Reviewing',
    'Complaint Registered',
    'Work in Progress',
    'Complaint Resolved',
  ];

  return (
    <div className='complaintContainer'>
      <label htmlFor="complaintNumber">Enter Complaint Number:</label>
      <input
        type="text"
        id="complaintNumber"
        value={complaintNumber}
        onChange={(e) => setComplaintNumber(e.target.value)}
      />
      <button className='inactive-button'>Search</button>

      <div style={{ marginTop: '20px' }}>
        <p>{progressLabels[progress]}</p>
        <div
          style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(progress / 4) * 100}%`,
              height: '100%',
              backgroundColor: '#007bff',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
      <TabularData/>
    </div>
  );
};

export default ComplaintProgress;
