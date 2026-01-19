/**
 * CLI Q&A for PHYSICAL MODEL leaders
 *
 * - Reads precomputed JSON artifacts:
 *   - physical_lineage.json
 *   - physical_impact.json
 *   - physical_graph_insights.json
 * - Sends ONLY those facts to the LLM
 * - LLM answers in simple English (leader/manager friendly)
 * - LLM does NOT change the model or compute anything
 *
 * Usage:
 *   node cli-qa.js <fileId>
 */

import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import config from './src/config.js';
import { readJSON } from './src/utils/fileUtils.js';
import { chat, Initializellm, isLlmReady } from '../Phase-1/src/llm/llmService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg) {
  console.log(msg);
}

async function loadArtifactSafe(p, label) {
  try {
    const data = await readJSON(p);
    log(`✓ Loaded ${label} from ${p}`);
    return data;
  } catch {
    log(`⚠ ${label} not found or unreadable at ${p}`);
    return null;
  }
}

async function main() {
  const fileId = process.argv[2];
  if (!fileId) {
    console.error('Usage: node cli-qa.js <fileId>');
    process.exit(1);
  }

  log('');
  log(`📊 PHYSICAL MODEL Q&A CLI`);
  log(`File ID: ${fileId}`);
  log('');

  // Determine artifact paths (Phase-1 artifacts for this fileId)
  const baseDir = config.phase1ArtifactsDir;
  const physicalDir = path.join(baseDir, fileId, 'physical');

  const lineagePath = path.join(physicalDir, 'physical_lineage.json');
  const impactPath = path.join(physicalDir, 'physical_impact.json');
  const insightsPath = path.join(physicalDir, 'physical_graph_insights.json');

  const [lineage, impact, insights] = await Promise.all([
    loadArtifactSafe(lineagePath, 'Lineage'),
    loadArtifactSafe(impactPath, 'Impact'),
    loadArtifactSafe(insightsPath, 'Graph insights')
  ]);

  if (!lineage && !impact && !insights) {
    console.error('❌ No analysis artifacts found. Run generate-complete.js first.');
    process.exit(1);
  }

  // Initialize LLM once
  try {
    if (!isLlmReady()) {
      await Initializellm();
    }
  } catch (err) {
    console.error(`❌ LLM initialization failed: ${err.message}`);
    console.error('You can still inspect JSON artifacts manually in the physical folder.');
    process.exit(1);
  }

  log('');
  log('💬 Ask questions as a leader/manager, e.g.:');
  log('   - "Where did order.customer_id come from?"');
  log('   - "What happens if we drop the order table?"');
  log('   - "Is this schema production-ready?"');
  log('Type "exit" to quit.');
  log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Q> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const question = line.trim();
    if (!question || question.toLowerCase() === 'exit' || question.toLowerCase() === 'quit') {
      rl.close();
      return;
    }

    // Build safe, bounded context for LLM (no hardcoded patterns)
    const context = {
      fileId,
      lineage: lineage || undefined,
      impact: impact || undefined,
      insights: insights || undefined
    };

    const contextJson = JSON.stringify(context, null, 2);

    const systemPrompt = `
You are an enterprise data architecture assistant for EY.

You are given PRECOMPUTED JSON facts about a PHYSICAL DATA MODEL:

1) physical_lineage.json  → where each physical column came from
2) physical_impact.json   → which tables depend on which (PK/FK impact)
3) physical_graph_insights.json → health/risk checks for the physical model

CRITICAL RULES:
- You MUST answer as if speaking to a non-technical leader or manager.
- Use short, clear English explanations.
- ONLY use facts present in the JSON context the user provides.
- If something is not in the JSON, say "The system does not have that information."
- Do NOT invent tables, columns, constraints, or risks.
- Do NOT suggest changes to the model; just explain the current state.
- The JSON is the single source of truth. Never guess beyond it.
`;

    const userMessage = `
JSON FACTS:
${contextJson}

Leader's question:
${question}
`;

    try {
      console.log('\n…Thinking based on lineage, impact and graph insights…\n');

      const answer = await chat(userMessage, systemPrompt);
      const trimmed = (answer || '').trim();

      if (!trimmed) {
        console.log('');
        console.log('A> The system did not return a response. Please check the Ollama logs or try again.');
        console.log('');
      } else {
        console.log('');
        console.log(`A> ${trimmed}`);
        console.log('');
      }
    } catch (err) {
      console.error(`❌ LLM error: ${err.message}`);
    }

    rl.prompt();
  }).on('close', () => {
    console.log('\n👋 Done. Closing PHYSICAL MODEL Q&A CLI.');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});


