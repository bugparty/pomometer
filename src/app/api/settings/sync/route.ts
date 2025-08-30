import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import type { JWTPayload, SyncOperationsRequest, SyncResponse, UserSettings } from '../../../types/api';

// Sync settings operations
async function handleSyncSettings(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const { operations, lastSyncTime } = await request.json() as SyncOperationsRequest;
    const userId = user.sub;
    
    // TODO: Apply all operations to the database
    // Temporarily skip database operations; just log them
    for (const operation of operations) {
      console.log(`Processing settings operation: ${operation.type}`, { 
        payload: operation.payload, 
        timestamp: operation.timestamp, 
        userId 
      });
      
      // Actual database operations should be executed here
      // await settingsService.applySettingsOperation(userId, operation);
    }
    
    // TODO: Fetch updated settings
    // Temporarily return default settings
    const settings: UserSettings = {
      pomodoro_duration: 1500,
      short_break_duration: 300,
      long_break_duration: 1500,
      ticking_sound_enabled: true,
      rest_ticking_sound_enabled: false,
      language: 'en-US'
    };
    
    const syncTime = new Date().toISOString();
    
    const response: SyncResponse = {
      success: true,
      data: {
        conflicts: [], // Settings typically have no conflicts
        serverOperations: [], // No server operations need to be returned for now
        lastSyncTime: syncTime,
        settings
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Sync settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync settings' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleSyncSettings);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
