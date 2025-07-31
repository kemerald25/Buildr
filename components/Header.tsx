import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import SignInWithBaseButton from "./SignInWithBaseButton";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon, MessageSquare, Plus } from 'lucide-react';

const Header: React.FC = () => {
  const { user, loading, signIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileBtnRef.current?.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Consistent NavLink style
  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-base font-medium transition-colors ${
      isActive ? 'text-base-blue' : 'text-slate-600 hover:text-base-blue'
    }`;
  
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/90 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-3 px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-base-blue"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            BUILDR
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/builders" className={navLinkStyle}>Builders</NavLink>
          <NavLink to="/ideas" className={navLinkStyle}>Ideas</NavLink>
          {user && <NavLink to="/chat" className={navLinkStyle}>Messages</NavLink>}
        </nav>

        {/* Right side Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/ideas/create"
                className="group inline-flex items-center justify-center bg-base-blue text-white font-bold py-2 px-4 rounded-full text-sm transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Plus size={16} className="mr-1.5" />
                Post Idea
              </Link>
              <div className="relative">
                <button
                  ref={profileBtnRef}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="block rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-base-blue focus:ring-offset-2"
                >
                  <img
                    className="h-9 w-9 rounded-full object-cover"
                    src={user.pfpUrl || '/default-avatar.png'}
                    alt={user.displayName || 'User profile'}
                  />
                </button>
                {profileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-slate-200/80 py-1"
                  >
                    <Link
                      to={`/profile/${user.uid}`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full"
                    >
                      <UserIcon size={16} />
                      My Profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <SignInWithBaseButton onClick={signIn} loading={loading} />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-800 p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-slate-200/80">
          <nav className="px-4 pt-4 pb-8 flex flex-col gap-2">
            <NavLink to="/builders" className={navLinkStyle} onClick={closeMobileMenu}>Builders</NavLink>
            <NavLink to="/ideas" className={navLinkStyle} onClick={closeMobileMenu}>Ideas</NavLink>
            {user ? (
              <>
                <NavLink to="/chat" className={navLinkStyle} onClick={closeMobileMenu}>Messages</NavLink>
                <hr className="my-3 border-slate-200/90" />
                <Link
                  to={`/profile/${user.uid}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 py-2 text-slate-600 font-medium"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.pfpUrl || '/default-avatar.png'}
                    alt="My Profile"
                  />
                  <span>{user.displayName}</span>
                </Link>
                 <Link
                    to="/ideas/create"
                    onClick={closeMobileMenu}
                    className="w-full mt-2 bg-base-blue text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Post an Idea
                  </Link>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center gap-3 mt-4 w-full py-2 text-red-600 font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mt-6">
                <SignInWithBaseButton onClick={signIn} loading={loading} />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;