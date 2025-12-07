import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[TTS API] ========== REQUEST RECEIVED ==========');
  console.log('[TTS API] Timestamp:', new Date().toISOString());
  console.log('[TTS API] Request URL:', request.url);
  console.log('[TTS API] Request method:', request.method);
  
  try {
    console.log('[TTS API] Starting to parse request body...');
    const requestBody = await request.json();
    console.log('[TTS API] Request body parsed successfully');
    const { text } = requestBody;
    console.log('[TTS API] Extracted text from body:', text);
    console.log('[TTS API] Text type:', typeof text);
    console.log('[TTS API] Text length:', text?.length);

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('[TTS API] Validation failed: text is empty or invalid');
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    // Get HF token from environment
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      console.error('[TTS API] HF_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    console.log('[TTS API] HF_TOKEN found, length:', hfToken.length);

    // Initialize Gradio client
    console.log('[TTS API] About to connect to Gradio client...');
    console.log('[TTS API] Space name: vivienhenz/neiom-v0');
    const connectStartTime = Date.now();
    let client;
    try {
      client = await Client.connect('vivienhenz/neiom-v0', {
        hf_token: hfToken,
      });
      const connectDuration = Date.now() - connectStartTime;
      console.log('[TTS API] Gradio client connected successfully in', connectDuration, 'ms');
    } catch (connectError) {
      const connectDuration = Date.now() - connectStartTime;
      console.error('[TTS API] Gradio client connection failed after', connectDuration, 'ms');
      console.error('[TTS API] Gradio client connection error:', connectError);
      throw connectError;
    }

    // Call the generate speech API
    console.log('[TTS API] About to call _generate_speech_impl...');
    console.log('[TTS API] Endpoint: /_generate_speech_impl');
    console.log('[TTS API] Input text:', text.trim());
    const predictStartTime = Date.now();
    let result;
    try {
      result = await client.predict('/_generate_speech_impl', {
        text: text.trim(),
      });
      const predictDuration = Date.now() - predictStartTime;
      console.log('[TTS API] _generate_speech_impl call completed in', predictDuration, 'ms');
      console.log('[TTS API] Result type:', typeof result);
      console.log('[TTS API] Result keys:', result ? Object.keys(result) : 'null');
      console.log('[TTS API] Full result:', JSON.stringify(result, null, 2));
      console.log('[TTS API] Result.data:', result?.data);
    } catch (predictError) {
      const predictDuration = Date.now() - predictStartTime;
      console.error('[TTS API] _generate_speech_impl call failed after', predictDuration, 'ms');
      console.error('[TTS API] Predict error:', predictError);
      throw predictError;
    }

    // Extract audio URL from result
    // The result.data should contain the audio file URL
    const audioUrl = result?.data?.[0]?.url || result?.data?.[0];
    console.log('[TTS API] Extracted audioUrl:', audioUrl);
    console.log('[TTS API] Result.data structure:', JSON.stringify(result?.data, null, 2));

    if (!audioUrl) {
      console.error('[TTS API] No audio URL in response. Full result:', JSON.stringify(result, null, 2));
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

    const totalDuration = Date.now() - startTime;
    console.log('[TTS API] Success! Total request duration:', totalDuration, 'ms');
    console.log('[TTS API] Returning audioUrl:', audioUrl);
    console.log('[TTS API] ========== REQUEST COMPLETE ==========');
    return NextResponse.json({ audioUrl });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('[TTS API] ========== ERROR OCCURRED ==========');
    console.error('[TTS API] Error after', totalDuration, 'ms');
    console.error('[TTS API] Error type:', error?.constructor?.name);
    console.error('[TTS API] Error caught:', error);
    console.error('[TTS API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[TTS API] Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && 'cause' in error) {
      console.error('[TTS API] Error cause:', error.cause);
    }
    console.error('[TTS API] ========== END ERROR ==========');
    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again.' },
      { status: 500 }
    );
  }
}

