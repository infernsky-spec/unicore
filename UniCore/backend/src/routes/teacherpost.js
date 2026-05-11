const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const TeacherPost = require('../models/TeacherPost');

// Get all teacher posts (visible to user)
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, page = 1, limit = 20, type } = req.query;
    const q = { isPublished: true, $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }] };

    // Filter by course if specified
    if (courseId) q.course = courseId;

    // Filter by type if specified
    if (type) q.postType = type;

    // Filter by visibility
    q.$or = [
      { visibility: 'public' },
      { visibility: 'enrolled', course: { $in: req.user.studentInfo?.registeredCourses || [] } },
      { teacher: req.user._id },
    ];

    const posts = await TeacherPost.find(q)
      .populate('teacher', 'firstName lastName profilePhoto')
      .populate('course', 'code title')
      .sort({ isPinned: -1, publishAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TeacherPost.countDocuments(q);

    return res.json({ success: true, data: posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get single post
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await TeacherPost.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { viewedBy: req.user._id }, $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('teacher', 'firstName lastName profilePhoto')
      .populate('course', 'code title')
      .populate('comments.author', 'firstName lastName profilePhoto');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    return res.json({ success: true, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create teacher post (teachers only)
router.post('/', protect, authorise('teacher'), async (req, res) => {
  try {
    const { title, content, courseId, postType = 'announcement', priority = 'normal', visibility = 'enrolled', attachments = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content required' });
    }

    const post = await TeacherPost.create({
      teacher: req.user._id,
      course: courseId,
      title,
      content,
      postType,
      priority,
      visibility,
      attachments,
    });

    // Emit socket event for real-time updates
    req.app.get('io')?.emit('new_teacher_post', { title, course: courseId, postType });

    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update post (only creator or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await TeacherPost.findById(req.params.id);

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Check authorization
    if (post.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await TeacherPost.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teacher', 'firstName lastName')
      .populate('course', 'code title');

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await TeacherPost.findById(req.params.id);

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await TeacherPost.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Like/Unlike post
router.patch('/:id/like', protect, async (req, res) => {
  try {
    const post = await TeacherPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    return res.json({ success: true, data: post, isLiked: !isLiked });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Comment content required' });

    const post = await TeacherPost.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            author: req.user._id,
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('comments.author', 'firstName lastName profilePhoto');

    return res.json({ success: true, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
