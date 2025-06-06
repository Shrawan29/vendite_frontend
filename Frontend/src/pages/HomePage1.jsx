import React from "react";

export default function Homepage() {
  return (
    <div className="bg-white text-black min-h-screen font-sans">
      {/* Hero Section */}
      <section
        className="h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 lg:px-0 max-w-[1400px] mx-auto"
      >
        <h1 className="text-[6vw] md:text-7xl font-extrabold mb-6 tracking-tight max-w-4xl leading-tight">
          Vendite
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mb-12 leading-relaxed font-light">
          Transform your sales process with intelligent management software built for clarity and results.
        </p>
        <div className="flex gap-8">
          <button className="bg-black text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-gray-800 transition-colors shadow-md">
            Get Started
          </button>
          <button className="bg-gray-100 text-gray-900 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm">
            Book a Demo
          </button>
        </div>
      </section>

      {/* Key Features */}
      <section
        className="h-screen flex flex-col justify-center max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-0"
      >
        <h2 className="text-4xl font-semibold text-center mb-16">Streamline your sales pipeline</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-black text-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="bg-white text-black p-3 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-2xl">📊</div>
            <h3 className="text-2xl font-semibold mb-3">Real-time Analytics</h3>
            <p className="text-gray-300 text-center">
              Make data-driven decisions with instant insights into performance, trends, and opportunities.
            </p>
          </div>

          <div className="bg-black text-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="bg-white text-black p-3 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-2xl">👥</div>
            <h3 className="text-2xl font-semibold mb-3">Customer Management</h3>
            <p className="text-gray-300 text-center">
              Build stronger relationships with a comprehensive view of customer interactions and preferences.
            </p>
          </div>

          <div className="bg-black text-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="bg-white text-black p-3 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-2xl">💼</div>
            <h3 className="text-2xl font-semibold mb-3">Deal Tracking</h3>
            <p className="text-gray-300 text-center">
              Never miss an opportunity with intuitive deal management and automated follow-ups.
            </p>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section
        className="h-screen flex flex-col justify-center max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-0"
      >
        <div className="bg-black text-white rounded-3xl p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center gap-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold mb-6">
              Beautiful simplicity meets powerful functionality
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Vendite combines an elegant, intuitive interface with enterprise-grade sales management capabilities to help you close deals faster.
            </p>
            <p className="mt-4 text-gray-400">
              Manage your pipeline, track customer interactions, and analyze trends—all from one place.
            </p>
          </div>
          <div className="flex-1 max-w-xl rounded-xl overflow-hidden shadow-2xl bg-gray-900">
            <img
              src="/api/placeholder/900/500"
              alt="Vendite Dashboard"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 lg:px-0 max-w-[1400px] mx-auto"
      >
        <h2 className="text-4xl font-semibold mb-6 max-w-3xl">
          Ready to transform your sales process?
        </h2>
        <p className="text-xl text-gray-700 mb-12 max-w-2xl leading-relaxed font-light">
          Join thousands of businesses using Vendite to increase revenue and simplify sales management.
        </p>
        <div className="flex gap-8">
          <button className="bg-black text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-gray-800 transition-colors shadow-md">
            Start Free Trial
          </button>
          <button className="bg-gray-100 text-gray-900 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm">
            Book a Demo
          </button>
        </div>
      </section>
    </div>
  );
}


