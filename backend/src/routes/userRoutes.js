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

const CANONICAL_SUBJECT_NAMES = ['Mathematics', 'Science', 'History', 'Literature', 'Geography'];

const SUBJECT_BLUEPRINTS = {
  Mathematics: {
    categories: {
      Algebra: ['Linear Equations', 'Quadratic Expressions', 'Polynomials'],
      Geometry: ['Triangles', 'Circles', 'Coordinate Geometry'],
      Calculus: ['Limits', 'Derivatives', 'Integrals'],
    },
  },
  Science: {
    categories: {
      Physics: ['Motion and Forces', 'Energy', 'Waves and Optics'],
      Chemistry: ['Atoms and Molecules', 'Chemical Reactions', 'Acids and Bases'],
      Biology: ['Cell Structure', 'Genetics', 'Ecosystems'],
    },
  },
  History: {
    categories: {
      Ancient: ['Mesopotamia', 'Egypt', 'Ancient Greece'],
      Medieval: ['Feudalism', 'Crusades', 'Renaissance'],
      Modern: ['Industrial Revolution', 'World Wars', 'Cold War'],
    },
  },
  Literature: {
    categories: {
      Fiction: ['Narrative Voice', 'Plot Structure', 'Character Development'],
      Poetry: ['Imagery', 'Meter and Rhythm', 'Figurative Language'],
      Drama: ['Dialogue', 'Conflict', 'Stagecraft'],
    },
  },
  Geography: {
    categories: {
      Physical: ['Landforms', 'Climate Systems', 'Natural Resources'],
      Human: ['Population', 'Urbanization', 'Migration'],
      Economic: ['Trade Networks', 'Development', 'Globalization'],
    },
  },
  Chemistry: {
    categories: {
      Fundamentals: ['Atomic Structure', 'Periodic Table', 'Chemical Bonding'],
      Reactions: ['Stoichiometry', 'Reaction Rates', 'Equilibrium'],
      Applications: ['Organic Chemistry', 'Electrochemistry', 'Analytical Methods'],
    },
  },
  Physics: {
    categories: {
      Mechanics: ['Kinematics', 'Dynamics', 'Momentum'],
      Thermodynamics: ['Heat Transfer', 'Laws of Thermodynamics', 'Engines'],
      Electromagnetism: ['Electric Fields', 'Circuits', 'Magnetism'],
    },
  },
  English: {
    categories: {
      Grammar: ['Sentence Structure', 'Tenses', 'Punctuation'],
      Reading: ['Main Idea', 'Inference', 'Context Clues'],
      Writing: ['Essay Structure', 'Argumentation', 'Revision'],
    },
  },
};

const SUBJECT_FALLBACK_BLUEPRINT = {
  categories: {
    Foundations: ['Core Concepts', 'Key Terms', 'Applied Practice'],
    Intermediate: ['Analysis', 'Interpretation', 'Problem Solving'],
    Advanced: ['Synthesis', 'Evaluation', 'Real-world Scenarios'],
  },
};

const QUESTION_STEMS = [
  'Which statement best describes the main principle of {subcategory} in {subject}?',
  'When studying {subcategory}, which approach is most accurate in {subject}?',
  'Which option is the strongest example of applying {subcategory} in {subject}?',
  'What is the most reliable way to reason through a {subcategory} problem in {subject}?',
  'In {subject}, why is {subcategory} considered an important topic?',
];

const OPTION_BUILDERS = [
  {
    correctIndex: 0,
    build: (subject, subcategory) => [
      `It uses core ${subcategory} ideas to solve ${subject.toLowerCase()} problems step by step.`,
      `It ignores evidence and depends only on memorization.`,
      `It avoids concepts and focuses only on random guessing.`,
      `It is unrelated to practical ${subject.toLowerCase()} contexts.`,
    ],
  },
  {
    correctIndex: 1,
    build: (subject, subcategory) => [
      `It removes context to make answers simpler but less accurate.`,
      `It links definitions, reasoning, and examples in ${subcategory} to reach valid conclusions.`,
      `It assumes every question has the same pattern regardless of topic.`,
      `It avoids checking results because first attempts are always correct.`,
    ],
  },
  {
    correctIndex: 2,
    build: (subject, subcategory) => [
      `It treats ${subcategory} as isolated facts with no relationships.`,
      `It replaces understanding with repeated keyword matching.`,
      `It connects concepts in ${subcategory} with prior knowledge to justify answers clearly.`,
      `It relies on speed only and ignores accuracy.`,
    ],
  },
  {
    correctIndex: 3,
    build: (subject, subcategory) => [
      `It discourages reviewing mistakes after practice sessions.`,
      `It focuses on one example and applies it to every case.`,
      `It avoids comparing options before selecting an answer.`,
      `It evaluates evidence, eliminates weak choices, and confirms logic in ${subcategory}.`,
    ],
  },
];

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

function getSubjectBlueprint(subjectName) {
  return SUBJECT_BLUEPRINTS[subjectName] || SUBJECT_FALLBACK_BLUEPRINT;
}

function getCategoryEntries(subjectName) {
  const blueprint = getSubjectBlueprint(subjectName);
  return Object.entries(blueprint.categories).flatMap(([category, subcategories]) =>
    subcategories.map((subcategory) => ({ category, subcategory }))
  );
}

function generateQuestionDrafts(subjectName, count = 50) {
  const categoryEntries = getCategoryEntries(subjectName);
  const drafts = [];

  for (let i = 0; i < count; i += 1) {
    const categoryEntry = categoryEntries[i % categoryEntries.length];
    const stem = QUESTION_STEMS[i % QUESTION_STEMS.length]
      .replaceAll('{subject}', subjectName)
      .replaceAll('{subcategory}', categoryEntry.subcategory);

    const optionBuilder = OPTION_BUILDERS[i % OPTION_BUILDERS.length];
    const optionTexts = optionBuilder.build(subjectName, categoryEntry.subcategory);
    const correctAnswer = optionTexts[optionBuilder.correctIndex];

    drafts.push({
      questionText: `${stem} (${categoryEntry.category} #${i + 1})`,
      questionType: 'single_choice',
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      explanation: `This checks your understanding of ${categoryEntry.subcategory} in ${subjectName}.`,
      points: 1,
      category: categoryEntry.category,
      subcategory: categoryEntry.subcategory,
      options: optionTexts,
      correctIndex: optionBuilder.correctIndex,
      correctAnswer,
    });
  }

  return drafts;
}

async function ensureQuestionInfrastructure() {
  await pool.query(
    `ALTER TABLE questions
       ADD COLUMN IF NOT EXISTS category VARCHAR(100),
       ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS question_bookmarks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, question_id)
    )`
  );

  await pool.query('CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user_id ON question_bookmarks(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_questions_subject_category ON questions(question_bank_id, category, subcategory)');
}

async function ensureAttemptTimingInfrastructure() {
  await pool.query(
    `ALTER TABLE quizzes
       ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS is_timed BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0)`
  );

  await pool.query(
    `ALTER TABLE quizzes
       DROP CONSTRAINT IF EXISTS quizzes_status_check,
       ADD CONSTRAINT quizzes_status_check
       CHECK (status IN ('Finished', 'Unfinished', 'Timed Out'))`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS user_question_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
      selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
      answer_text TEXT,
      is_correct BOOLEAN,
      time_spent_seconds INTEGER CHECK (time_spent_seconds >= 0),
      attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, quiz_id, question_id)
    )`
  );

  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_user_question_attempts_user_quiz ON user_question_attempts(user_id, quiz_id)`
  );
}

function normalizeQuizStatus(statusValue) {
  if (statusValue === 'Finished' || statusValue === 'Timed Out') {
    return statusValue;
  }

  return 'Unfinished';
}

async function ensureQuestionPoolForSubject(subjectId, subjectName) {
  const bankResult = await pool.query(
    `INSERT INTO question_banks (subject_id, title, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (subject_id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [subjectId, `${subjectName} Question Bank`, `Auto-generated bank for ${subjectName}`]
  );

  const bankId = bankResult.rows[0].id;
  const questionCountResult = await pool.query(
    'SELECT COUNT(*)::int AS count FROM questions WHERE question_bank_id = $1 AND is_active = TRUE',
    [bankId]
  );
  const currentCount = Number(questionCountResult.rows[0]?.count || 0);

  if (currentCount >= 50) {
    return bankId;
  }

  const drafts = generateQuestionDrafts(subjectName, 50 - currentCount);
  for (const draft of drafts) {
    const questionResult = await pool.query(
      `INSERT INTO questions (
         question_bank_id,
         question_text,
         question_type,
         difficulty,
         explanation,
         points,
         category,
         subcategory,
         is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
       RETURNING id`,
      [
        bankId,
        draft.questionText,
        draft.questionType,
        draft.difficulty,
        draft.explanation,
        draft.points,
        draft.category,
        draft.subcategory,
      ]
    );

    const questionId = questionResult.rows[0].id;
    const optionInserts = draft.options.map((optionText, index) =>
      pool.query(
        `INSERT INTO question_options (question_id, option_text, is_correct, option_order)
         VALUES ($1, $2, $3, $4)`,
        [questionId, optionText, index === draft.correctIndex, index + 1]
      )
    );
    await Promise.all(optionInserts);
  }

  return bankId;
}

async function selectQuestionsForQuiz({
  subjectId,
  userId,
  totalQuestions,
  examMode,
  category,
  subcategory,
}) {
  let questionIds = [];

  async function appendQuestions({
    applyMode,
    applyCategory,
    applySubcategory,
  }) {
    const remaining = totalQuestions - questionIds.length;
    if (remaining <= 0) {
      return;
    }

    const values = [subjectId];
    const filters = ['qb.subject_id = $1', 'q.is_active = TRUE'];
    let userIdParamIndex = null;

    if (applyCategory && category) {
      values.push(category);
      filters.push(`q.category = $${values.length}`);
    }

    if (applySubcategory && subcategory) {
      values.push(subcategory);
      filters.push(`q.subcategory = $${values.length}`);
    }

    if (applyMode) {
      values.push(userId);
      userIdParamIndex = values.length;

      if (examMode === 'solved') {
        filters.push(
          `EXISTS (
             SELECT 1
             FROM user_question_attempts uqa
             WHERE uqa.user_id = $${userIdParamIndex}::uuid AND uqa.question_id = q.id
           )`
        );
      } else if (examMode === 'new') {
        filters.push(
          `NOT EXISTS (
             SELECT 1
             FROM user_question_attempts uqa
             WHERE uqa.user_id = $${userIdParamIndex}::uuid AND uqa.question_id = q.id
           )`
        );
      } else if (examMode === 'bookmarked') {
        filters.push(
          `EXISTS (
             SELECT 1
             FROM question_bookmarks qbkm
             WHERE qbkm.user_id = $${userIdParamIndex}::uuid AND qbkm.question_id = q.id
           )`
        );
      }
    }

    if (questionIds.length > 0) {
      values.push(questionIds);
      filters.push(`q.id <> ALL($${values.length}::uuid[])`);
    }

    values.push(remaining);
    const result = await pool.query(
      `SELECT q.id
       FROM questions q
       JOIN question_banks qb ON qb.id = q.question_bank_id
       WHERE ${filters.join(' AND ')}
       ORDER BY RANDOM()
       LIMIT $${values.length}`,
      values
    );

    questionIds = questionIds.concat(result.rows.map((row) => row.id));
  }

  // 1) Keep the exact requested filters.
  await appendQuestions({ applyMode: true, applyCategory: true, applySubcategory: true });

  // 2) Keep category/subcategory but relax mode.
  await appendQuestions({ applyMode: false, applyCategory: true, applySubcategory: true });

  // 3) Keep category only.
  await appendQuestions({ applyMode: false, applyCategory: true, applySubcategory: false });

  // 4) Fill from full subject pool.
  await appendQuestions({ applyMode: false, applyCategory: false, applySubcategory: false });

  return questionIds;
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
      examMode = 'all',
      category,
      subcategory,
      status = 'Unfinished',
      score = 0,
      isTimed = false,
      timeLimitMinutes,
      date,
      image,
    } = req.body;

    const normalizedTitle = String(title || '').trim();
    const normalizedStatus = normalizeQuizStatus(status);
    const normalizedTotalQuestions = Number(totalQuestions);
    const normalizedScore = Number(score || 0);
    const normalizedIsTimed = Boolean(isTimed);
    const normalizedTimeLimitMinutes = Number(timeLimitMinutes);
    const normalizedTimeLimitSeconds = normalizedIsTimed
      ? Math.round((Number.isFinite(normalizedTimeLimitMinutes) ? normalizedTimeLimitMinutes : 30) * 60)
      : null;

    if (!normalizedTitle) {
      return res.status(400).json({ success: false, message: 'Quiz title is required.' });
    }

    if (!Number.isFinite(normalizedTotalQuestions) || normalizedTotalQuestions <= 0) {
      return res.status(400).json({ success: false, message: 'Total questions must be a positive number.' });
    }

    if (!Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > 100) {
      return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 100.' });
    }

    await ensureQuestionInfrastructure();
    await ensureAttemptTimingInfrastructure();

    const subjectId = await resolveSubjectId(subject);
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }

    const subjectNameResult = await pool.query('SELECT name FROM subjects WHERE id = $1 LIMIT 1', [subjectId]);
    const subjectName = subjectNameResult.rows[0]?.name || String(subject);
    await ensureQuestionPoolForSubject(subjectId, subjectName);

    const selectedQuestionIds = await selectQuestionsForQuiz({
      subjectId,
      userId: targetUserId,
      totalQuestions: Math.round(normalizedTotalQuestions),
      examMode,
      category: category ? String(category).trim() : '',
      subcategory: subcategory ? String(subcategory).trim() : '',
    });

    if (selectedQuestionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions available for this subject and filter selection yet.',
      });
    }

    const result = await pool.query(
      `INSERT INTO quizzes (
         user_id,
         subject_id,
         title,
         score,
         total_questions,
         status,
         image_url,
         is_timed,
         time_limit_seconds,
         date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::date, CURRENT_DATE))
       RETURNING id, user_id AS "userId", subject_id AS "subjectId", title, score,
                 total_questions AS "totalQuestions", status, image_url AS image,
                 is_timed AS "isTimed", time_limit_seconds AS "timeLimitSeconds", date`,
      [
        targetUserId,
        subjectId,
        normalizedTitle,
        normalizedScore,
        selectedQuestionIds.length,
        normalizedStatus,
        image || null,
        normalizedIsTimed,
        normalizedTimeLimitSeconds,
        date || null,
      ]
    );

    const quizId = result.rows[0].id;
    const quizQuestionInserts = selectedQuestionIds.map((questionId, index) =>
      pool.query(
        `INSERT INTO quiz_questions (quiz_id, question_id, question_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (quiz_id, question_id) DO NOTHING`,
        [quizId, questionId, index + 1]
      )
    );
    await Promise.all(quizQuestionInserts);

    return res.status(201).json({ success: true, quiz: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create quiz.' });
  }
});

router.get('/:targetId/quizzes/:quizId/questions', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { quizId } = req.params;

    const questionsResult = await pool.query(
      `SELECT
         qq.question_order,
         q.id,
         q.question_text AS question,
         q.explanation,
         q.category,
         q.subcategory,
         COALESCE(s.name, 'General') AS subject,
         EXISTS (
           SELECT 1
           FROM question_bookmarks qbkm
           WHERE qbkm.user_id = $2 AND qbkm.question_id = q.id
         ) AS is_bookmarked,
         qu.is_timed,
         qu.time_limit_seconds
       FROM quiz_questions qq
       JOIN quizzes qu ON qu.id = qq.quiz_id
       JOIN questions q ON q.id = qq.question_id
       LEFT JOIN question_banks qb ON qb.id = q.question_bank_id
       LEFT JOIN subjects s ON s.id = qb.subject_id
       WHERE qq.quiz_id = $1 AND qu.user_id = $2
       ORDER BY qq.question_order ASC`,
      [quizId, targetUserId]
    );

    const questionRows = questionsResult.rows;
    if (questionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found for this quiz.' });
    }

    const questionIds = questionRows.map((row) => row.id);
    const optionsResult = await pool.query(
      `SELECT
         qo.question_id,
         qo.id,
         qo.option_text,
         qo.is_correct,
         qo.option_order
       FROM question_options qo
       WHERE qo.question_id = ANY($1::uuid[])
       ORDER BY qo.question_id, qo.option_order ASC`,
      [questionIds]
    );

    const optionsByQuestion = new Map();
    for (const optionRow of optionsResult.rows) {
      const existing = optionsByQuestion.get(optionRow.question_id) || [];
      existing.push(optionRow);
      optionsByQuestion.set(optionRow.question_id, existing);
    }

    const questions = questionRows.map((row) => {
      const options = optionsByQuestion.get(row.id) || [];
      const correctOption = options.find((option) => option.is_correct);

      return {
        id: row.id,
        question: row.question,
        choices: options.map((option) => option.option_text),
        correctAnswer: correctOption?.option_text || null,
        explanation: row.explanation,
        category: row.category,
        subcategory: row.subcategory,
        subject: row.subject,
        isBookmarked: row.is_bookmarked,
      };
    });

    const quizMeta = {
      isTimed: Boolean(questionRows[0]?.is_timed),
      timeLimitSeconds: questionRows[0]?.time_limit_seconds ? Number(questionRows[0].time_limit_seconds) : null,
    };

    return res.json({ success: true, quiz: quizMeta, questions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz questions.' });
  }
});

router.get('/:targetId/quizzes/:quizId/review', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { quizId } = req.params;

    const quizResult = await pool.query(
      `SELECT
         q.id,
         q.title,
         q.score,
         q.total_questions AS "totalQuestions",
         q.status,
         q.date,
         COALESCE(q.image_url, s.image_url) AS image,
         COALESCE(s.name, 'General') AS subject
       FROM quizzes q
       LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE q.id = $1 AND q.user_id = $2
       LIMIT 1`,
      [quizId, targetUserId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const questionRowsResult = await pool.query(
      `SELECT
         qq.question_order,
         q.id,
         q.question_text AS question,
         q.explanation,
         q.category,
         q.subcategory,
         uqa.answer_text AS selected_answer,
         uqa.is_correct,
         COALESCE(uqa.time_spent_seconds, 0) AS time_spent_seconds
       FROM quiz_questions qq
       JOIN quizzes qu ON qu.id = qq.quiz_id
       JOIN questions q ON q.id = qq.question_id
       LEFT JOIN user_question_attempts uqa
         ON uqa.quiz_id = qq.quiz_id
        AND uqa.question_id = qq.question_id
        AND uqa.user_id = $2
       WHERE qq.quiz_id = $1 AND qu.user_id = $2
       ORDER BY qq.question_order ASC`,
      [quizId, targetUserId]
    );

    const questionRows = questionRowsResult.rows;

    if (questionRows.length === 0) {
      return res.json({ success: true, quiz: quizResult.rows[0], questions: [] });
    }

    const questionIds = questionRows.map((row) => row.id);
    const optionsResult = await pool.query(
      `SELECT
         qo.question_id,
         qo.option_text,
         qo.is_correct,
         qo.option_order
       FROM question_options qo
       WHERE qo.question_id = ANY($1::uuid[])
       ORDER BY qo.question_id, qo.option_order ASC`,
      [questionIds]
    );

    const optionsByQuestion = new Map();
    for (const optionRow of optionsResult.rows) {
      const existing = optionsByQuestion.get(optionRow.question_id) || [];
      existing.push(optionRow);
      optionsByQuestion.set(optionRow.question_id, existing);
    }

    const reviewQuestions = questionRows.map((row) => {
      const options = optionsByQuestion.get(row.id) || [];
      const correctOption = options.find((option) => option.is_correct);

      return {
        id: row.id,
        question: row.question,
        choices: options.map((option) => option.option_text),
        correctAnswer: correctOption?.option_text || null,
        selectedAnswer: row.selected_answer || null,
        isCorrect: row.is_correct,
        explanation: row.explanation,
        category: row.category,
        subcategory: row.subcategory,
        timeSpentSeconds: Number(row.time_spent_seconds || 0),
      };
    });

    return res.json({
      success: true,
      quiz: quizResult.rows[0],
      questions: reviewQuestions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz review.' });
  }
});

router.post('/:targetId/questions/:questionId/bookmark', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { questionId } = req.params;
    const { bookmarked } = req.body;

    if (String(targetUserId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify bookmarks for this user.' });
    }

    await ensureQuestionInfrastructure();

    if (bookmarked === false) {
      await pool.query('DELETE FROM question_bookmarks WHERE user_id = $1 AND question_id = $2', [targetUserId, questionId]);
      return res.json({ success: true, bookmarked: false });
    }

    await pool.query(
      `INSERT INTO question_bookmarks (user_id, question_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, question_id) DO NOTHING`,
      [targetUserId, questionId]
    );

    return res.json({ success: true, bookmarked: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update bookmark.' });
  }
});

router.get('/:targetId/bookmarks', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { subject, category, subcategory } = req.query;

    const values = [targetUserId];
    const filters = ['qbkm.user_id = $1'];

    if (subject) {
      values.push(String(subject));
      filters.push(`LOWER(s.name) = LOWER($${values.length})`);
    }

    if (category) {
      values.push(String(category));
      filters.push(`LOWER(COALESCE(q.category, '')) = LOWER($${values.length})`);
    }

    if (subcategory) {
      values.push(String(subcategory));
      filters.push(`LOWER(COALESCE(q.subcategory, '')) = LOWER($${values.length})`);
    }

    const result = await pool.query(
      `SELECT
         q.id,
         q.question_text AS question,
         q.explanation,
         q.category,
         q.subcategory,
         COALESCE(s.name, 'General') AS subject,
         qbkm.created_at AS bookmarked_at
       FROM question_bookmarks qbkm
       JOIN questions q ON q.id = qbkm.question_id
       LEFT JOIN question_banks qb ON qb.id = q.question_bank_id
       LEFT JOIN subjects s ON s.id = qb.subject_id
       WHERE ${filters.join(' AND ')}
       ORDER BY qbkm.created_at DESC`,
      values
    );

    return res.json({ success: true, bookmarks: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookmarked questions.' });
  }
});

router.patch('/:targetId/quizzes/:quizId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);
    const { quizId } = req.params;

    if (String(targetUserId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update quizzes for this user.' });
    }

    await ensureAttemptTimingInfrastructure();

    const { status, score, durationSeconds, attempts } = req.body;
    const updates = [];
    const values = [];

    if (status !== undefined) {
      const normalizedStatus = normalizeQuizStatus(status);
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

    if (durationSeconds !== undefined) {
      const normalizedDuration = Number(durationSeconds);
      if (!Number.isFinite(normalizedDuration) || normalizedDuration < 0) {
        return res.status(400).json({ success: false, message: 'Duration must be a non-negative number of seconds.' });
      }

      values.push(Math.round(normalizedDuration));
      updates.push(`duration_seconds = $${values.length}`);
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

    const shouldMarkUnansweredWrong = status === 'Timed Out';

    if (Array.isArray(attempts) && attempts.length > 0) {
      const quizQuestionsResult = await pool.query(
        `SELECT qq.question_id
         FROM quiz_questions qq
         JOIN quizzes qu ON qu.id = qq.quiz_id
         WHERE qq.quiz_id = $1 AND qu.user_id = $2`,
        [quizId, targetUserId]
      );

      const validQuestionIds = new Set(quizQuestionsResult.rows.map((row) => row.question_id));

      for (const attempt of attempts) {
        const questionId = String(attempt?.questionId || '').trim();
        if (!questionId || !validQuestionIds.has(questionId)) {
          continue;
        }

        const selectedAnswer = String(attempt?.selectedAnswer || '').trim();
        const hasSelectedAnswer = Boolean(selectedAnswer);
        const rawTimeSpent = Number(attempt?.timeSpentSeconds || 0);
        const timeSpentSeconds = Number.isFinite(rawTimeSpent) && rawTimeSpent > 0
          ? Math.round(rawTimeSpent)
          : 0;

        let selectedOptionId = null;
        let isCorrect = shouldMarkUnansweredWrong && !hasSelectedAnswer ? false : null;

        if (hasSelectedAnswer) {
          const optionResult = await pool.query(
            `SELECT id, is_correct
             FROM question_options
             WHERE question_id = $1 AND option_text = $2
             LIMIT 1`,
            [questionId, selectedAnswer]
          );

          selectedOptionId = optionResult.rows[0]?.id || null;
          isCorrect = optionResult.rows[0]?.is_correct ?? null;
        }

        await pool.query(
          `INSERT INTO user_question_attempts (
             user_id,
             quiz_id,
             question_id,
             selected_option_id,
             answer_text,
             is_correct,
             time_spent_seconds,
             attempted_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, quiz_id, question_id)
           DO UPDATE SET
             selected_option_id = EXCLUDED.selected_option_id,
             answer_text = EXCLUDED.answer_text,
             is_correct = EXCLUDED.is_correct,
             time_spent_seconds = EXCLUDED.time_spent_seconds,
             attempted_at = CURRENT_TIMESTAMP`,
          [
            targetUserId,
            quizId,
            questionId,
            selectedOptionId,
            hasSelectedAnswer ? selectedAnswer : null,
            isCorrect,
            timeSpentSeconds,
          ]
        );
      }
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
        q.is_timed AS "isTimed",
        q.time_limit_seconds AS "timeLimitSeconds",
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

    await ensureAttemptTimingInfrastructure();

    const quizResult = await pool.query(
      `SELECT
         q.id,
         q.title,
         q.score,
         q.total_questions,
         q.status,
         q.date,
         q.created_at,
         COALESCE(q.duration_seconds, 0) AS duration_seconds,
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
    const totalDurationSeconds = quizzes.reduce((sum, q) => sum + Number(q.duration_seconds || 0), 0);

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
      durationSeconds: Number(quiz.duration_seconds || 0),
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
      totalTime: Number((totalDurationSeconds / 60).toFixed(1)),
      averageTimePerQuestion: totalQuestions
        ? Number(((totalDurationSeconds / totalQuestions) / 60).toFixed(2))
        : 0,
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

    for (const subjectName of CANONICAL_SUBJECT_NAMES) {
      await pool.query(
        `INSERT INTO subjects (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [subjectName]
      );
    }

    const result = await pool.query(
      `SELECT
         s.id,
         s.name,
         COUNT(q.id)::int AS quiz_count,
         COALESCE(AVG(CASE WHEN q.status = 'Finished' THEN q.score END), 0)::float AS avg_score
       FROM subjects s
       LEFT JOIN quizzes q ON q.subject_id = s.id AND q.user_id = $1
       WHERE s.name = ANY($2::text[])
       GROUP BY s.id, s.name
       ORDER BY array_position($2::text[], s.name), s.name ASC`,
      [targetUserId, CANONICAL_SUBJECT_NAMES]
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

    await ensureAttemptTimingInfrastructure();

    const categoryResult = await pool.query(
      `WITH category_pool AS (
         SELECT
           COALESCE(NULLIF(q.category, ''), 'General') AS category,
           COUNT(*)::int AS pool_questions
         FROM questions q
         JOIN question_banks qb ON qb.id = q.question_bank_id
         WHERE qb.subject_id = $2 AND q.is_active = TRUE
         GROUP BY COALESCE(NULLIF(q.category, ''), 'General')
       ),
       category_usage AS (
         SELECT
           COALESCE(NULLIF(q.category, ''), 'General') AS category,
           COUNT(*)::int AS used_questions,
           COALESCE(AVG(qu.score), 0)::float AS avg_quiz_score
         FROM quizzes qu
         JOIN quiz_questions qq ON qq.quiz_id = qu.id
         JOIN questions q ON q.id = qq.question_id
         WHERE qu.user_id = $1 AND qu.subject_id = $2
         GROUP BY COALESCE(NULLIF(q.category, ''), 'General')
       ),
       category_attempts AS (
         SELECT
           COALESCE(NULLIF(q.category, ''), 'General') AS category,
           COUNT(*)::int AS attempts,
           COALESCE(SUM(CASE WHEN uqa.is_correct THEN 1 ELSE 0 END), 0)::int AS correct,
           COALESCE(SUM(COALESCE(uqa.time_spent_seconds, 0)), 0)::int AS time_spent_seconds
         FROM user_question_attempts uqa
         JOIN quizzes qu ON qu.id = uqa.quiz_id
         JOIN questions q ON q.id = uqa.question_id
         WHERE uqa.user_id = $1 AND qu.subject_id = $2
         GROUP BY COALESCE(NULLIF(q.category, ''), 'General')
       )
       SELECT
         cp.category AS name,
         cp.pool_questions,
         COALESCE(ca.attempts, cu.used_questions, 0)::int AS questions,
         COALESCE(ca.time_spent_seconds, 0)::int AS time_spent_seconds,
         COALESCE(
           ca.correct,
           ROUND((COALESCE(cu.avg_quiz_score, 0) / 100.0) * COALESCE(cu.used_questions, 0))::int,
           0
         )::int AS correct
       FROM category_pool cp
       LEFT JOIN category_usage cu ON cu.category = cp.category
       LEFT JOIN category_attempts ca ON ca.category = cp.category
       ORDER BY cp.category ASC`,
      [targetUserId, subjectId]
    );

    let chapters = categoryResult.rows.map((row) => {
      const questions = Number(row.questions || 0);
      const correct = Number(row.correct || 0);
      const wrong = Math.max(0, questions - correct);
      const score = questions > 0 ? Math.round((correct / questions) * 100) : 0;
      const timeSpentSeconds = Number(row.time_spent_seconds || 0);

      return {
        id: `category-${row.name.toLowerCase().replaceAll(/\s+/g, '-')}`,
        name: row.name,
        score,
        questions,
        correct,
        wrong,
        trend: score >= 70 ? 'up' : 'down',
        timeSpent: timeSpentSeconds,
      };
    });

    if (chapters.length === 0) {
      const quizSummary = await pool.query(
        `SELECT
           COALESCE(AVG(score), 0)::float AS avg_score,
           COALESCE(SUM(total_questions), 0)::int AS total_questions,
           COALESCE(SUM(duration_seconds), 0)::int AS total_duration_seconds
         FROM quizzes
         WHERE user_id = $1 AND subject_id = $2`,
        [targetUserId, subjectId]
      );

      const avgScore = Number(quizSummary.rows[0]?.avg_score || 0);
      const totalQuestions = Number(quizSummary.rows[0]?.total_questions || 0);
      const totalDurationSeconds = Number(quizSummary.rows[0]?.total_duration_seconds || 0);
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
            timeSpent: totalDurationSeconds,
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
        questionTypes: Object.fromEntries(
          chapters.map((categoryRow) => [categoryRow.name, categoryRow.score])
        ),
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
