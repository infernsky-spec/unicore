import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import IntroPage from './pages/IntroPage';
import SimpleUniversitySelect from './pages/SimpleUniversitySelect';
import UniversitySelectPage from './pages/UniversitySelectPage';
import LandingPage from './pages/LandingPage';
import LoginPage    from './pages/LoginPage';
import SignUpPage   from './pages/SignUpPage';
import StudentPortalApp from './pages/StudentPortalApp';
import NotFound     from './pages/NotFound';

import { AdminLayout, TeacherLayout, StudentLayout, ParentLayout, FacultyHeadLayout, DeptHeadLayout } from './components/shared/AdminLayout';

import AdminDashboard    from './pages/admin/Dashboard';
import AdminUsers        from './pages/admin/Users';
import AdminCourses      from './pages/admin/Courses';
import AdminSemesters    from './pages/admin/Semesters';
import AdminFees         from './pages/admin/Fees';
import AdminExams        from './pages/admin/Exams';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminStats        from './pages/admin/Statistics';
import AdminResults      from './pages/admin/Results';
import AdminFaculties    from './pages/admin/Faculties';
import AdminImport       from './pages/admin/Import';
import AdminPayments      from './pages/admin/Payments';
import AdminSubscription  from './pages/admin/Subscription';
import AdminAdmissions    from './pages/admin/Admissions';
import AdminStaffRegistry from './pages/admin/StaffRegistry';

import TeacherDashboard  from './pages/teacher/Dashboard';
import TeacherCourses    from './pages/teacher/Courses';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherResults    from './pages/teacher/Results';
import TeacherResources  from './pages/teacher/Resources';
import TeacherExams      from './pages/teacher/Exams';
import TeacherRegistration from './pages/teacher/Registration';

import StudentDashboard  from './pages/student/Dashboard';
import StudentCourses    from './pages/student/Courses';
import StudentAttendance from './pages/student/Attendance';
import StudentFees       from './pages/student/Fees';
import StudentResources  from './pages/student/Resources';
import StudentExams      from './pages/student/Exams';
import StudentResults    from './pages/student/Results';
import StudentProfile    from './pages/student/Profile';
import StudentRegistration from './pages/student/Registration';
import StudentAI         from './pages/student/AIAssistant';
import StudentPremium    from './pages/student/Premium';
import StudentTeacherPosts from './pages/student/TeacherPosts';
import CourseRepSignup    from './pages/student/CourseRepSignup';
import CourseRepRequests  from './pages/shared/CourseRepRequests';

import ParentDashboard   from './pages/parent/Dashboard';
import ParentChildren    from './pages/parent/Children';
import ParentFees        from './pages/parent/Fees';
import ParentAttendance  from './pages/parent/Attendance';

const Loader = () => {
  console.log('[Loader] Rendering loader');
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"/>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-amber-400/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <div className="text-center">
          <p className="text-amber-500 text-lg font-black uppercase tracking-tighter">UniCore</p>
          <p className="text-slate-400 dark:text-slate-500 text-[7px] font-black uppercase tracking-[0.4em] mt-1">Initializing Node...</p>
        </div>
      </div>
    </div>
  );
};


const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  console.log('[RootRedirect] State:', { loading, userExists: !!user, userRole: user?.role });
  if (loading) return <Loader />;
  if (!user) {
    const selectedUni = localStorage.getItem('eb_university');
    if (selectedUni) {
      const uniId = JSON.parse(selectedUni).id;
      console.log('[RootRedirect] Redirecting to university login:', `/login?uni=${uniId}`);
      return <Navigate to={`/login?uni=${uniId}`} replace />;
    }
    console.log('[RootRedirect] No university selected, to landing');
    return <Navigate to="/landing" replace />;
  }
  const map = { 
    super_admin: '/admin/dashboard',
    admin: '/admin/dashboard', 
    teacher: '/teacher/dashboard', 
    student: '/student/dashboard', 
    parent: '/parent/dashboard', 
    course_rep: '/student/dashboard',
    faculty_head: '/faculty-head/dashboard',
    dept_head: '/dept-head/dashboard'
  };
  const targetRoute = map[user.role] || '/login';
  console.log('[RootRedirect] User found, redirecting to:', targetRoute);
  return <Navigate to={targetRoute} replace />;
};

// Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
          fontFamily: 'Inter, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: '#121214',
            padding: '40px',
            borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.05)',
            maxWidth: '500px'
          }}>
            <h1 style={{ color: '#d97706', marginBottom: '8px', fontSize: '20px', fontWeight: '900', letterSpacing: '-0.05em', textTransform: 'uppercase' }}>
              UniCore
            </h1>
            <p style={{ color: '#dc2626', marginBottom: '12px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              System Error
            </p>
            <p style={{ color: '#475569', marginBottom: '16px', fontSize: '12px', fontWeight: '600' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <details style={{ marginBottom: '16px', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <summary style={{ cursor: 'pointer', color: '#64748b', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stack trace</summary>
              <pre style={{ marginTop: '8px', fontSize: '10px', color: '#475569', overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '9px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.2em'
              }}
            >
              Refresh System
            </button>
            <p style={{ marginTop: '20px', color: '#1e293b', fontSize: '6px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Powered by NexaVision</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('[App] Rendering main App component');
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration:4000, style:{ fontFamily:'Inter,sans-serif', fontSize:'14px' } }} />
          <Routes>
            <Route path="/" element={<UniversitySelectPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/student/course-rep-signup" element={<Protected roles={['student']}><CourseRepSignup /></Protected>} />
            <Route path="/portal" element={<StudentPortalApp />} />

            {/* ADMIN */}
            <Route path="/admin" element={<Protected roles={['admin', 'super_admin']}><AdminLayout /></Protected>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="admissions" element={<AdminAdmissions />} />
              <Route path="staff" element={<AdminStaffRegistry />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="faculties" element={<AdminFaculties />} />
              <Route path="semesters" element={<AdminSemesters />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="statistics" element={<AdminStats />} />
              <Route path="import" element={<AdminImport />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="subscription" element={<AdminSubscription />} />
            </Route>

            {/* TEACHER */}
            <Route path="/teacher" element={<Protected roles={['teacher']}><TeacherLayout /></Protected>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="exams" element={<TeacherExams />} />
              <Route path="results" element={<TeacherResults />} />
              <Route path="resources" element={<TeacherResources />} />
              <Route path="registration" element={<TeacherRegistration />} />
              <Route path="course-rep-requests" element={<CourseRepRequests />} />
            </Route>

            {/* STUDENT */}
            <Route path="/student" element={<Protected roles={['student','course_rep']}><StudentLayout /></Protected>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="resources" element={<StudentResources />} />
              <Route path="registration" element={<StudentRegistration />} />
              <Route path="ai" element={<StudentAI />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="premium" element={<StudentPremium />} />
              <Route path="teacher-posts" element={<StudentTeacherPosts />} />
            </Route>

            {/* FACULTY HEAD */}
            <Route path="/faculty-head" element={<Protected roles={['faculty_head']}><FacultyHeadLayout /></Protected>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="departments" element={<AdminFaculties />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="semesters" element={<AdminSemesters />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="statistics" element={<AdminStats />} />
            </Route>

            {/* DEPT HEAD */}
            <Route path="/dept-head" element={<Protected roles={['dept_head']}><DeptHeadLayout /></Protected>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="students" element={<AdminUsers />} />
              <Route path="semesters" element={<AdminSemesters />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="statistics" element={<AdminStats />} />
              <Route path="course-rep-requests" element={<CourseRepRequests />} />
            </Route>

            <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-5xl font-black text-red-600">403</h1><p className="text-slate-600 mt-2">Access Denied</p><a href="/" className="btn-primary mt-4 inline-block">Go Home</a></div></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </ThemeProvider>
  );
}

