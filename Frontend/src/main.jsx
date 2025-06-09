import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage1.jsx";
import BillGenerator from "./pages/Bill.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import ProductDashboard from "./pages/Product.jsx";
import SalesSummaryDashboard from "./pages/salesSummary.jsx";

import RegisterPage from "./pages/SignupPage.jsx";
import LoginWrapper from "./components/loginWrapper.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      }
    ]
  },
  {
    path: "/billing",
    element: <BillGenerator />
  },
  {
    path: "/products",
    element: <ProductDashboard />
  },
  {
    path: "/sales-summary",
    element: <SalesSummaryDashboard />
  },
  {
    path: "/login",
    element: <LoginWrapper/>
  },
  {
    path: "/signup",
    element: <RegisterPage />
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
