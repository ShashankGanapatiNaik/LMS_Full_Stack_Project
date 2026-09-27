import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/* ─── Icons ─── */
const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const NoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const materialConfig = {
  VIDEO: { icon: <VideoIcon />, label: "Video", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  DOCUMENT: { icon: <DocIcon />, label: "Document", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  LINK: { icon: <LinkIcon />, label: "Link", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  NOTES: { icon: <NoteIcon />, label: "Notes", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

/* ─── Toast ─── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-slide-up max-w-xs ${type === "success" ? "alert-success" : "alert-error"}`}>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

/* ─── Video Embed ─── */
function VideoEmbed({ url }) {
  const ytMatch = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return (
      <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video"
        />
      </div>
    );
  }
  return (
    <video controls className="w-full rounded-xl" style={{ maxHeight: "400px" }}>
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  );
}

/* ─── Material Item ─── */
function MaterialItem({ m, isExpanded, onToggle }) {
  const conf = materialConfig[m.type] || materialConfig.NOTES;
  const isUrl = m.contentUrlOrText?.startsWith("http");

  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border text-sm ${conf.color}`}>
          {conf.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{m.title}</p>
          <p className="text-xs text-white/40 mt-0.5">{conf.label}</p>
        </div>
        <span className="text-white/30 flex-shrink-0">
          {isExpanded ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          )}
        </span>
      </button>

      {isExpanded && m.contentUrlOrText && (
        <div className="px-4 pb-4 border-t border-white/5">
          {m.type === "VIDEO" ? (
            <div className="mt-4">
              <VideoEmbed url={m.contentUrlOrText} />
            </div>
          ) : isUrl ? (
            <a
              href={m.contentUrlOrText}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
            >
              Open Resource <ExternalLinkIcon />
            </a>
          ) : (
            <div className="mt-3 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {m.contentUrlOrText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Assignment Item ─── */
function AssignmentItem({ a, enrolled, user, mySubmissions }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localMsg, setLocalMsg] = useState("");

  const existing = mySubmissions?.find((s) => s.assignment?.id === a.id || s.assignmentId === a.id);
  const isPast = a.dueDate && new Date(a.dueDate) < new Date();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setLocalMsg("");
    try {
      await api.post(`/assignments/${a.id}/submissions`, { submissionText: text });
      setSubmitted(true);
      setText("");
      setLocalMsg("Assignment submitted successfully!");
    } catch (err) {
      setLocalMsg(err?.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-xl p-5 border border-white/5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-semibold text-white">{a.title}</h4>
          {a.instructions && <p className="text-sm text-white/50 mt-1">{a.instructions}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {a.dueDate && (
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${isPast ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-white/50 bg-white/5 border-white/10"}`}>
              <ClockIcon />
              {isPast ? "Past due" : "Due"}: {new Date(a.dueDate).toLocaleDateString()}
            </span>
          )}
          {a.maxScore && (
            <span className="text-xs text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              {a.maxScore} pts
            </span>
          )}
        </div>
      </div>

      {/* Existing submission */}
      {existing && (
        <div className="mb-3 rounded-xl p-3 border" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><CheckIcon /> Submitted</span>
            {existing.status && (
              <span className={`badge ${existing.status === "GRADED" ? "badge-graded" : existing.status === "LATE" ? "badge-late" : "badge-submitted"}`}>
                {existing.status}
              </span>
            )}
          </div>
          {existing.submissionText && (
            <p className="text-xs text-white/50 italic truncate">"{existing.submissionText}"</p>
          )}
          {existing.score != null && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-semibold">Score: {existing.score}/{a.maxScore}</span>
              {existing.feedback && <span className="text-white/40">— {existing.feedback}</span>}
            </div>
          )}
        </div>
      )}

      {/* Submit form for enrolled students */}
      {user?.role === "STUDENT" && enrolled && !existing && !submitted && (
        <div className="space-y-2">
          <textarea
            rows={3}
            className="input-field resize-none text-sm"
            placeholder="Type your answer or paste your submission here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {localMsg && (
            <div className={localMsg.includes("success") ? "alert-success text-xs" : "alert-error text-xs"}>{localMsg}</div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="btn-primary text-sm gap-2"
          >
            {submitting ? (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : <SendIcon />}
            {submitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      )}

      {submitted && !existing && (
        <div className="alert-success text-sm">
          <CheckIcon /> Assignment submitted successfully!
        </div>
      )}

      {localMsg && submitted && (
        <div className="alert-success text-xs mt-2">{localMsg}</div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [toast, setToast] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState("materials");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = user ? `/courses/${id}` : `/courses/public/${id}`;
      const [courseRes, materialsRes, assignmentsRes] = await Promise.all([
        api.get(endpoint).catch(() => api.get(`/courses/${id}`)),
        api.get(`/courses/${id}/materials`).catch(() => ({ data: [] })),
        api.get(`/courses/${id}/assignments`).catch(() => ({ data: [] })),
      ]);
      setCourse(courseRes.data);
      setMaterials(materialsRes.data);
      setAssignments(assignmentsRes.data);

      if (user) {
        try {
          const [enrollRes, subRes] = await Promise.all([
            api.get("/enrollments/me"),
            api.get("/submissions/me").catch(() => ({ data: [] })),
          ]);
          setEnrolled(enrollRes.data.some((e) => e.course?.id === Number(id)));
          setMySubmissions(subRes.data || []);
        } catch {
          // ignore
        }
      }
    } catch {
      setToast({ msg: "Failed to load course data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${id}`);
      setEnrolled(true);
      setToast({ msg: "You're now enrolled! Start learning below.", type: "success" });
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Could not enroll. Please try again.", type: "error" });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="skeleton h-10 w-2/3 rounded-xl" />
        <div className="skeleton h-6 w-1/3 rounded-xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Course not found</h2>
          <Link to="/courses" className="btn-primary mt-4">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 0% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 100% 50%, #06b6d4 0%, transparent 60%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Courses
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">{course.title}</h1>
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl mb-4">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                {course.instructor && (
                  <span className="flex items-center gap-1.5"><UserIcon /> {course.instructor.fullName}</span>
                )}
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  {materials.length} materials
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                  {assignments.length} assignments
                </span>
              </div>
            </div>

            {/* Enrollment CTA */}
            <div className="flex-shrink-0">
              {user && user.role === "STUDENT" && !enrolled && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary text-base px-6 py-3"
                >
                  {enrolling ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : null}
                  {enrolling ? "Enrolling..." : "Enroll Now — Free"}
                </button>
              )}
              {user && user.role === "STUDENT" && enrolled && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-emerald-400 text-sm font-semibold" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <CheckIcon /> Enrolled
                </div>
              )}
              {user && user.role !== "STUDENT" && (
                <Link to={`/manage?courseId=${course.id}`} className="btn-primary text-sm px-5 py-3">
                  Manage Course
                </Link>
              )}
              {!user && (
                <Link to="/login" className="btn-primary text-base px-6 py-3">
                  Login to Enroll
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { key: "materials", label: `Materials (${materials.length})` },
            { key: "assignments", label: `Assignments (${assignments.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? "bg-brand-600 text-white shadow-glow"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div className="space-y-2 animate-fade-in">
            {materials.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-white/40 text-sm">No learning materials added yet. Check back soon!</p>
              </div>
            ) : (
              materials.map((m) => (
                <MaterialItem
                  key={m.id}
                  m={m}
                  isExpanded={expandedMaterial === m.id}
                  onToggle={() => setExpandedMaterial(expandedMaterial === m.id ? null : m.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-4 animate-fade-in">
            {!user && (
              <div className="alert-info mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <Link to="/login" className="font-semibold hover:underline">Login</Link> to view and submit assignments.
              </div>
            )}
            {user?.role === "STUDENT" && !enrolled && (
              <div className="alert-info mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Enroll in this course to submit assignments.
              </div>
            )}
            {assignments.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-white/40 text-sm">No assignments created yet for this course.</p>
              </div>
            ) : (
              assignments.map((a) => (
                <AssignmentItem
                  key={a.id}
                  a={a}
                  enrolled={enrolled}
                  user={user}
                  mySubmissions={mySubmissions}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
