import React, { useState, useEffect } from "react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileOpen && !event.target.closest('.profile-menu')) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/SalesTrends", label: "Sales Trends" },
        { path: "/InventoryForecast", label: "Inventory Forecast" },
        { path: "/MarketInsights", label: "Market Insights" }
    ];

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out ${
            scrollPosition > 50 ? "bg-white shadow-md border-b border-black" : "bg-white"
        }`}>
            <nav className="relative mx-auto max-w-7xl px-8 py-1 flex items-center justify-between text-black">
                {/* Logo */}
                <a href="/" className="relative group flex items-center">
                    <span className="text-xl font-medium text-black tracking-wide">VENDITE</span>
                </a>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.path}
                            href={link.path}
                            className="px-4 py-2 text-base font-medium hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* User Profile - Desktop */}
                <div className="hidden lg:block profile-menu relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-base font-medium">
                            JD
                        </div>
                        <span className="text-base font-medium">John Doe</span>
                        <svg className="w-5 h-5 text-black transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Profile Dropdown */}
                    <div className={`absolute right-0 top-full mt-2 w-56 transform transition-all duration-200 ${
                        profileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                        <div className="bg-white border border-black rounded-lg shadow-xl overflow-hidden">
                            <div className="p-4 space-y-2 text-black text-sm">
                                <div className="pb-2 border-b border-gray-200">
                                    <div className="font-semibold">John Doe</div>
                                    <div className="text-gray-500 text-sm">john@example.com</div>
                                </div>
                                <a href="/Profile" className="block px-3 py-2 hover:bg-gray-100 rounded">
                                    View Profile
                                </a>
                                <a href="/settings" className="block px-3 py-2 hover:bg-gray-100 rounded">
                                    Settings
                                </a>
                                <div className="h-px bg-gray-200 my-2" />
                                <a href="/logout">
                                    <button className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded">
                                        Sign Out
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-black">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute left-4 right-4 top-full mt-3 transition-all duration-300 ${
                isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
            }`}>
                <div className="bg-white border border-black rounded-2xl shadow-xl p-5 text-black">
                    <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-semibold">JD</div>
                        <div>
                            <div className="font-semibold text-lg">John Doe</div>
                            <div className="text-sm text-gray-500">john@example.com</div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {navLinks.map(link => (
                            <a 
                                key={link.path} 
                                href={link.path} 
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-lg"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a href="/profile" className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-lg">
                            View Profile
                        </a>
                        <a href="/settings" className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-lg">
                            Settings
                        </a>
                        <button className="w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-lg">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
