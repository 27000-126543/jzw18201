import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminHome from '@/pages/admin/AdminHome'
import DepartmentView from '@/pages/admin/DepartmentView'
import OrderDetail from '@/pages/admin/OrderDetail'
import GuestProfile from '@/pages/admin/GuestProfile'
import Dashboard from '@/pages/dashboard/Dashboard'
import GuestLayout from '@/components/GuestLayout'
import GuestHome from '@/pages/guest/GuestHome'
import DiningOrder from '@/pages/guest/DiningOrder'
import AmenitiesRequest from '@/pages/guest/AmenitiesRequest'
import RepairRequest from '@/pages/guest/RepairRequest'
import WakeUpService from '@/pages/guest/WakeUpService'
import DNDSetting from '@/pages/guest/DNDSetting'
import MyRequests from '@/pages/guest/MyRequests'
import ReviewPage from '@/pages/guest/ReviewPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guest/:roomId" element={<GuestLayout />}>
          <Route index element={<GuestHome />} />
          <Route path="dining" element={<DiningOrder />} />
          <Route path="amenities" element={<AmenitiesRequest />} />
          <Route path="repair" element={<RepairRequest />} />
          <Route path="wakeup" element={<WakeUpService />} />
          <Route path="dnd" element={<DNDSetting />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="review" element={<ReviewPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="dept/:dept" element={<DepartmentView />} />
          <Route path="order/:orderId" element={<OrderDetail />} />
          <Route path="guest/:guestId" element={<GuestProfile />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}
