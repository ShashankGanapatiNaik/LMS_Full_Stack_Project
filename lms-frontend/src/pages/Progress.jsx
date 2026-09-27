import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const AwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

function CircleProgress({ percent }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="url(#prog-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-lg font-bold text-white">{Math.round(percent)}%</span>
    </div>
  );
}

export default function Progress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/progress/me")
      .then((res) => setProgress(res.data))
      .finally(() => setLoading(false));
  }, []);

  const avgProgress = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.progressPercent, 0) / progress.length)
    : 0;
  const completed = progress.filter((p) => p.progressPercent >= 100).length;
  const totalAssignments = progress.reduce((s, p) => s + p.totalAssignments, 0);
  const totalGraded = progress.reduce((s, p) => s + p.gradedSubmissions, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1a1035 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-violet-400" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <TrendingUpIcon />
            </div>
            <h1 className="text-3xl font-extrabold text-white">My Progress</h1>
          </div>
          <p className="text-white/50 text-sm ml-13">Track your learning journey across all enrolled courses</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        )}

        {!loading && progress.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">No progress data yet</h3>
            <p className="text-white/40 text-sm mb-6">Enroll in a course and complete assignments to track your progress.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        )}

        {!loading && progress.length > 0 && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Avg Progress", value: `${avgProgress}%`, color: "text-brand-400", bg: "bg-brand-500/10 border-brand-500/20" },
                { label: "Completed", value: completed, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Assignments", value: totalAssignments, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
                { label: "Graded", value: totalGraded, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              ].map((s) => (
                <div key={s.label} className={`glass rounded-xl p-4 border ${s.bg} text-center`}>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Course progress cards */}
            <div className="space-y-4">
              {progress.map((p, i) => (
                <div key={p.courseId} className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Circle progress */}
                    <div className="flex-shrink-0 flex justify-center sm:justify-start">
                      <CircleProgress percent={p.progressPercent} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-white text-lg leading-snug">{p.courseTitle}</h3>
                        {p.progressPercent >= 100 && (
                          <span className="badge-published flex items-center gap-1"><CheckCircleIcon /> Completed!</span>
                        )}
                      </div>

                      {/* Linear bar */}
                      <div className="progress-bar mb-4">
                        <div className="progress-fill" style={{ width: `${Math.min(p.progressPercent, 100)}%` }} />
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1.5">
                          <BookIcon />
                          {p.totalMaterials} materials
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {p.totalAssignments} assignments
                        </span>
                        <span className="flex items-center gap-1.5">
                          <AwardIcon />
                          {p.gradedSubmissions} graded
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${p.courseId}`}
                      className="btn-secondary text-sm flex-shrink-0"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
