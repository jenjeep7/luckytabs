import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';

// Get Firestore instance (Firebase Admin is already initialized in index.ts)
const db = getFirestore();

// Define the OpenAI API key as a secret
const openaiApiKey = defineSecret('OPENAI_API_KEY');

// Daily budget limit in USD
const DAILY_BUDGET_LIMIT = 5.00;

interface BoxData {
  id: string;
  name: string;
  price_per_ticket: number;
  ev: number;
  rtp: number;
  risk: number;
  p_win_next1: number;
  p_win_next5: number;
  p_top_next10: number;
}

interface AdvisorRequest {
  message: string;
  boxes: BoxData[];
}

interface AdvisorResponse {
  picks: Array<{
    box_id: string;
    rank: number;
    reason: string;
  }>;
  answer_markdown: string;
}

// Function to estimate and track token usage
async function trackUsage(inputTokens: number, outputTokens: number) {
  const today = new Date().toISOString().split('T')[0];
  const cost = (inputTokens / 1000000 * 0.60) + (outputTokens / 1000000 * 2.40);
  
  const usageRef = db.collection('api-usage').doc(today);
  
  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(usageRef);
      const currentData = doc.exists ? doc.data() : { totalCost: 0, totalRequests: 0 };
      
      transaction.set(usageRef, {
        totalCost: (currentData?.totalCost || 0) + cost,
        totalRequests: (currentData?.totalRequests || 0) + 1,
        lastUpdated: new Date()
      }, { merge: true });
    });
  } catch (error) {
    console.warn('Failed to track usage:', error);
  }
  
  return cost;
}

// Function to check if we're within budget
async function checkBudget(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const usageRef = db.collection('api-usage').doc(today);
  
  try {
    const doc = await usageRef.get();
    if (!doc.exists) return true;
    
    const data = doc.data();
    return (data?.totalCost || 0) < DAILY_BUDGET_LIMIT;
  } catch (error) {
    console.warn('Budget check failed:', error);
    return true; // Fail open
  }
}

export const boxAdvisor = onRequest(
  { 
    secrets: [openaiApiKey],
    cors: true 
  },
  async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { message, boxes }: AdvisorRequest = req.body;

      if (!message || !boxes || !Array.isArray(boxes)) {
        res.status(400).json({ error: 'Invalid request format' });
        return;
      }

      // Check daily budget limit
      const withinBudget = await checkBudget();
      if (!withinBudget) {
        res.json({
          picks: [],
          answerMarkdown: "I've reached my daily usage limit to keep costs controlled. Please try again tomorrow, or ask me a specific question I can answer with my built-in rules!"
        });
        return;
      }

      // Initialize OpenAI
      const openai = new OpenAI({ 
        apiKey: openaiApiKey.value()
      });

      // Cap the list to top 5 boxes and send minimal data to reduce tokens
      const topBoxes = boxes
        .sort((a, b) => b.ev - a.ev)
        .slice(0, 5)
        .map(box => ({
          id: box.id,
          name: box.name,
          price: box.price_per_ticket,
          ev: Number(box.ev.toFixed(2)),
          rtp: Number(box.rtp.toFixed(1)),
          risk: Number(box.risk.toFixed(2)),
          p1: Number(box.p_win_next1.toFixed(3)),
          p5: Number(box.p_win_next5.toFixed(3))
        }));

      const systemPrompt = `Pull-tab advisor. Use ONLY provided data. Return JSON: {picks:[{box_id,rank,reason}], answer_markdown}. Be concise. Always end with: "Play for fun only."`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Q: ${message}\nBoxes: ${JSON.stringify(topBoxes)}` }
        ],
        temperature: 0.2,
        max_tokens: 200 // Reduced from 600 to keep responses concise
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}') as AdvisorResponse;
      
      // Track usage for cost monitoring
      const usage = completion.usage;
      if (usage) {
        await trackUsage(usage.prompt_tokens, usage.completion_tokens);
      }
      
      res.json({
        picks: result.picks || [],
        answerMarkdown: result.answer_markdown || "I couldn't form a recommendation based on the available data."
      });

    } catch (error) {
      console.error('Box advisor error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        picks: [],
        answerMarkdown: "Sorry, I'm having trouble processing your request right now. Please try asking a specific question like 'Which box has the best odds?'"
      });
    }
  }
);