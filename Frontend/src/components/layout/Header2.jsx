import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext.jsx";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrollPosition(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileOpen && !event.target.closest(".profile-menu")) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileOpen]);

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/Billing", label: "Billing" },
        { path: "/Products", label: "Products" },
        { path: "/Sales-summary", label: "Product Analytics" }
    ];

    return (
        <header className={`fixed w-full py-2 top-0 z-50 transition-all duration-300 ease-in-out ${
            scrollPosition > 50 ? "bg-white shadow-md border-b border-black" : "bg-white"
        }`}>
            <nav className="relative mx-auto max-w-7xl px-8 py-1 flex items-center justify-between text-black">
                <a href="/" className="text-xl font-medium tracking-wide">VENDITE</a>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center space-x-6">
                    {navLinks.map((link) => (
                        <a key={link.path} href={link.path} className="px-4 py-2 hover:bg-gray-100 rounded-lg">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden lg:flex items-center space-x-4">
                    {user ? (
                        <div className="relative profile-menu">
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center">
                                    {user.initials}
                                </div>
                                <span>{user.name}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className={`absolute right-0 top-full mt-2 w-56 transition-all ${
                                profileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                            }`}>
                                <div className="bg-white border border-black rounded-lg shadow-xl p-4 space-y-2 text-sm">
                                    <div>
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-gray-500">{user.email}</div>
                                    </div>
                                    <a href="/Profile" className="block px-3 py-2 hover:bg-gray-100 rounded">View Profile</a>
                                    <a href="/settings" className="block px-3 py-2 hover:bg-gray-100 rounded">Settings</a>
                                    <button onClick={logout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded">Sign Out</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className="px-3 py-1.5 text-base font-medium hover:text-gray-600 hover:bg-gray-100 rounded-lg">Login</a>
                            <a href="/signup" className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800">Sign Up</a>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
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
                    {user ? (
                        <>
                            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-semibold">
                                    {user.initials}
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {navLinks.map(link => (
                                    <a key={link.path} href={link.path} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100">
                                        {link.label}
                                    </a>
                                ))}
                                <a href="/Profile" className="block px-4 py-3 rounded-lg hover:bg-gray-100">View Profile</a>
                                <a href="/settings" className="block px-4 py-3 rounded-lg hover:bg-gray-100">Settings</a>
                                <button onClick={logout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <a href="/login" className="block w-full text-center bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800">Login</a>
                            <a href="/signup" className="block w-full text-center border border-black px-4 py-3 rounded-lg hover:bg-gray-100">Sign Up</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
