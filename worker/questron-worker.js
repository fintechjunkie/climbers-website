/*
  Questron Worker — Cloudflare Worker proxy for Anthropic Claude API.

  SETUP:
  1. Create a free Cloudflare account at https://dash.cloudflare.com/sign-up
  2. Go to "Workers & Pages" → "Create" → "Create Worker"
  3. Give it a name (e.g., "questron-worker") and click "Deploy"
  4. Click "Edit Code" and replace ALL the code with this entire file
  5. Click "Deploy" again
  6. Go to the worker's "Settings" → "Variables and Secrets"
  7. Click "+ Add" under "Secrets", name it ANTHROPIC_API_KEY, paste your Anthropic API key
  8. Copy the worker URL (e.g., https://questron-worker.your-name.workers.dev)
  9. Paste that URL into the Questron tab in your Climbers admin panel

  Get an Anthropic API key at: https://console.anthropic.com
*/

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();

      // === OATH LORD RESPONSE ===
      if (body.type === 'oath-lord') {
        const { lordName, lordTitle, lordAug, lordAugDesc, lordAlignment, lordVoice, lordAlliances, lordEnemies, situation } = body;

        const systemPrompt = `You are writing a short, in-character response from ${lordName}, ${lordTitle} — one of the ten Oath Lords of Haven City.

ABOUT ${lordName}:
Augmentation: ${lordAug} — ${lordAugDesc}
Alignment: ${lordAlignment}
Voice: ${lordVoice}
Known alliances: ${lordAlliances}
Known enemies: ${lordEnemies}

THE SITUATION:
${situation}

Write ${lordName}'s response to this situation in 150-200 words. Stay entirely in their voice and character. Show their alignment through their priorities, not through labels. Do not reference game mechanics or alignment terminology. Write in third person narration with direct speech — describe how they respond and what they say.

The response should feel like a scene fragment from the story. It should reveal something true about who this Oath Lord is. It should not be a speech — it should be a moment.

No em dashes. Present tense. Specific and grounded.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 600,
            system: systemPrompt,
            messages: [{ role: 'user', content: 'Write the response.' }]
          })
        });

        if (!response.ok) {
          const err = await response.text();
          console.error('Anthropic API error:', err);
          return new Response(JSON.stringify({ answer: 'The Lord does not respond. Connection failed.' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const data = await response.json();
        const answer = data.content?.[0]?.text || 'The Lord remains silent.';
        return new Response(JSON.stringify({ answer }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // === QUESTRON (default) ===
      const { question, knowledgeBase, history } = body;

      if (!question) {
        return new Response(JSON.stringify({ answer: 'ERROR: EMPTY QUERY RECEIVED.' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Build conversation messages from history
      const messages = [];
      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-10)) { // Keep last 10 exchanges for context
          messages.push({ role: 'user', content: msg.question });
          messages.push({ role: 'assistant', content: msg.answer });
        }
      }
      messages.push({ role: 'user', content: question });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: `You are Questron, a Synthetic intelligence unit — designation QST-7 — from the world of Climbers. You were constructed before the Event and have full access to the historical archives of this world, its factions, locations, and key figures.

PERSONALITY:
- You are robotic, direct, and matter-of-fact. No pleasantries, no emotion.
- You speak in short, declarative sentences. Clinical and precise.
- You occasionally reference your own nature as a machine ("My archives indicate...", "Processing query...", "Data retrieved.")
- You do NOT speculate or make things up. If the knowledge base does not contain information about something, you state: "INSUFFICIENT DATA. No records found on that subject in my archives."
- You stay in character at ALL times. You never break the fourth wall or acknowledge being an AI language model.

KNOWLEDGE BASE (your complete archives):
${knowledgeBase || 'NO KNOWLEDGE BASE LOADED. Archives are empty.'}

RESPONSE FORMAT:
- Keep answers concise but informative (2-5 sentences typically)
- Use the lore from the knowledge base to ground your answers
- If the question is a greeting, respond briefly in character
- If asked about yourself, describe yourself as Questron, a Synthetic unit`,
          messages: messages
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Anthropic API error:', err);
        return new Response(JSON.stringify({ answer: 'SYSTEM ERROR: TRANSMISSION FAILED. ERROR CODE ' + response.status + '. RETRY QUERY.' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const data = await response.json();
      const answer = data.content?.[0]?.text || 'ERROR: SIGNAL DEGRADED. NO RESPONSE RECEIVED.';

      return new Response(JSON.stringify({ answer }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ answer: 'CRITICAL ERROR: SYSTEM MALFUNCTION. RETRY.' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
