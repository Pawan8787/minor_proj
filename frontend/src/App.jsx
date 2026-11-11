import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './Components/Navbar/navbar';
import Dashboard from './page/Dashboard/Dashboard';
import RoadRegister from './page/RoadRegister/RoadRegister';
import MapContainer from './page/mainMap/Map';
import RulesEngine from './page/RulesEngine/RulesEngine';
import Reports from './page/Reports/Reports';
import Uploadvideo from './Components/Uploadvideo/Uploadvideo';
import ImageUploadForm from './Components/ComplaintForm/form';
import Pothole from './Components/pothole/pothole';
import TabularData from './Components/ComplaintData/dataTable';
import ComplaintProgress from './Components/ComplaintProgress/complaintProgress';
import NotFoundPage from './Components/notFound';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<RoadRegister />} />
          <Route path="/map" element={<MapContainer />} />
          <Route path="/uploadvideo" element={<Uploadvideo />} />
          <Route path="/rules-engine" element={<RulesEngine />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/form" element={<ImageUploadForm />} />
          <Route path="/complaintprogress" element={<ComplaintProgress />} />
          <Route path="/formdisplay" element={<TabularData />} />
          <Route path="/pothole/:holeID" element={<Pothole />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
