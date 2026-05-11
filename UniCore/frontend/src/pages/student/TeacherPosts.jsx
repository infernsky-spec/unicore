import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  Badge,
} from "../../components/shared/UI";
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiSearch,
  FiFilter,
  FiBookmark,
  FiX,
  FiMoreHorizontal,
  FiCalendar,
  FiEye,
  FiPaperclip,
  FiDownload,
} from "react-icons/fi";
import { HiBell } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function TeacherPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ postType: "all", courseId: "all" });
  const [search, setSearch] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [filters]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = {
        type: filters.postType !== "all" ? filters.postType : undefined,
        courseId: filters.courseId !== "all" ? filters.courseId : undefined,
      };

      const res = await api.get("/teacher-posts", { params });
      setPosts(res.data.data || []);

      const likedSet = new Set(
        res.data.data
          ?.filter((p) => p.likes?.includes(user?._id))
          ?.map((p) => p._id),
      );
      setLikedPosts(likedSet);
    } catch (err) {
      console.error("Error loading posts:", err);
      toast.error("Failed to load teacher posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.patch(`/teacher-posts/${postId}/like`);
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  const handleAddComment = async (postId) => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/teacher-posts/${postId}/comment`, {
        content: comment,
      });
      setSelectedPost(res.data.data);
      setComment("");
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const postTypeIcons = {
    announcement: "📢",
    assignment: "📝",
    material: "📚",
    notice: "📌",
    discussion: "💬",
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Faculty Transmission"
        subtitle="Access high-priority announcements and academic directives from your instructors"
        actions={
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
            <HiBell className="text-amber-600 w-4 h-4" />
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              {posts.length} Active Feeds
            </span>
          </div>
        }
      />

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 relative group">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academic feeds..."
            className="w-full bg-white border border-slate-100 rounded-[20px] pl-16 pr-8 py-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 shadow-sm transition-all"
          />
        </div>

        <select
          value={filters.postType}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, postType: e.target.value }))
          }
          className="bg-white border border-slate-100 rounded-[20px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-amber-500/50 shadow-sm transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Content Types</option>
          <option value="announcement">Announcements</option>
          <option value="assignment">Assignments</option>
          <option value="material">Materials</option>
          <option value="notice">Notices</option>
          <option value="discussion">Discussions</option>
        </select>

        <button
          onClick={() => setFilters({ postType: "all", courseId: "all" })}
          className="bg-amber-600 text-slate-900 rounded-[20px] px-8 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 active:scale-95"
        >
          Reset Filters
        </button>
      </div>

      {/* Feed Layout */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title="Feed Isolated"
          subtitle="No academic transmissions detected within current filter parameters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <motion.div
              layout
              key={post._id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-[24px] flex items-center justify-center text-2xl group-hover:bg-amber-50 transition-colors shadow-inner">
                    {postTypeIcons[post.postType] || "📝"}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
                      {post.teacher?.firstName} {post.teacher?.lastName}
                    </h4>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {new Date(post.publishAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    color={
                      post.postType === "announcement"
                        ? "yellow"
                        : post.postType === "assignment"
                          ? "purple"
                          : "gray"
                    }
                  >
                    {post.postType}
                  </Badge>
                  {post.priority === "urgent" && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-4 line-clamp-2 leading-tight">
                {post.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 mb-8 line-clamp-3 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <div className="flex items-center gap-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post._id);
                    }}
                    className={`flex items-center gap-2 font-black transition-colors ${likedPosts.has(post._id) ? "text-red-500" : "text-slate-600 hover:text-red-500"}`}
                  >
                    <FiHeart
                      className={likedPosts.has(post._id) ? "fill-current" : ""}
                    />
                    <span className="text-[10px] uppercase tracking-widest">
                      {post.likes?.length || 0}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-600 font-black">
                    <FiMessageCircle />
                    <span className="text-[10px] uppercase tracking-widest">
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-black">
                  <FiEye />
                  <span className="text-[10px] uppercase tracking-widest">
                    {post.viewCount} Views
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[64px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-10"
            >
              <div className="p-6 sm:p-16 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 text-slate-900 rounded-[28px] flex items-center justify-center text-xl font-black">
                      {selectedPost.teacher?.firstName?.[0]}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                        {selectedPost.title}
                      </h2>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Broadcasted by {selectedPost.teacher?.firstName}{" "}
                        {selectedPost.teacher?.lastName} ·{" "}
                        {new Date(selectedPost.publishAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="prose max-w-none mb-12">
                  <p className="text-lg font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>

                {selectedPost.attachments?.length > 0 && (
                  <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 mb-12">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 ml-1">
                      Attached Assets
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedPost.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:border-amber-500/50 hover:shadow-xl transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <FiPaperclip className="text-amber-600" />
                            <span className="text-sm font-black text-slate-900 truncate max-w-[150px]">
                              {att.filename}
                            </span>
                          </div>
                          <FiDownload className="text-slate-700 group-hover:text-amber-600 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interaction Stats */}
                <div className="flex gap-12 py-8 border-y border-slate-50 mb-12">
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                      {selectedPost.likes?.length || 0}
                    </p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Endorsements
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                      {selectedPost.comments?.length || 0}
                    </p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Responses
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                      {selectedPost.viewCount || 0}
                    </p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Reach
                    </p>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                    Response Channel
                  </h3>

                  {/* Comment Input */}
                  <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-[20px] border border-slate-100 focus-within:border-amber-500/50 focus-within:bg-white transition-all mb-10">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add to the discussion..."
                      className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-3 text-sm font-bold text-slate-900 placeholder-slate-400"
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost._id)}
                      disabled={submittingComment || !comment.trim()}
                      className="px-8 py-3 bg-amber-600 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-[24px] shadow-xl shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-30 transition-all"
                    >
                      {submittingComment ? "..." : "Transmit"}
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {selectedPost.comments?.length > 0 ? (
                      selectedPost.comments.map((c, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[10px] font-black flex-shrink-0">
                            {c.author?.firstName?.[0]}
                          </div>
                          <div className="flex-1">
                            <div className="bg-slate-50 rounded-[24px] p-5">
                              <p className="text-sm font-black text-slate-900 mb-1">
                                {c.author?.firstName} {c.author?.lastName}
                              </p>
                              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                {c.content}
                              </p>
                            </div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2 ml-4">
                              Verified Payload ·{" "}
                              {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 opacity-40">
                        <FiMessageCircle className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          No verified responses detected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
