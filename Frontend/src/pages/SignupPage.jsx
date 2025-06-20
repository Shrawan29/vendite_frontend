import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    store: {
      name: "",
      address: "",
      gstin: ""
    }
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested store fields
    if (name.startsWith("store.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        store: {
          ...prev.store,
          [key]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { fullName, email, username, password, phone, store } = formData;

    if (!fullName || !email || !username || !password || !phone || !store.name || !store.address || !store.gstin) {
      setError("Please fill in all fields including store details.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/register`,
        formData,
        { withCredentials: true }
      );

      const user = res.data?.data;
      login(user);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Fields */}
          {["fullName", "email", "username", "password", "phone"].map((field) => (
            <div key={field}>
              <label className="block mb-1 font-medium capitalize">
                {field === "fullName" ? "Full Name" : field}
              </label>
              <input
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                name={field}
                className="w-full p-2 border rounded-md"
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          {/* Store Fields */}
          <hr className="my-2" />
          <h3 className="text-lg font-semibold">Store Details</h3>
          {["name", "address", "gstin"].map((field) => (
            <div key={field}>
              <label className="block mb-1 font-medium capitalize">
                Store {field}
              </label>
              <input
                type="text"
                name={`store.${field}`}
                className="w-full p-2 border rounded-md"
                value={formData.store[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
