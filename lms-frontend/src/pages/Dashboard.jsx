import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v1a8 8 0 0 0 8 8 8 8 0 0 0 8-8V6a2 2 0 0 0-2-2h-3"/>
    <path d="M17 4H7"/>
  </svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, avgProgress: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === "STUDENT") {
          const [enrollRes, progressRes] = await Promise.all([
            api.get("/enrollments/me"),
            api.get("/progress/me"),
          ]);
          const courses = enrollRes.data.map((e) => e.course);
          setData(courses);

          const pMap = {};
          let totalProgress = 0;
          let completedCount = 0;
          progressRes.data.forEach((p) => {
            pMap[p.courseId] = p.progressPercent;
            totalProgress += p.progressPercent;
            if (p.progressPercent >= 100) completedCount++;
          });
          setProgressMap(pMap);
          setStats({
            enrolled: courses.length,
            completed: completedCount,
            avgProgress: courses.length > 0 ? Math.round(totalProgress / courses.length) : 0,
          });
        } else {
          const res = await api.get("/courses/my");
          const myCourses = res.data;
          setData(myCourses);
          setStats({
            enrolled: myCourses.length,
            completed: myCourses.filter((c) => c.published).length,
            avgProgress: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const statCards = user.role === "STUDENT"
    ? [
        { label: "Enrolled Courses", value: stats.enrolled, icon: <BookIcon />, color: "from-brand-600/30 to-brand-800/30 border-brand-500/20", iconColor: "text-brand-400" },
        { label: "Completed", value: stats.completed, icon: <TrophyIcon />, color: "from-emerald-600/30 to-emerald-800/30 border-emerald-500/20", iconColor: "text-emerald-400" },
        { label: "Avg. Progress", value: `${stats.avgProgress}%`, icon: <ChartIcon />, color: "from-violet-600/30 to-violet-800/30 border-violet-500/20", iconColor: "text-violet-400" },
      ]
    : [
        { label: "Total Courses", value: stats.enrolled, icon: <BookIcon />, color: "from-brand-600/30 to-brand-800/30 border-brand-500/20", iconColor: "text-brand-400" },
        { label: "Published", value: stats.completed, icon: <TrophyIcon />, color: "from-emerald-600/30 to-emerald-800/30 border-emerald-500/20", iconColor: "text-emerald-400" },
      ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen">
      {/* Hero greeting */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e1035 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 10% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 90% 30%, #8b5cf6 0%, transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-white/40 text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            {user.fullName.split(" ")[0]} 👋
          </h1>
          <p className="text-white/50 text-sm">
            {user.role === "STUDENT" ? "Pick up where you left off and keep learning!" : "Manage your courses and help students succeed."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className={`glass rounded-2xl p-5 border bg-gradient-to-br ${s.color} flex items-center gap-4`}>
              <div className={`flex-shrink-0 ${s.iconColor}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/50">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              {user.role === "STUDENT" ? "My Courses" : "My Courses"}
            </h2>
            <p className="text-white/40 text-sm mt-0.5">
              {user.role === "STUDENT" ? "Track your learning progress" : "Manage your course catalog"}
            </p>
          </div>
          <div className="flex gap-3">
            {user.role === "STUDENT" && (
              <>
                <Link to="/courses" className="btn-secondary text-sm gap-2">
                  Browse More
                </Link>
                <Link to="/progress" className="btn-primary text-sm gap-2">
                  <ChartIcon />
                  My Progress
                </Link>
              </>
            )}
            {user.role !== "STUDENT" && (
              <Link to="/manage" className="btn-primary text-sm gap-2">
                <PlusIcon />
                Create Course
              </Link>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="skeleton h-32" />
                <div className="glass p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3 rounded" />
                  <div className="skeleton h-10 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">
              {user.role === "STUDENT" ? "🎓" : "📚"}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {user.role === "STUDENT" ? "No enrolled courses yet" : "No courses created yet"}
            </h3>
            <p className="text-white/40 text-sm mb-6">
              {user.role === "STUDENT" ? "Start your learning journey by browsing available courses." : "Create your first course and start teaching today."}
            </p>
            {user.role === "STUDENT" ? (
              <Link to="/courses" className="btn-primary">
                Browse Courses <ArrowRightIcon />
              </Link>
            ) : (
              <Link to="/manage" className="btn-primary">
                <PlusIcon /> Create Your First Course
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((course, i) => (
            <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <CourseCard
                course={course}
                progress={user.role === "STUDENT" ? progressMap[course.id] : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
