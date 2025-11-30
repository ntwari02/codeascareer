import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Deals } from './pages/Deals';
import { NewArrivals } from './pages/NewArrivals';
import { Trending } from './pages/Trending';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyOTP } from './pages/VerifyOTP';
import { ResetPassword } from './pages/ResetPassword';
import { useAuthStore } from './stores/authStore';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collection/:sellerId/:slug" element={<CollectionDetail />} />
            <Route path="deals" element={<Deals />} />
            <Route path="new-arrivals" element={<NewArrivals />} />
            <Route path="trending" element={<Trending />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-otp" element={<VerifyOTP />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="seller/*" element={<SellerDashboard />} />
          <Route path="admin/*" element={<AdminDashboard />} />
        </Routes>
        <ChatbotWidget />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
