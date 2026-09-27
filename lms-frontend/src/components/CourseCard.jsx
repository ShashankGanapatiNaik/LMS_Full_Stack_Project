import React from "react";
import { Link } from "react-router-dom";

const COURSE_COLORS = [
  "from-violet-600/80 to-indigo-600/80",
  "from-rose-600/80 to-pink-600/80",
  "from-emerald-600/80 to-teal-600/80",
  "from-amber-600/80 to-orange-600/80",
  "from-cyan-600/80 to-blue-600/80",
];

const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function CourseCard({ course, progress, isEnrolled, onEnroll, enrolling, userRole }) {
  const colorIdx = course.id ? (course.id - 1) % COURSE_COLORS.length : 0;
  const gradient = COURSE_COLORS[colorIdx];

  return (
    <div className="course-card flex flex-col group h-full">
      {/* Card Header Banner */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="text-white/70 group-hover:scale-110 transition-transform duration-300">
          <BookIcon />
        </div>
        {!course.published && (
          <span className="absolute top-3 right-3 badge-draft">Draft</span>
        )}
        {course.published && (
          <span className="absolute top-3 right-3 badge-published">Live</span>
        )}
        {isEnrolled && (
          <span className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckIcon /> Enrolled
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-brand-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-white/50 text-sm line-clamp-2 flex-1 mb-4">
          {course.description || "No description provided."}
        </p>

        {course.instructor && (
          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-4">
            <UserIcon />
            <span>{course.instructor.fullName}</span>
          </div>
        )}

        {/* Progress bar if provided */}
        {typeof progress === "number" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Progress</span>
              <span className="font-semibold text-brand-400">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          {userRole === "STUDENT" && !isEnrolled && onEnroll && (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={enrolling}
              className="btn-primary flex-1 text-xs py-2 px-3 justify-center"
            >
              {enrolling ? "Enrolling..." : "Enroll Course"}
            </button>
          )}
          <Link
            to={`/courses/${course.id}`}
            className={`text-xs py-2 px-3 justify-center gap-1.5 ${(!onEnroll || isEnrolled || userRole !== "STUDENT") ? "w-full btn-primary" : "btn-secondary flex-1"}`}
          >
            View Course
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
