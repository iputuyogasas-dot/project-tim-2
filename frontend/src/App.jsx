import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Customer pages
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import UploadPaymentPage from './pages/customer/UploadPaymentPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import MenuManagePage from './pages/admin/MenuManagePage';
import CategoryManagePage from './pages/admin/CategoryManagePage';
import TableManagePage from './pages/admin/TableManagePage';
import BankAccountPage from './pages/admin/BankAccountPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Customer routes */}
                    <Route path="/order" element={<MenuPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/:orderId" element={<UploadPaymentPage />} />
                    <Route path="/status/:orderId" element={<OrderStatusPage />} />

                    {/* Admin routes */}
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<DashboardPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="orders/:id" element={<OrderDetailPage />} />
                        <Route path="menus" element={<MenuManagePage />} />
                        <Route path="categories" element={<CategoryManagePage />} />
                        <Route path="tables" element={<TableManagePage />} />
                        <Route path="bank-accounts" element={<BankAccountPage />} />
                    </Route>

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
