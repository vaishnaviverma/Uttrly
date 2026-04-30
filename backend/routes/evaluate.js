const express = require('express');
const { promisify } = require('util');
const { execFile } = require('child_process');
const router = express.Router();

const execFileAsync = promisify(execFile);
const LLAMA_CLI_PATH = process.env.LLAMA_CLI_PATH || 'llama-cli';
const LLAMA_MODEL_PATH = process.env.LLAMA_MODEL_PATH;
const EVALUATION_PROMPT = `You are an expert interviewer evaluating a candidate's response using the STAR method (Situation, Task, Action, Result).

Given a transcript of someone's speaking practice response, score their answer on each dimension from 1-5:
- Situation: How well did they set the context? (1=vague, 5=crystal clear)
- Task: How well did they define the challenge/goal? (1=unclear, 5=very specific)
- Action: How well did they describe their actions/approach? (1=vague, 5=detailed & specific)
- Result: How well did they explain the outcome/impact? (1=missing, 5=quantified & impactful)

Respond with valid JSON in this exact format (no markdown, no code blocks, pure JSON):
{
  "scores": {
    "situation": <number 1-5>,
    "task": <number 1-5>,
    "action": <number 1-5>,
    "result": <number 1-5>
  },
  "feedback": "<constructive feedback explaining the scores and how to improve, 2-3 sentences>"
}

Transcript to evaluate:
`;

const extractJsonFromText = (text) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return text.slice(firstBrace, lastBrace + 1);
};

const normalizeEvaluation = (evaluation) => {
  if (
    !evaluation ||
    typeof evaluation !== 'object' ||
    !evaluation.scores ||
    typeof evaluation.scores.situation !== 'number' ||
    typeof evaluation.scores.task !== 'number' ||
    typeof evaluation.scores.action !== 'number' ||
    typeof evaluation.scores.result !== 'number' ||
    typeof evaluation.feedback !== 'string'
  ) {
    return null;
  }

  const validateScore = (score) => Math.max(1, Math.min(5, Math.round(score)));

  return {
    scores: {
      situation: validateScore(evaluation.scores.situation),
      task: validateScore(evaluation.scores.task),
      action: validateScore(evaluation.scores.action),
      result: validateScore(evaluation.scores.result),
    },
    feedback: evaluation.feedback.trim(),
  };
};

const evaluateWithHeuristics = (transcript) => {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const hasContext = /\b(when|during|while|at my|in my|context|situation)\b/i.test(transcript);
  const hasTask = /\b(goal|task|needed to|responsible for|challenge|objective)\b/i.test(transcript);
  const hasAction = /\b(i (?:did|implemented|built|created|analyzed|designed|communicated|led|managed|improved|solved|handled)|we (?:did|implemented|built|created|analyzed|designed|communicated|led|managed|improved|solved|handled))\b/i.test(transcript);
  const hasResult = /\b(result|outcome|impact|improved|increased|reduced|saved|achieved|led to|therefore|because of that|%|percent)\b/i.test(transcript);
  const hasNumbers = /\b\d+(?:\.\d+)?%?\b/.test(transcript);

  const clampScore = (score) => Math.max(1, Math.min(5, score));

  const scores = {
    situation: clampScore((hasContext ? 3 : 1) + (wordCount > 80 ? 1 : 0) + (wordCount > 140 ? 1 : 0)),
    task: clampScore((hasTask ? 3 : 1) + (wordCount > 70 ? 1 : 0)),
    action: clampScore((hasAction ? 3 : 1) + (wordCount > 90 ? 1 : 0) + (wordCount > 160 ? 1 : 0)),
    result: clampScore((hasResult ? 3 : 1) + (hasNumbers ? 1 : 0) + (wordCount > 100 ? 1 : 0)),
  };

  const feedbackParts = [];

  if (!hasContext) {
    feedbackParts.push('Add a clearer situation or context so the listener knows what was happening.');
  }
  if (!hasTask) {
    feedbackParts.push('State the goal or challenge more explicitly.');
  }
  if (!hasAction) {
    feedbackParts.push('Describe your actions in more concrete detail.');
  }
  if (!hasResult) {
    feedbackParts.push('Close with the outcome or impact, ideally with numbers when possible.');
  }

  const feedback = feedbackParts.length > 0
    ? feedbackParts.join(' ')
    : 'Strong STAR structure overall. Keep the response concise while preserving the context, your actions, and the result.';

  return {
    scores,
    feedback,
    source: 'heuristic',
  };
};

router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty transcript. Please provide a non-empty transcript for evaluation.',
      });
    }

    const prompt = EVALUATION_PROMPT + transcript;

    if (!LLAMA_MODEL_PATH) {
      return res.json(evaluateWithHeuristics(transcript));
    }

    let stdout;
    try {
      const result = await execFileAsync(
        LLAMA_CLI_PATH,
        [
          '-m',
          LLAMA_MODEL_PATH,
          '-p',
          prompt,
          '-n',
          '256',
          '--temp',
          '0.2',
          '--top-p',
          '0.9',
          '--log-disable',
          '--no-display-prompt',
        ],
        {
          timeout: 60000,
          maxBuffer: 1024 * 1024,
        }
      );

      stdout = result.stdout || '';
    } catch (cliError) {
      if (cliError.killed || cliError.signal === 'SIGTERM') {
        return res.json(evaluateWithHeuristics(transcript));
      }

      if (cliError.code === 'ENOENT') {
        return res.json(evaluateWithHeuristics(transcript));
      }

      return res.json(evaluateWithHeuristics(transcript));
    }

    const jsonText = extractJsonFromText(stdout);
    if (!jsonText) {
      return res.status(500).json({
        error: 'Failed to parse LLM response. Model returned invalid format.',
        debug: stdout.substring(0, 200),
      });
    }

    let parsedEvaluation;
    try {
      parsedEvaluation = JSON.parse(jsonText);
    } catch (parseError) {
      return res.status(500).json({
        error: 'Failed to parse LLM response as JSON.',
        debug: jsonText.substring(0, 200),
      });
    }

    const evaluation = normalizeEvaluation(parsedEvaluation);
    if (!evaluation) {
      return res.status(500).json({
        error: 'Invalid evaluation structure from LLM.',
      });
    }

    res.json(evaluation);
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({
      error: 'Internal server error during evaluation.',
    });
  }
});

module.exports = router;
