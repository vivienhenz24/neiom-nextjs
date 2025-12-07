import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    // Get HF token from environment
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Initialize Gradio client
    const client = await Client.connect('vivienhenz/neiom-v0', {
      headers: {
        Authorization: `Bearer ${hfToken}`,
      },
    });

    // Call the generate speech API
    const result = await client.predict('/_generate_speech_impl', {
      text: text.trim(),
    });

    // Extract audio URL from result
    // Handle different possible result structures
    const resultData = result?.data as unknown;
    let audioUrl: string | null = null;

    if (Array.isArray(resultData) && resultData.length > 0) {
      const firstItem = resultData[0];
      if (typeof firstItem === 'string') {
        audioUrl = firstItem;
      } else if (firstItem && typeof firstItem === 'object' && 'url' in firstItem) {
        audioUrl = (firstItem as { url: string }).url;
      } else if (firstItem && typeof firstItem === 'object' && 'path' in firstItem) {
        audioUrl = (firstItem as { path: string }).path;
      }
    } else if (typeof resultData === 'string') {
      audioUrl = resultData;
    } else if (resultData && typeof resultData === 'object' && 'url' in resultData) {
      audioUrl = (resultData as { url: string }).url;
    }

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

    return NextResponse.json({ audioUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again.' },
      { status: 500 }
    );
  }
}

