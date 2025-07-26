// app/api/agent/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {

  let body
  try {
    body = await req.json()
  } catch (err) {
    console.error('❌ Ongeldige JSON body:', err)
    return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 })
  }

  const { prompt, action_id, user_id, parameters, system_prompt } = body

  if (!prompt || !action_id || !user_id) {
    console.error('❌ Missing fields:', { prompt, action_id, user_id })
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    console.log('🌍 N8N_AGENT_WEBHOOK_URL:', process.env.N8N_AGENT_WEBHOOK_URL)
    console.log('📦 Payload:', JSON.stringify({ prompt, action_id, user_id, parameters, system_prompt }, null, 2))

    const response = await fetch(process.env.N8N_AGENT_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, action_id, user_id, parameters, system_prompt })
    })

    console.log('⬅️ response status:', response.status)
    const raw = await response.text()
    let result
    try {
      result = JSON.parse(raw)
    } catch {
      result = { output: raw }
    }
    console.log('⬅️ response body:', result)

    return NextResponse.json(result)
  } catch (error: unknown) {
  	if (error instanceof Error) {
  		return NextResponse.json({ error: 'Agent API error', details: error.message }, { status: 500 })
  	}
  	else
  	{
  		return NextResponse.json({ error: 'Unknown Agent API error' }, { status: 500 })
  	}
  }
}