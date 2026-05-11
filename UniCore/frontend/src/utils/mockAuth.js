/**
 * UniCore Mock Authentication System
 * Allows full login/signup functionality on the live Vercel site
 * without requiring any backend server connection.
 */

const DEMO_USERS_KEY = 'uc_demo_users';
const DEMO_TOKEN_PREFIX = 'UNICORE-DEMO-TOKEN-';

// ──────────────────────────────────────────────
//  Pre-seeded Demo Accounts
// ──────────────────────────────────────────────
const SEED_USERS = [
  {
    _id: 'demo_admin_001',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@edubridge.edu',
    password: 'Admin@123',
    role: 'admin',
    universityId: 'UG',
    isActive: true,
  },
  {
    _id: 'demo_teacher_001',
    firstName: 'Dr. Kwame',
    lastName: 'Mensah',
    email: 'teacher@edubridge.edu',
    password: 'Teacher@123',
    role: 'teacher',
    universityId: 'UG',
    isActive: true,
    teacherInfo: { department: 'Computer Science', faculty: 'Faculty of Science' },
  },
  {
    _id: 'demo_student_001',
    firstName: 'Ama',
    lastName: 'Asante',
    email: 'student@edubridge.edu',
    password: 'Student@123',
    role: 'student',
    universityId: 'UG',
    isActive: true,
    studentInfo: {
      indexNumber: 'UG/CS/24/0001',
      faculty: 'Faculty of Science',
      department: 'Computer Science',
      level: 100,
    },
  },
  {
    _id: 'demo_parent_001',
    firstName: 'Yaw',
    lastName: 'Asante',
    email: 'parent@edubridge.edu',
    password: 'Parent@123',
    role: 'parent',
    universityId: 'UG',
    isActive: true,
  },
];

// ──────────────────────────────────────────────
//  Storage Helpers
// ──────────────────────────────────────────────
function getUsers() {
  try {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  // Initialize with seed users on first run
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function generateToken(userId) {
  return `${DEMO_TOKEN_PREFIX}${userId}-${Date.now()}`;
}

function toPublicUser(user) {
  const { password, ...pub } = user;
  return pub;
}

// ──────────────────────────────────────────────
//  Check if backend is reachable
// ──────────────────────────────────────────────
export async function isBackendReachable() {
  try {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(apiBase.replace('/api', '/health'), { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (_) {
    return false;
  }
}

// ──────────────────────────────────────────────
//  Mock Login
// ──────────────────────────────────────────────
export function mockLogin(email, password, role) {
  const users = getUsers();
  const safeEmail = email.toLowerCase().trim();
  let user = users.find(u => u.email === safeEmail);

  if (!user) {
    throw new Error('Account not found. Please check your email or sign up.');
  }
  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }
  if (role && role !== '' && user.role !== role) {
    throw new Error(`This account is registered as a "${user.role}", not "${role}". Please select the correct portal.`);
  }

  const token = generateToken(user._id);
  return {
    success: true,
    token,
    refreshToken: generateToken(user._id + '_refresh'),
    user: toPublicUser(user),
  };
}

// ──────────────────────────────────────────────
//  Mock Register
// ──────────────────────────────────────────────
export function mockRegister(payload) {
  const users = getUsers();
  const { firstName, lastName, email, password, role, studentInfo, teacherInfo, facultyHeadInfo, deptHeadInfo } = payload;
  const safeEmail = email.toLowerCase().trim();

  if (!firstName || !lastName || !email || !password || !role) {
    throw new Error('All required fields must be filled in.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  if (users.find(u => u.email === safeEmail)) {
    throw new Error('An account with this email already exists. Please log in instead.');
  }

  const newUser = {
    _id: `user_${Date.now()}`,
    firstName,
    lastName,
    email: safeEmail,
    password,
    role,
    universityId: 'UG',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  if (studentInfo) newUser.studentInfo = studentInfo;
  if (teacherInfo) newUser.teacherInfo = teacherInfo;
  if (facultyHeadInfo) newUser.facultyHeadInfo = facultyHeadInfo;
  if (deptHeadInfo) newUser.deptHeadInfo = deptHeadInfo;

  users.push(newUser);
  saveUsers(users);

  const token = generateToken(newUser._id);
  return {
    success: true,
    token,
    refreshToken: generateToken(newUser._id + '_refresh'),
    user: toPublicUser(newUser),
  };
}

// ──────────────────────────────────────────────
//  Mock Get Me (from token)
// ──────────────────────────────────────────────
export function mockGetMe(token) {
  if (!token || !token.startsWith(DEMO_TOKEN_PREFIX)) return null;
  const userId = token.replace(DEMO_TOKEN_PREFIX, '').split('-')[0];
  const users = getUsers();
  const user = users.find(u => u._id === userId);
  return user ? toPublicUser(user) : null;
}
