import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage1.jsx";
import BillGenerator from "./pages/Bill.jsx";
import { AuthProvider } from "./context/authContext.jsx";

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
    path: "/Billing",
    element:<BillGenerator/>
  }
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);