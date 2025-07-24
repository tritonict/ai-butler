// lib/agent.ts

export async function getMessages({
  user_id,
  prompt,
}: {
  user_id: string
  prompt: string
}): Promise<{ output: string; tokensUsed: number }> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, prompt }),
  })

  const data = await response.json()
  return {
    output: data.output || 'Geen antwoord ontvangen.',
    tokensUsed: data.tokensUsed || 0,
  }
}

export async function saveMessage(
  userId: string,
  prompt: string,
  response: string,
  tokens: number
) {
  await fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, prompt, response, tokens }),
  })
}