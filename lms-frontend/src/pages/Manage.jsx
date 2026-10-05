import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/* ─── Icons ─── */
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SaveIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const RefreshIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const ClipboardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/></svg>;

const EyeIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

/* ─── Toast ─── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm flex items-center gap-2 px-4 py-3 rounded-xl shadow-glass ${type === "success" ? "alert-success" : type === "error" ? "alert-error" : "alert-info"}`}>
      <span className="flex-1 text-sm">{msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 ml-2 flex-shrink-0">✕</button>
    </div>
  );
}

/* ─── Submission Row ─── */
function SubmissionRow({ submission, onGrade }) {
  const [score, setScore] = useState(submission.score ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);

  const handleGrade = async () => {
    setSaving(true);
    await onGrade(Number(score), feedback);
    setSaving(false);
  };

  const statusBadge = {
    GRADED: "badge-graded",
    LATE: "badge-late",
    SUBMITTED: "badge-submitted",
  };

  return (
    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-semibold text-sm text-white">{submission.student?.fullName || "Student"}</span>
          <span className="text-xs text-white/40 ml-2">{submission.student?.email}</span>
        </div>
        <span className={`badge ${statusBadge[submission.status] || "badge-submitted"}`}>{submission.status}</span>
      </div>
      {submission.submissionText && (
        <p className="text-xs text-white/50 italic mb-3 p-2 rounded-lg bg-white/5 border border-white/5 line-clamp-3">
          "{submission.submissionText}"
        </p>
      )}
      {submission.status === "GRADED" && (
        <div className="text-xs text-emerald-400 mb-2">
          Score: {submission.score} pts | {submission.feedback && `Feedback: ${submission.feedback}`}
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="input-field w-20 py-1.5 text-xs px-2"
        />
        <input
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="input-field flex-1 py-1.5 text-xs px-2"
        />
        <button
          onClick={handleGrade}
          disabled={saving || score === ""}
          className="btn-primary text-xs px-3 py-1.5 gap-1"
        >
          {saving ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <SaveIcon />}
          {saving ? "Saving..." : "Grade"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Manage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [students, setStudents] = useState([]);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [toast, setToast] = useState(null);
  const [sectionTab, setSectionTab] = useState("materials"); // materials | assignments | students | grading

  // form state
  const [newCourse, setNewCourse] = useState({ title: "", description: "", published: true });
  const [newMaterial, setNewMaterial] = useState({ title: "", type: "NOTES", contentUrlOrText: "" });
  const [newAssignment, setNewAssignment] = useState({ title: "", instructions: "", dueDate: "", maxScore: 100 });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assignCourseId, setAssignCourseId] = useState("");

  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get("courseId");

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const loadCourses = async () => {
    try {
      const res = await api.get("/courses/my");
      const list = res.data;
      setCourses(list);
      if (courseIdParam && list.length > 0) {
        const found = list.find((c) => String(c.id) === String(courseIdParam));
        if (found) selectCourse(found);
      }
    } catch {
      try {
        const res = await api.get("/courses");
        const list = res.data.filter((c) => c.instructor?.email === user.email || user.role === "ADMIN");
        setCourses(list);
        if (courseIdParam && list.length > 0) {
          const found = list.find((c) => String(c.id) === String(courseIdParam));
          if (found) selectCourse(found);
        }
      } catch {
        showToast("Failed to load courses", "error");
      }
    }
  };

  const loadStudents = async () => {
    try {
      const res = await api.get("/enrollments/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    loadCourses();
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    setSectionTab("materials");
    setAssignCourseId(String(course.id)); // pre-fill the course in the enroll form
    try {
      const [assignRes, enrollRes] = await Promise.all([
        api.get(`/courses/${course.id}/assignments`),
        api.get(`/enrollments/course/${course.id}`),
      ]);
      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
      setCourseEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);

      // Auto-load submissions
      const subsMap = {};
      if (Array.isArray(assignRes.data)) {
        await Promise.all(
          assignRes.data.map(async (a) => {
            try {
              const r = await api.get(`/assignments/${a.id}/submissions`);
              subsMap[a.id] = Array.isArray(r.data) ? r.data : [];
            } catch { subsMap[a.id] = []; }
          })
        );
      }
      setSubmissions(subsMap);
    } catch {
      setAssignments([]);
      setCourseEnrollments([]);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post("/courses", newCourse);
      setNewCourse({ title: "", description: "", published: true });
      showToast("Course created successfully!");
      loadCourses();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create course.", "error");
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      await api.patch(`/courses/${course.id}/publish?published=${!course.published}`);
      showToast(`Course ${!course.published ? "published" : "unpublished"}`);
      loadCourses();
      if (selectedCourse?.id === course.id) {
        setSelectedCourse({ ...course, published: !course.published });
      }
    } catch (err) {
      showToast("Could not update course status.", "error");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course? This action cannot be undone.")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      showToast("Course deleted.");
      if (selectedCourse?.id === courseId) setSelectedCourse(null);
      loadCourses();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete course.", "error");
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${selectedCourse.id}/materials`, newMaterial);
      setNewMaterial({ title: "", type: "NOTES", contentUrlOrText: "" });
      showToast("Material added!");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to add material.", "error");
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/courses/${selectedCourse.id}/assignments`, {
        ...newAssignment,
        dueDate: newAssignment.dueDate ? new Date(newAssignment.dueDate).toISOString() : null,
      });
      setAssignments([...assignments, res.data]);
      setNewAssignment({ title: "", instructions: "", dueDate: "", maxScore: 100 });
      showToast("Assignment created!");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create assignment.", "error");
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !assignCourseId) return;
    try {
      await api.post(`/enrollments/assign?studentId=${selectedStudentId}&courseId=${assignCourseId}`);
      showToast("Student enrolled in course!");
      loadStudents();
      if (selectedCourse) selectCourse(selectedCourse);
    } catch (err) {
      showToast(err?.response?.data?.message || "Already enrolled or assignment failed.", "error");
    }
  };

  const handleAssignAllCourses = async (studentId) => {
    try {
      const res = await api.post(`/enrollments/assign-all/${studentId}`);
      showToast(typeof res.data === "string" ? res.data : "Student enrolled in all courses!");
      loadStudents();
      if (selectedCourse) selectCourse(selectedCourse);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to assign all courses.", "error");
    }
  };

  const handleAssignAllToCourse = async (courseId) => {
    try {
      const res = await api.post(`/enrollments/assign-all-to-course/${courseId}`);
      showToast(typeof res.data === "string" ? res.data : "All students enrolled in this course!");
      if (selectedCourse) selectCourse(selectedCourse);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to assign all students.", "error");
    }
  };

  const handleRemoveEnrollment = async (enrollmentId) => {
    if (!window.confirm("Remove this student from the course?")) return;
    try {
      await api.delete(`/enrollments/remove/${enrollmentId}`);
      showToast("Student removed from course.");
      if (selectedCourse) selectCourse(selectedCourse);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to remove student. Please restart backend server.", "error");
    }
  };

  const handleGrade = async (submissionId, assignmentId, score, feedback) => {
    try {
      await api.patch(`/submissions/${submissionId}/grade`, { score, feedback });
      const r = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions({ ...submissions, [assignmentId]: r.data });
      showToast("Grade saved!");
    } catch {
      showToast("Failed to save grade.", "error");
    }
  };

  const sectionTabs = [
    { key: "materials", label: "Materials", icon: <BookIcon /> },
    { key: "assignments", label: "Assignments", icon: <ClipboardIcon /> },
    { key: "students", label: `Students (${courseEnrollments.length})`, icon: <UsersIcon /> },
    { key: "grading", label: "Grading", icon: <SettingsIcon /> },
  ];

  return (
    <div className="min-h-screen">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e1035 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-3">
            <SettingsIcon /> Instructor Console
          </h1>
          <p className="text-white/50 text-sm">Manage courses, materials, assignments, and student enrollments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ─── Left Sidebar ─── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Course List */}
          <div className="glass rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Your Courses</h2>
            {courses.length === 0 && (
              <p className="text-white/30 text-xs text-center py-4">No courses yet. Create one below.</p>
            )}
            <ul className="space-y-1.5">
              {courses.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => selectCourse(c)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      selectedCourse?.id === c.id
                        ? "bg-brand-500/20 border border-brand-500/40 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate pr-2">{c.title}</span>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${c.published ? "bg-emerald-400" : "bg-amber-400"}`} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Create Course form */}
          <form onSubmit={handleCreateCourse} className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
              <PlusIcon /> New Course
            </h3>
            <input
              required
              placeholder="Course title"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              className="input-field text-sm py-2"
            />
            <textarea
              rows={3}
              placeholder="Description (optional)"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              className="input-field text-sm py-2 resize-none"
            />
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={newCourse.published}
                onChange={(e) => setNewCourse({ ...newCourse, published: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 accent-brand-500"
              />
              Publish immediately
            </label>
            <button type="submit" className="btn-primary w-full text-sm">
              <PlusIcon /> Create Course
            </button>
          </form>

          {/* Assign student */}
          <form onSubmit={handleAssignStudent} className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
              <UsersIcon /> Enroll Student
            </h3>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="input-field text-sm py-2"
              required
            >
              <option value="">-- Select Student --</option>
              {Array.isArray(students) && students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName || s.name || s.email || "Student"} ({s.email || "no-email"})
                </option>
              ))}
            </select>
            <select
              value={assignCourseId}
              onChange={(e) => setAssignCourseId(e.target.value)}
              className="input-field text-sm py-2"
              required
            >
              <option value="">-- Select Course --</option>
              {Array.isArray(courses) && courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 text-xs py-2">
                Enroll
              </button>
              {selectedStudentId && (
                <button
                  type="button"
                  onClick={() => handleAssignAllCourses(selectedStudentId)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  All Courses
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ─── Main Content ─── */}
        <div className="lg:col-span-3">
          {/* No course selected: students table */}
          {!selectedCourse && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2"><UsersIcon /> Registered Students</h3>
                <span className="badge-published">{Array.isArray(students) ? students.length : 0} total</span>
              </div>
              {(!Array.isArray(students) || students.length === 0) ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-white/40 text-sm">No student accounts yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                        <th className="text-left py-3 pr-4">Name</th>
                        <th className="text-left py-3 pr-4">Email</th>
                        <th className="text-right py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-white/3 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                {(st?.fullName || st?.email || "S")?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-white">{st?.fullName || "Student"}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-white/50">{st?.email}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleAssignAllCourses(st.id)}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Enroll All Courses
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-white/30 text-xs mt-6 text-center">← Select a course on the left to manage its content</p>
            </div>
          )}

          {/* Course selected */}
          {selectedCourse && (
            <div className="space-y-5">
              {/* Course header */}
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                    <p className="text-white/50 text-sm mt-1">{selectedCourse.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePublishToggle(selectedCourse)}
                      className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                        selectedCourse.published
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                    >
                      {selectedCourse.published ? <><EyeOffIcon /> Unpublish</> : <><EyeIcon /> Publish</>}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border text-red-400 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 transition-all"
                    >
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSectionTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      sectionTab === tab.key
                        ? "bg-brand-600 text-white"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* ─── Materials section ─── */}
              {sectionTab === "materials" && (
                <div className="space-y-4 animate-fade-in">
                  <form onSubmit={handleAddMaterial} className="glass rounded-2xl p-5 space-y-3">
                    <h3 className="font-semibold text-white text-sm mb-1">Add Learning Material</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Material title"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                        className="input-field text-sm py-2"
                      />
                      <select
                        value={newMaterial.type}
                        onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                        className="input-field text-sm py-2"
                      >
                        <option value="NOTES">📝 Notes</option>
                        <option value="VIDEO">🎬 Video</option>
                        <option value="DOCUMENT">📄 Document</option>
                        <option value="LINK">🔗 Link</option>
                      </select>
                    </div>
                    <input
                      placeholder="URL, YouTube link, or content text..."
                      value={newMaterial.contentUrlOrText}
                      onChange={(e) => setNewMaterial({ ...newMaterial, contentUrlOrText: e.target.value })}
                      className="input-field text-sm py-2"
                    />
                    <button type="submit" className="btn-primary text-sm">
                      <PlusIcon /> Add Material
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Assignments section ─── */}
              {sectionTab === "assignments" && (
                <div className="space-y-4 animate-fade-in">
                  <form onSubmit={handleAddAssignment} className="glass rounded-2xl p-5 space-y-3">
                    <h3 className="font-semibold text-white text-sm mb-1">Create Assignment</h3>
                    <input
                      required
                      placeholder="Assignment title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      className="input-field text-sm py-2"
                    />
                    <textarea
                      rows={3}
                      placeholder="Instructions for students..."
                      value={newAssignment.instructions}
                      onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                      className="input-field text-sm py-2 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">Due date & time</label>
                        <input
                          type="datetime-local"
                          value={newAssignment.dueDate}
                          onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">Max score</label>
                        <input
                          type="number"
                          placeholder="100"
                          value={newAssignment.maxScore}
                          onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary text-sm">
                      <PlusIcon /> Create Assignment
                    </button>
                  </form>

                  {assignments.length > 0 && (
                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-semibold text-white text-sm mb-3">Existing Assignments ({assignments.length})</h3>
                      <div className="space-y-2">
                        {assignments.map((a) => (
                          <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3">
                            <div>
                              <p className="text-sm font-medium text-white">{a.title}</p>
                              {a.dueDate && (
                                <p className="text-xs text-white/40 mt-0.5">
                                  Due: {new Date(a.dueDate).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-white/40">{a.maxScore} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Students section ─── */}
              {sectionTab === "students" && (
                <div className="glass rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white text-sm">Enrolled Students</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge-published">{Array.isArray(courseEnrollments) ? courseEnrollments.length : 0} enrolled</span>
                      <button
                        type="button"
                        onClick={() => handleAssignAllToCourse(selectedCourse.id)}
                        className="btn-primary text-xs py-1.5 px-3 gap-1"
                      >
                        <UsersIcon /> Assign All Students
                      </button>
                    </div>
                  </div>
                  {(!Array.isArray(courseEnrollments) || courseEnrollments.length === 0) ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">👥</div>
                      <p className="text-white/40 text-sm">No students enrolled in this course.</p>
                      <p className="text-white/25 text-xs mt-2">Use the sidebar to enroll students, or click "Assign All Students" above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {courseEnrollments.map((e) => {
                        // count submissions by this student across this course's assignments
                        const studentSubs = Object.values(submissions).flat().filter(
                          (s) => s.student?.id === e.student?.id
                        );
                        const submittedCount = studentSubs.length;
                        const gradedCount = studentSubs.filter((s) => s.status === "GRADED").length;
                        return (
                          <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                {(e.student?.fullName || e.student?.email || "S")?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{e.student?.fullName || "Student"}</p>
                                <p className="text-xs text-white/40">{e.student?.email || "No email"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-xs font-semibold text-brand-400">{Math.round(e.progressPercent || 0)}% progress</div>
                                <div className="w-20 progress-bar mt-1" style={{ height: "4px" }}>
                                  <div className="progress-fill" style={{ width: `${e.progressPercent || 0}%`, height: "4px" }} />
                                </div>
                                {assignments.length > 0 && (
                                  <div className="text-xs text-white/30 mt-1">
                                    {submittedCount}/{assignments.length} submitted
                                    {gradedCount > 0 && <span className="text-emerald-400 ml-1">· {gradedCount} graded</span>}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveEnrollment(e.id)}
                                className="text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                              >
                                <TrashIcon /> Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Grading section ─── */}
              {sectionTab === "grading" && (
                <div className="space-y-4 animate-fade-in">
                  {assignments.length === 0 ? (
                    <div className="glass rounded-2xl p-10 text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-white/40 text-sm">No assignments to grade yet.</p>
                    </div>
                  ) : (
                    assignments.map((a) => {
                      const subs = submissions[a.id] || [];
                      const ungradedCount = subs.filter((s) => s.status !== "GRADED").length;
                      return (
                        <div key={a.id} className="glass rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-white">{a.title}</h4>
                              {a.dueDate && <p className="text-xs text-white/40 mt-0.5">Due: {new Date(a.dueDate).toLocaleString()}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {ungradedCount > 0 && (
                                <span className="badge-submitted">{ungradedCount} pending</span>
                              )}
                              <button
                                onClick={async () => {
                                  const r = await api.get(`/assignments/${a.id}/submissions`);
                                  setSubmissions({ ...submissions, [a.id]: r.data });
                                }}
                                className="btn-secondary text-xs py-1.5 px-3 gap-1"
                              >
                                <RefreshIcon /> Refresh
                              </button>
                            </div>
                          </div>

                          {subs.length === 0 ? (
                            <p className="text-white/30 text-xs italic">No submissions yet for this assignment.</p>
                          ) : (
                            <div className="space-y-3">
                              {subs.map((s) => (
                                <SubmissionRow
                                  key={s.id}
                                  submission={s}
                                  onGrade={(score, feedback) => handleGrade(s.id, a.id, score, feedback)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
