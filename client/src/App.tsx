import { lazy, Suspense } from 'react';
import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom";
// import { ThemeProvider } from '@mui/material';
// import { theme } from './themes/theme';
// import DrawCircle from './components/drawCircle';
// import FaqComp from './components/FaqComp';
// import FormikComponent from './move/formik';
// import RegisterForm from './components/registrationForm';
// import StarRating from './components/starRating';
// import Sticky from './components/sticky/sticky';
// import FormikFieldArray from './components/formArray';

import { ThemeProvider } from './context/themeContext';
import ProductDetails from "./components/productDetails";
//import NotFound from "./pages/NotFound";
import Productcategory from "./components/productcategory";
import BlogDetail from "./components/blogs/BlogDetails.tsx";
import BlogSection from "./components/blogs/BlogSection.tsx";
//import { Dashboard } from "./components/admin/DashBoard/dashboard.tsx";
import { AuthProvider } from "./context/authContext";
import AddressForm from "./components/addressForm";
import OtpVerify from "./components/auth/otpVerify.tsx";
import AddressPage from "./components/addAddress";
import ResetPassword from "./components/auth/resetPassword";
import ForgotPassword from "./components/auth/forgotPassword";
import Toaster from "./ui/Toaster";
import CreateProduct from "./components/admin/products/CreateProduct/createProduct";
import AdminLayout from "./components/admin/layout";
import CustomersTable from "./components/admin/customers/index.tsx";
import GuestRoute from "./routes/GuestRoute";
//import ProtectedRoute from "./routes/ProtectedRoute";
import Chat from "./components/admin/chat/chat";
import Calendar2 from "./components/admin/calendar2/calendar2";
//import Cp from "./components/admin/cp";
import CreateProduct3 from "./components/admin/products/CreateProduct/CreateProduct3";
//import { CreateProduct2 } from "./components/admin/products/CreateProduct";
import AdminAgentLayout2 from "./components/admin/Agents/chatBot";
import { CategoryProvider } from './components/admin/context/categoryContext.tsx'
import SubCategory from "./components/admin/categories/subCategory";
import CustomerSupport from "./pages/CustomerSupport";
import SignUpPage from "./pages/SignUpPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import AdminProfile from "./components/admin/pages/ADProfile";
import AdminSettings from "./components/admin/pages/ADSettings";
import AdminChangePassword from "./components/admin/pages/ADchangePW";
import CategoryManager from "./components/admin/categories/Categories.tsx";
const Home = lazy(() => import("./pages/home"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage.tsx"));
import UnderConstruction from "./components/admin/components/underConstruction.tsx";
import ProductCategories from "./pages/ProductCategories.tsx";
import AdminReviewPage from "./components/admin/reviews/ReviewPage.tsx";
import { CartProvider } from "./context/cartContext.tsx";
import MyProfile from "./components/myAccount/myProfile.tsx";
import MyAddress from "./components/myAccount/myAddress.tsx";
import MyAccount from "./pages/MyAccount.tsx";
import MyWishList from './components/myAccount/myWishList.tsx';
import MyOrders from "./components/myAccount/myOrders.tsx";
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import { AdminAgentLayout } from "./components/admin/AI/AdminAgentLayout.tsx";
import Orders from "./components/admin/orders/Orders.tsx";
//import { ProductProvider } from "./components/admin/context/productsContext.tsx";
//import Counter from "./move/counter.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminRoute from "./routes/AdminRoute.tsx";
import CartPage from "./pages/cartPage.tsx";
import { Calendar } from "./components/admin/calendar/Calendar.tsx";
import PhonePeClone from "./components/fakePhonepe.tsx";
import Payment from "./components/payment/payment.tsx";
import StarRating from "./components/starRating.tsx";
import { WishlistProvider } from "./context/wishlistContext.tsx";
import { Dashboard } from "./components/admin/DashBoard/dashboard.tsx";
import { CustomerProvider } from "./components/admin/context/customerContext.tsx";
import AdminBlogs from "./components/admin/Blogs/BlogsManage.tsx";
import Loader from './ui/Loader.tsx';
import Products from './components/admin/products/AllProducts/Products.tsx';



const App = () => {
  const queryClient = new QueryClient();

  return (
    <>
      {/* <FormikComponent/> */}
      {/* <ThemeProvider theme={theme}> */}
      <ThemeProvider defaultTheme="system" storageKey="marketpulse-ui-theme">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CategoryProvider>
                <CustomerProvider>
                  <QueryClientProvider client={queryClient}>

                    {/* ✅ Suspense wrapper */}
                    <Suspense fallback={<Loader/>}>

                    {/* <RegisterForm/> */}
                    {/* <Counter/> */}

                    <Routes>
                      {/* <Route path='/' element={<Layout/>}>
        <Route index element={<Hero/>} />
      </Route>
      <Route path='formikfieldarray' element={<FormikFieldArray/>}></Route>
      <Route path='sticky' element={<Sticky/>}></Route>
      <Route path='calendar2' element={<Calendar2/>}></Route>
      <Route path='calendar3' element={<Calendar3/>}></Route>
      <Route path='drawCircle' element={<DrawCircle/>}></Route>

              {/* <Route element={<ProtectedRoute />}> */}
                      {/* <Route path='/' element={<Header />}></Route> */}
                      <Route path='/' element={<Home />}></Route>
                      <Route path="/address" element={<AddressForm />}></Route>
                      <Route path='productdetails/:id' element={<ProductDetailsPage />}></Route>
                      <Route path='search' element={<ProductDetailsPage />}></Route>
                      <Route path="products" element={<ProductCategories />}></Route>
                      <Route path="/blogsection" element={<BlogSection />}></Route>
                      <Route path="/blog/:id" element={<BlogDetail />} />
                      <Route path="cartPage" element={<CartPage />}></Route>
                      <Route path="/myaccount" element={<MyAccount />}>
                        <Route index element={<MyProfile />} />
                        <Route path="profile" element={<MyProfile />} />
                        <Route path="wishlist" element={<MyWishList />} />
                        <Route path="orders" element={<MyOrders />} />
                        <Route path="address" element={<MyAddress />} />
                      </Route>
                      <Route path="addaddress" element={<AddressPage />}></Route>
                      <Route path="checkout" element={<Checkout />}></Route>
                      <Route path="payment" element={<Payment />}></Route>
                      <Route path="phonepe/:id" element={<PhonePeClone />}></Route>
                      <Route path="order-confirmation" element={<OrderConfirmation />}></Route>
                      <Route path="customersupport" element={<CustomerSupport />}></Route>
                      <Route path="rating"></Route>
                      <Route path="starrating" element={<StarRating />}></Route>
                      {/* </Route> */}

                      {/* <Route element={<AdminRoute />}> */}
                      <Route path="/" element={<AdminLayout />}>
                        <Route path="dashboard" element={<Dashboard />}></Route>
                        <Route path="adminprofile" element={<AdminProfile />} />
                        <Route path="adminsettings" element={<AdminSettings />} />
                        <Route path="adminchangepassword" element={<AdminChangePassword />} />
                        <Route path="categories/manage" element={<CategoryManager />} />
                        <Route path="categories/create-subcategory" element={<SubCategory />} />
                        <Route path="orders" element={<Orders />}></Route>
                        <Route path="customers" element={<CustomersTable />} />
                        <Route path="agents" element={<AdminAgentLayout />} />
                        <Route path="admin-profile" element={<AdminProfile />} />
                        <Route path="blogs" element={<AdminBlogs />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="calendar2" element={<Calendar2 />} />
                        <Route path="calendar" element={<Calendar />} />
                        <Route path="products/all" element={<Products />} />
                        <Route path="products/create" element={<CreateProduct3 />} />
                        <Route path="products/edit/:id" element={<CreateProduct3 />} />
                        <Route path="createproduct3" element={<CreateProduct />} />
                        <Route path="adminagents" element={<AdminAgentLayout2 />} />
                        <Route path="reviews" element={<AdminReviewPage />} />
                        <Route path="underconstruction" element={<UnderConstruction />} />
                        {/* <Route path="createproduct" element={<CreateProduct2/>} /> */}

                      </Route>
                      {/* </Route> */}

                      <Route element={<GuestRoute />}>
                        <Route path="signup" element={<SignUpPage />}></Route>
                        <Route path="login" element={<LoginPage />}></Route>
                        <Route path="otpverify" element={<OtpVerify />}></Route>
                        <Route path="forgot-password/:email" element={<ForgotPassword />}></Route>
                        <Route path="reset-password" element={<ResetPassword />}></Route>
                      </Route>

                      {/* <Route path='*' element={<NotFound />}></Route>  */}
                      {/* or */}
                      <Route path="*" element={<Navigate to="/" replace />} />

                    </Routes>
                    </Suspense>

                    {/*</ThemeProvider> */}
                    <Toaster />
                  </QueryClientProvider>
                </CustomerProvider>
              </CategoryProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider >

    </>
  )
};

export default App;
