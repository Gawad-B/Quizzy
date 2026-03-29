import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const subjectKeyToName = {
  math: 'Mathematics',
  science: 'Science',
  history: 'History',
  literature: 'Literature',
  geography: 'Geography',
  chemistry: 'Chemistry',
  physics: 'Physics',
  english: 'English',
};

function getTargetUserId(req) {
  return req.params.targetId === 'me' ? req.user.id : req.params.targetId;
}

async function resolveSubjectId(subjectValue) {
  if (!subjectValue) {
    return null;
  }

  const rawSubject = String(subjectValue).trim();
  if (!rawSubject) {
    return null;
  }

  const normalizedKey = rawSubject.toLowerCase();
  const subjectName = subjectKeyToName[normalizedKey] || rawSubject;

  const existing = await pool.query('SELECT id FROM subjects WHERE LOWER(name) = LOWER($1) LIMIT 1', [subjectName]);
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const created = await pool.query(
    `INSERT INTO subjects (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [subjectName]
  );

  return created.rows[0].id;
}

router.post('/:targetId/quizzes', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);

    if (String(targetUserId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to create quizzes for this user.' });
    }

    const {
      title,
      subject,
      totalQuestions,
      status = 'Unfinished',
      score = 0,
      date,
      image,
    } = req.body;

    const normalizedTitle = String(title || '').trim();
    const normalizedStatus = status === 'Finished' ? 'Finished' : 'Unfinished';
    const normalizedTotalQuestions = Number(totalQuestions);
    const normalizedScore = Number(score || 0);

    if (!normalizedTitle) {
      return res.status(400).json({ success: false, message: 'Quiz title is required.' });
    }

    if (!Number.isFinite(normalizedTotalQuestions) || normalizedTotalQuestions <= 0) {
      return res.status(400).json({ success: false, message: 'Total questions must be a positive number.' });
    }

    if (!Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > 100) {
      return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 100.' });
    }

    const subjectId = await resolveSubjectId(subject);

    const result = await pool.query(
      `INSERT INTO quizzes (user_id, subject_id, title, score, total_questions, status, image_url, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE))
       RETURNING id, user_id AS "userId", subject_id AS "subjectId", title, score,
                 total_questions AS "totalQuestions", status, image_url AS image, date`,
      [
        targetUserId,
        subjectId,
        normalizedTitle,
        normalizedScore,
        Math.round(normalizedTotalQuestions),
        normalizedStatus,
        image || null,
        date || null,
      ]
    );

    return res.status(201).json({ success: true, quiz: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create quiz.' });
  }
});

router.patch('/:targetId/quizzes/:quizId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { quizId } = req.params;

    if (String(targetUserId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update quizzes for this user.' });
    }

    const { status, score } = req.body;
    const updates = [];
    const values = [];

    if (status !== undefined) {
      const normalizedStatus = status === 'Finished' ? 'Finished' : 'Unfinished';
      values.push(normalizedStatus);
      updates.push(`status = $${values.length}`);
    }

    if (score !== undefined) {
      const normalizedScore = Number(score);
      if (!Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > 100) {
        return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 100.' });
      }

      values.push(normalizedScore);
      updates.push(`score = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    values.push(quizId);
    values.push(targetUserId);

    const result = await pool.query(
      `UPDATE quizzes
       SET ${updates.join(', ')}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING id, title, score, total_questions AS "totalQuestions", status, date`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    return res.json({ success: true, quiz: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update quiz.' });
  }
});

router.get('/:targetId/quizzes', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);

    const result = await pool.query(
      `SELECT
         q.id,
         q.title,
         q.score,
         q.total_questions AS "totalQuestions",
         q.status,
         q.date,
         COALESCE(q.image_url, s.image_url) AS image,
         s.name AS subject
       FROM quizzes q
       LEFT JOIN subjects s ON q.subject_id = s.id
       WHERE q.user_id = $1
       ORDER BY q.created_at DESC`,
      [targetUserId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:targetId/overview', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);

    const quizResult = await pool.query(
      `SELECT
         q.id,
         q.title,
         q.score,
         q.total_questions,
         q.status,
         q.date,
         q.created_at,
         COALESCE(s.name, 'General') AS subject,
         COALESCE(q.image_url, s.image_url) AS image
       FROM quizzes q
       LEFT JOIN subjects s ON q.subject_id = s.id
       WHERE q.user_id = $1
       ORDER BY q.date DESC, q.created_at DESC`,
      [targetUserId]
    );

    const quizzes = quizResult.rows;
    const finished = quizzes.filter((q) => q.status === 'Finished');

    const totalQuizzes = quizzes.length;
    const totalQuestions = quizzes.reduce((sum, q) => sum + Number(q.total_questions || 0), 0);
    const correctAnswers = quizzes.reduce(
      (sum, q) => sum + Math.round((Number(q.score || 0) / 100) * Number(q.total_questions || 0)),
      0
    );
    const wrongAnswers = Math.max(0, totalQuestions - correctAnswers);
    const partialAnswers = 0;
    const averageScore = finished.length
      ? Number((finished.reduce((sum, q) => sum + Number(q.score || 0), 0) / finished.length).toFixed(1))
      : 0;

    let currentStreak = 0;
    for (const quiz of quizzes) {
      if (quiz.status === 'Finished') {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const subjectMap = new Map();
    for (const quiz of quizzes) {
      const key = quiz.subject;
      const prev = subjectMap.get(key) || {
        name: key,
        scoreTotal: 0,
        scoreCount: 0,
        questions: 0,
        correct: 0,
        wrong: 0,
      };

      const questions = Number(quiz.total_questions || 0);
      const correct = Math.round((Number(quiz.score || 0) / 100) * questions);
      prev.questions += questions;
      prev.correct += correct;
      prev.wrong += Math.max(0, questions - correct);

      if (quiz.status === 'Finished') {
        prev.scoreTotal += Number(quiz.score || 0);
        prev.scoreCount += 1;
      }

      subjectMap.set(key, prev);
    }

    const subjects = Array.from(subjectMap.values()).map((subject) => ({
      name: subject.name,
      score: subject.scoreCount ? Math.round(subject.scoreTotal / subject.scoreCount) : 0,
      questions: subject.questions,
      correct: subject.correct,
      wrong: subject.wrong,
    }));

    const recentQuizzes = quizzes.slice(0, 5).map((quiz) => ({
      name: quiz.title,
      score: Number(quiz.score || 0),
      date: quiz.date,
      questions: Number(quiz.total_questions || 0),
      subject: quiz.subject,
      image: quiz.image,
      status: quiz.status,
    }));

    return res.json({
      totalQuizzes,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      partialAnswers,
      averageScore,
      totalTime: totalQuestions * 2,
      averageTimePerQuestion: totalQuestions ? Number(((totalQuestions * 2) / totalQuestions).toFixed(1)) : 0,
      currentStreak,
      bestStreak: currentStreak,
      subjects,
      recentQuizzes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:targetId/subjects', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);

    const result = await pool.query(
      `SELECT
         s.id,
         s.name,
         COUNT(q.id)::int AS quiz_count,
         COALESCE(AVG(CASE WHEN q.status = 'Finished' THEN q.score END), 0)::float AS avg_score
       FROM subjects s
       LEFT JOIN quizzes q ON q.subject_id = s.id AND q.user_id = $1
       GROUP BY s.id, s.name
       ORDER BY s.name ASC`,
      [targetUserId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:targetId/analysis/:subjectId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { subjectId } = req.params;

    const chapterResult = await pool.query(
      `SELECT
         c.id,
         c.name,
         COALESCE(ca.proficiency, 0)::int AS score,
         COALESCE(ca.questions_attempted, 0)::int AS questions,
         COALESCE(ca.correct_answers, 0)::int AS correct,
         GREATEST(COALESCE(ca.questions_attempted, 0) - COALESCE(ca.correct_answers, 0), 0)::int AS wrong,
         CASE WHEN COALESCE(ca.category, 'Average') = 'Strong' THEN 'up' ELSE 'down' END AS trend,
         (COALESCE(ca.questions_attempted, 0) * 2)::int AS "timeSpent"
       FROM chapters c
       LEFT JOIN chapter_analytics ca ON ca.chapter_id = c.id AND ca.user_id = $1
       WHERE c.subject_id = $2
       ORDER BY c.name ASC`,
      [targetUserId, subjectId]
    );

    let chapters = chapterResult.rows;

    if (chapters.length === 0) {
      const quizSummary = await pool.query(
        `SELECT
           COALESCE(AVG(score), 0)::float AS avg_score,
           COALESCE(SUM(total_questions), 0)::int AS total_questions
         FROM quizzes
         WHERE user_id = $1 AND subject_id = $2`,
        [targetUserId, subjectId]
      );

      const avgScore = Number(quizSummary.rows[0]?.avg_score || 0);
      const totalQuestions = Number(quizSummary.rows[0]?.total_questions || 0);
      const estimatedCorrect = Math.round((avgScore / 100) * totalQuestions);

      if (totalQuestions > 0) {
        chapters = [
          {
            id: `overall-${subjectId}`,
            name: 'Overall Performance',
            score: Math.round(avgScore),
            questions: totalQuestions,
            correct: estimatedCorrect,
            wrong: Math.max(0, totalQuestions - estimatedCorrect),
            trend: avgScore >= 70 ? 'up' : 'down',
            timeSpent: totalQuestions * 2,
          },
        ];
      }
    }

    const overallScore = chapters.length
      ? Math.round(chapters.reduce((sum, row) => sum + Number(row.score || 0), 0) / chapters.length)
      : 0;

    const strongAreas = chapters.filter((row) => Number(row.score || 0) >= 80).map((row) => row.name).slice(0, 4);
    const weakAreas = chapters.filter((row) => Number(row.score || 0) < 60).map((row) => row.name).slice(0, 4);

    return res.json({
      chapters,
      performance: {
        overallScore,
        strongAreas,
        weakAreas,
        questionTypes: {
          'Multiple Choice': chapters.length ? overallScore : 0,
          'Problem Solving': chapters.length ? Math.max(0, overallScore - 8) : 0,
          'True/False': chapters.length ? Math.min(100, overallScore + 5) : 0,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/seed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO quizzes (user_id, title, score, total_questions, status)
       VALUES
         ($1, 'Calculus Midterm', 85, 20, 'Finished'),
         ($1, 'Organic Chemistry Basics', 0, 15, 'Unfinished')`,
      [userId]
    );

    return res.json({ success: true, message: 'Sample quizzes inserted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to seed' });
  }
});

export default router;
