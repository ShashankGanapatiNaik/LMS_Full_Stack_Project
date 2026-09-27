import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BookOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = [
    { to: "/courses", label: "Courses", icon: <BookOpenIcon />, always: true },
    { to: "/dashboard", label: "Dashboard", icon: <GridIcon />, role: "STUDENT" },
    { to: "/progress", label: "Progress", icon: <ChartIcon />, role: "STUDENT" },
    { to: "/manage", label: "Manage", icon: <SettingsIcon />, roles: ["INSTRUCTOR", "ADMIN"] },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (link.always) return true;
    if (link.auth && !user) return false;
    if (link.auth && user) return !link.role && !link.roles;
    if (link.role && user?.role === link.role) return true;
    if (link.roles && link.roles.includes(user?.role)) return true;
    return false;
  });

  const roleColor = {
    STUDENT: "bg-emerald-500/20 text-emerald-400",
    INSTRUCTOR: "bg-violet-500/20 text-violet-400",
    ADMIN: "bg-rose-500/20 text-rose-400",
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(13, 13, 31, 0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <BookOpenIcon />
              </div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-brand-300 transition-colors">
                Learn<span className="text-gradient">Hub</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link flex items-center gap-1.5 ${isActive(link.to) ? "active" : ""}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-white leading-none">{user.fullName}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${roleColor[user.role] || "bg-white/10 text-white/60"}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-xs px-3 py-2 gap-1.5"
                  >
                    <LogOutIcon />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Sign up free</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-secondary p-2"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 animate-slide-up" style={{ background: "rgba(13, 13, 31, 0.98)" }}>
            <div className="px-4 py-4 space-y-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-link flex items-center gap-2 w-full ${isActive(link.to) ? "active" : ""}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 mt-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.fullName}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary w-full text-sm">
                      <LogOutIcon /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-sm">Login</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-sm">Sign up free</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
