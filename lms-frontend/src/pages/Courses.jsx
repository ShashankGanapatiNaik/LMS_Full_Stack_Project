import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";

/* ─── Icons ─── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm flex items-center gap-2 px-4 py-3 rounded-xl shadow-glass ${type === "success" ? "alert-success" : "alert-error"}`}>
      <span className="flex-1 text-sm">{msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 ml-2">✕</button>
    </div>
  );
}

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isInstructor = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrollingId, setEnrollingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PUBLISHED | DRAFT
  const [viewMode, setViewMode] = useState(isInstructor ? "INSTRUCTOR" : "STUDENT"); // INSTRUCTOR | STUDENT
  const [toast, setToast] = useState(null);

  // New course modal state
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", published: true });
  const [creating, setCreating] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isInstructor && viewMode === "INSTRUCTOR") {
        const res = await api.get("/courses/my");
        setCourses(res.data);
      } else {
        const courseRes = await api.get("/courses/public");
        setCourses(courseRes.data);

        if (user && user.role === "STUDENT") {
          try {
            const enrollRes = await api.get("/enrollments/me");
            const ids = new Set(enrollRes.data.map((e) => e.course?.id).filter(Boolean));
            setEnrolledIds(ids);
          } catch { /* ignore */ }
        }
      }
    } catch {
      setError("Could not load courses. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }, [isInstructor, viewMode, user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await api.post(`/enrollments/${courseId}`);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
      const targetCourse = courses.find((c) => c.id === courseId);
      setToast({ msg: `Enrolled in "${targetCourse?.title || "course"}"! Added to your Dashboard.`, type: "success" });
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Could not enroll. Please try again.", type: "error" });
    } finally {
      setEnrollingId(null);
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      await api.patch(`/courses/${course.id}/publish?published=${!course.published}`);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, published: !c.published } : c))
      );
      setToast({ msg: `Course ${!course.published ? "published" : "unpublished"} successfully!`, type: "success" });
    } catch {
      setToast({ msg: "Could not update course status.", type: "error" });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setToast({ msg: "Course deleted.", type: "success" });
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Failed to delete course.", type: "error" });
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/courses", newCourse);
      setCourses((prev) => [res.data, ...prev]);
      setNewCourse({ title: "", description: "", published: true });
      setShowModal(false);
      setToast({ msg: "New course created successfully!", type: "success" });
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Failed to create course.", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(search.toLowerCase());
    
    if (viewMode === "INSTRUCTOR") {
      if (statusFilter === "PUBLISHED") return matchesSearch && c.published;
      if (statusFilter === "DRAFT") return matchesSearch && !c.published;
    }
    return matchesSearch;
  });

  const publishedCount = courses.filter((c) => c.published).length;
  const draftCount = courses.length - publishedCount;

  /* ─────────────────────────────────────────────────────────────
     RENDER: INSTRUCTOR VIEW
  ───────────────────────────────────────────────────────────── */
  if (isInstructor && viewMode === "INSTRUCTOR") {
    return (
      <div className="min-h-screen">
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* Create Course Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="glass rounded-2xl p-6 w-full max-w-lg space-y-4 border border-white/10 shadow-glass">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PlusIcon /> Create New Course
                </h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Course Title *</label>
                  <input
                    required
                    placeholder="e.g. Master React & Node.js"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Comprehensive description of what students will learn..."
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="input-field text-sm resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newCourse.published}
                    onChange={(e) => setNewCourse({ ...newCourse, published: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 accent-brand-500"
                  />
                  Publish immediately (Visible to students)
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="btn-primary flex-1 text-sm gap-2">
                    {creating ? "Creating..." : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e1035 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 20% 30%, #8b5cf6 0%, transparent 50%)" }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-brand-400 text-xs font-semibold uppercase tracking-wider">Instructor Workspace</span>
                <h1 className="text-3xl font-extrabold text-white mt-1">My Created Courses</h1>
                <p className="text-white/50 text-sm mt-1">Manage, publish, edit, and create new courses for your students.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setViewMode("STUDENT")}
                  className="btn-secondary text-xs px-3.5 py-2.5 gap-2"
                >
                  <EyeIcon /> Public Catalog Preview
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary text-sm px-4 py-2.5 gap-2 shadow-glow"
                >
                  <PlusIcon /> Create Course
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
              <div className="glass rounded-xl p-4 border border-white/5 bg-white/3">
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-xs text-white/40 mt-0.5">Total Courses</div>
              </div>
              <div className="glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-2xl font-bold text-emerald-400">{publishedCount}</div>
                <div className="text-xs text-emerald-300/60 mt-0.5">Published Live</div>
              </div>
              <div className="glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
                <div className="text-2xl font-bold text-amber-400">{draftCount}</div>
                <div className="text-xs text-amber-300/60 mt-0.5">Draft Courses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Status Pills */}
            <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { id: "ALL", label: `All (${courses.length})` },
                { id: "PUBLISHED", label: `Published (${publishedCount})` },
                { id: "DRAFT", label: `Drafts (${draftCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search my courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 py-2 text-xs w-full"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden glass p-5 space-y-3">
                  <div className="skeleton h-6 w-3/4 rounded" />
                  <div className="skeleton h-4 rounded" />
                  <div className="skeleton h-10 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && <div className="alert-error max-w-md mx-auto">{error}</div>}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center max-w-xl mx-auto my-8 border border-white/5">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {search ? `No courses match "${search}"` : "No courses created yet"}
              </h3>
              <p className="text-white/40 text-sm mb-6">
                {search ? "Try adjusting your search or status filter." : "Create your first course to start teaching and sharing knowledge with students."}
              </p>
              {!search && (
                <button onClick={() => setShowModal(true)} className="btn-primary mx-auto gap-2">
                  <PlusIcon /> Create Your First Course
                </button>
              )}
            </div>
          )}

          {/* Instructor Course Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <div key={course.id} className="glass rounded-2xl overflow-hidden border border-white/5 flex flex-col group animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  {/* Top Gradient Banner */}
                  <div className="relative h-28 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        course.published
                          ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"
                          : "text-amber-300 bg-amber-500/20 border-amber-500/40"
                      }`}>
                        {course.published ? "● Published" : "○ Draft"}
                      </span>

                      <button
                        onClick={() => handlePublishToggle(course)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          course.published
                            ? "text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                            : "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                        }`}
                      >
                        {course.published ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                    <div className="text-white/60 text-xs flex items-center gap-1">
                      <BookIcon /> Course #{course.id}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-white text-base mb-2 line-clamp-1 group-hover:text-brand-300 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-white/50 text-sm line-clamp-2 flex-1 mb-4">
                      {course.description || "No description specified."}
                    </p>

                    {/* Actions Toolbar */}
                    <div className="space-y-2 mt-auto pt-2 border-t border-white/5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/manage?courseId=${course.id}`)}
                          className="btn-primary flex-1 text-xs py-2 px-3 gap-1.5 justify-center"
                        >
                          <SettingsIcon /> Manage & Edit
                        </button>
                        <Link
                          to={`/courses/${course.id}`}
                          className="btn-secondary text-xs py-2 px-3 gap-1 justify-center"
                          title="Preview student view"
                        >
                          <EyeIcon /> Preview
                        </Link>
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="w-full text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <TrashIcon /> Delete Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER: STUDENT / PUBLIC CATALOG VIEW
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
              <SparkleIcon />
              {courses.length} Courses Available
            </div>
            {isInstructor && (
              <button
                onClick={() => setViewMode("INSTRUCTOR")}
                className="btn-secondary text-xs px-3 py-1.5 gap-1.5 rounded-full"
              >
                <SettingsIcon /> Back to Instructor Workspace
              </button>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Explore & Master<br />
            <span className="text-gradient">New Skills Today</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Browse our curated library of expert-led courses and start learning at your own pace.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search courses, topics, instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 py-4 text-base rounded-2xl w-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="skeleton h-32" />
                <div className="glass p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-10 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="alert-error max-w-md mx-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {search && (
              <p className="text-white/40 text-sm mb-6">
                {filtered.length > 0 ? `Showing ${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"` : `No courses match "${search}"`}
              </p>
            )}
            {filtered.length === 0 && !search && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                <p className="text-white/40">Check back soon — instructors are creating amazing content!</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <CourseCard
                    course={course}
                    isEnrolled={enrolledIds.has(course.id)}
                    onEnroll={handleEnroll}
                    enrolling={enrollingId === course.id}
                    userRole={user?.role}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

