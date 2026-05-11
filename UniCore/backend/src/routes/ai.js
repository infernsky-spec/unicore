const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const https = require('https');

// Helper: call Claude API
async function callClaude(messages, systemPrompt, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            console.error('Claude API Error:', response.error);
            resolve('AI response unavailable. Please check API configuration.');
            return;
          }
          resolve(response.content?.[0]?.text || 'No response from Claude AI');
        } catch (parseError) {
          console.error('Claude API Parse Error:', parseError);
          resolve('AI response unavailable. Please try again later.');
        }
      });
    });

    req.on('error', (error) => {
      console.error('Claude API Request Error:', error);
      resolve('AI is unavailable right now. Please try again later.');
    });

    req.write(body);
    req.end();
  });
}

// Helper: call OpenAI
async function callOpenAI(messages, systemPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini', max_tokens: 1024,
      messages: [{ role:'system', content: systemPrompt }, ...messages]
    });
    const options = {
      hostname: 'api.openai.com', port: 443,
      path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { const j = JSON.parse(data); resolve(j.choices?.[0]?.message?.content || 'No response'); }
        catch { resolve('AI response unavailable.'); }
      });
    });
    req.on('error', () => resolve('AI is unavailable right now.'));
    req.write(body); req.end();
  });
}

// POST /api/ai/chat
const University = require('../models/University');

async function getUniversityApiKey(user) {
  if (!user.universityId) return null;
  const mongoose = require('mongoose');
  let uni;
  if (mongoose.Types.ObjectId.isValid(user.universityId)) {
    uni = await University.findById(user.universityId).select('anthropicApiKey');
  } else {
    uni = await University.findOne({ shortName: user.universityId }).select('anthropicApiKey');
  }
  return uni?.anthropicApiKey;
}

router.post('/chat', protect, async (req, res) => {
  try {
    const { messages, provider = 'claude', context = 'general' } = req.body;
    const apiKey = await getUniversityApiKey(req.user);
if (!apiKey) {
      // Demo mode or admin key validation
      const validateAdminKey = require('../middleware/adminKey');
      await new Promise((resolve, reject) => {
        validateAdminKey({ headers: { authorization: `Bearer ${req.headers['x-admin-key'] || req.body.adminKey}` }, user: req.user }, {}, resolve);
      }).catch(() => {});
    }
    if (!messages || !messages.length)
      return res.status(400).json({ success: false, message: 'Messages are required.' });

    const user = req.user;
    const systemPrompts = {
      general:  `You are EduBridge AI Assistant, a helpful academic AI for a university management system. The user is ${user.firstName} ${user.lastName}, a ${user.role}. Be helpful, concise, and academically focused. Today is ${new Date().toDateString()}.`,
      study:    `You are an expert academic study planner and tutor. Help the student ${user.firstName} create effective study plans, explain concepts, and improve their learning. Be encouraging and specific.`,
      planning: `You are an academic planning assistant. Help ${user.firstName} (${user.role}) plan their academic schedule, set goals, and manage their university workload effectively.`,
      admin:    `You are an administrative AI assistant for EduBridge university system. Help the administrator with management decisions, data analysis, and university operations.`,
      teacher:  `You are a teaching assistant AI. Help the lecturer ${user.firstName} with course planning, assessment design, and student management.`,
    };

    const systemPrompt = systemPrompts[context] || systemPrompts.general;
    let reply;

    if (provider === 'openai' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here') {
      reply = await callOpenAI(messages, systemPrompt);
    } else if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key_here') {
      reply = await callClaude(messages, systemPrompt, apiKey);
    } else {
      // Demo mode - smart canned responses
      const last = (messages[messages.length - 1]?.content || '').toLowerCase();
      if (last.includes('study') || last.includes('plan')) {
        reply = `**Your Personalised Study Plan**\n\nBased on your courses, here's a recommended schedule:\n\n• Morning (7-9am): Review lecture notes from the previous day\n• Study blocks: 90 minutes focused study + 15 min break (Pomodoro)\n• Evening: Practice problems and past questions\n\nFor best results: Start exam revision at least 3 weeks early. Create summary sheets for each topic. Study in groups for complex subjects.\n\n*To unlock full AI capabilities, add your API key in the backend .env file.*`;
      } else if (last.includes('exam') || last.includes('test')) {
        reply = `**Exam Preparation Tips**\n\n1. Review your exam timetable in the Exams section\n2. Create a revision schedule working backwards from each exam date\n3. Focus on past questions and mark schemes\n4. Get adequate sleep the night before\n5. Arrive early and bring all required materials\n\nNeed help with a specific subject? Just ask!`;
      } else if (last.includes('fee') || last.includes('payment')) {
        reply = `You can check your full fee breakdown in the **Fees & Payments** section. If you have payment concerns, contact the accounts office. For installment plans, speak with the finance department.`;
      } else {
        reply = `Hello ${user.firstName}! I'm your EduBridge AI Assistant. I can help you with:\n\n• 📚 Study planning and tips\n• 📅 Academic scheduling\n• 📝 Exam preparation\n• 💡 Course guidance\n• 🎯 Goal setting\n\nTo unlock full AI responses, add your Claude or ChatGPT API key in the backend **.env** file. What would you like help with today?`;
      }
    }

    return res.json({ success: true, reply, provider: process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key_here' ? 'claude' : (process.env.OPENAI_API_KEY !== 'your_openai_key_here' ? 'openai' : 'demo') });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI error: ' + err.message });
  }
});

// POST /api/ai/study-plan
router.post('/study-plan', protect, async (req, res) => {
  try {
    const { courses, examDates, hoursPerDay } = req.body;
    const systemPrompt = `You are an expert academic study planner. Create detailed, actionable study plans. Format with markdown.`;
    const userMessage  = `Create a detailed study plan for a university student with these courses: ${JSON.stringify(courses)}. Exam dates: ${JSON.stringify(examDates)}. Available study hours per day: ${hoursPerDay}. Include daily schedules, topic prioritisation, and revision strategies.`;

    let plan;
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key_here') {
      const apiKey = await getUniversityApiKey(req.user);
      plan = await callClaude([{ role:'user', content: userMessage }], systemPrompt, apiKey);
    } else {
      plan = `# Your Personalised Study Plan\n\n## Week 1-2: Foundation\n${courses?.map(c => `- **${c}**: Review all lecture notes, create summary sheets`).join('\n') || '- Review all course materials'}\n\n## Week 3-4: Practice\n- Attempt past exam questions for each course\n- Form study groups\n- Identify weak areas\n\n## Final Week: Revision\n- Focus on weak areas\n- Full past paper practice under timed conditions\n- Rest and preparation\n\n*Add your API key for a personalised AI-generated plan.*`;
    }

    return res.json({ success: true, plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error generating plan: ' + err.message });
  }
});

module.exports = router;
