const express = require('express');
const router = express.Router();

const LLM_SERVER_URL = process.env.LLM_SERVER_URL || 'http://localhost:8000';
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

router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty transcript. Please provide a non-empty transcript for evaluation.',
      });
    }

    const prompt = EVALUATION_PROMPT + transcript;

    let evalResponse;
    try {
      evalResponse = await fetch(`${LLM_SERVER_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt,
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
          stop: ['</s>', '\n\n'],
        }),
        signal: AbortSignal.timeout(60000), // 60s timeout
      });
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({
          error: 'LLM evaluation timed out. The local model may be slow or unresponsive.',
        });
      }
      return res.status(503).json({
        error: `Cannot connect to LLM server at ${LLM_SERVER_URL}. Make sure llama.cpp is running. Start with: llama-server -m <model_path> --port 8000`,
      });
    }

    if (!evalResponse.ok) {
      return res.status(503).json({
        error: `LLM server error: ${evalResponse.statusText}`,
      });
    }

    const data = await evalResponse.json();
    const generatedText = data.response || '';

    // Extract JSON from response (handles both pure JSON and JSON inside markdown)
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({
        error: 'Failed to parse LLM response. Model returned invalid format.',
        debug: generatedText.substring(0, 200),
      });
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (
      !evaluation.scores ||
      typeof evaluation.scores.situation !== 'number' ||
      typeof evaluation.scores.task !== 'number' ||
      typeof evaluation.scores.action !== 'number' ||
      typeof evaluation.scores.result !== 'number' ||
      typeof evaluation.feedback !== 'string'
    ) {
      return res.status(500).json({
        error: 'Invalid evaluation structure from LLM.',
      });
    }

    // Ensure scores are in valid range
    const validateScore = (s) => Math.max(1, Math.min(5, Math.round(s)));
    evaluation.scores.situation = validateScore(evaluation.scores.situation);
    evaluation.scores.task = validateScore(evaluation.scores.task);
    evaluation.scores.action = validateScore(evaluation.scores.action);
    evaluation.scores.result = validateScore(evaluation.scores.result);

    res.json(evaluation);
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({
      error: 'Internal server error during evaluation.',
    });
  }
});

module.exports = router;
