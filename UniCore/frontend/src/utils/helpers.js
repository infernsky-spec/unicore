import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date, fmt='dd MMM yyyy') => { if(!date) return '—'; try{ return format(new Date(date), fmt); }catch{ return '—'; } };
export const formatDateTime = (date) => formatDate(date,'dd MMM yyyy, HH:mm');
export const formatTime     = (date) => formatDate(date,'HH:mm');
export const timeAgo        = (date) => { try{ return formatDistanceToNow(new Date(date),{addSuffix:true}); }catch{ return '—'; } };
export const formatCurrency = (amount, currency='GHS') => new Intl.NumberFormat('en-GH',{style:'currency',currency}).format(amount||0);
export const getInitials    = (first,last) => `${(first||'')[0]||''}${(last||'')[0]||''}`.toUpperCase();
export const getRoleBadgeClass = (role) => ({admin:'badge-purple',teacher:'badge-amber',student:'badge-orange',parent:'badge-yellow',course_rep:'badge-purple',faculty_head:'badge-blue',dept_head:'badge-blue'}[role]||'badge-gray');
export const getRoleLabel   = (role) => ({admin:'Administrator',teacher:'Lecturer',student:'Student',parent:'Parent/Guardian',course_rep:'Course Rep',faculty_head:'Head of Faculty',dept_head:'Head of Department'}[role]||role);

export const generateIndexNumber = (deptCode, year, level, count) => {
  const yearShort = String(year).slice(-2);
  const levelCode = String(Math.floor(level/100)).padStart(2, '0');
  const countStr = String(count).padStart(4, '0');
  return `${deptCode}/${yearShort}/${levelCode}/${countStr}`;
};
export const getAttendanceBadge = (pct) => pct>=75?'badge-green':pct>=60?'badge-yellow':'badge-red';
export const getFeesStatusBadge = (status) => ({paid:'badge-green',partial:'badge-yellow',unpaid:'badge-red',overdue:'badge-red',waived:'badge-purple'}[status]||'badge-gray');
export const formatDayLabel = (date) => { const d=new Date(date); if(isToday(d)) return 'Today'; if(isTomorrow(d)) return 'Tomorrow'; return format(d,'EEE, dd MMM'); };
export const getGradeColor  = (grade) => ({'A+':'text-emerald-600',A:'text-emerald-500','B+':'text-amber-600',B:'text-amber-500','C+':'text-orange-600',C:'text-orange-500','D+':'text-yellow-600',D:'text-yellow-500',F:'text-red-600'}[grade]||'text-slate-600');
export const truncate       = (str,n=60) => str&&str.length>n ? str.slice(0,n)+'...' : str;
export const capitalize     = (s) => s ? s.charAt(0).toUpperCase()+s.slice(1) : '';
export const pluralize      = (n,word) => `${n} ${word}${n!==1?'s':''}`;
