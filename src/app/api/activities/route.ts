import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Activity, ActivityType, ActivityCategory } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as ActivityType;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const query: Record<string, string> = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;
    
    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, type, category, data, timestamp } = await request.json();
    
    if (!userId || !type || !category || !data) {
      return NextResponse.json(
        { error: 'userId, type, category, and data are required' },
        { status: 400 }
      );
    }
    
    // Create activity instance
    const activity = new Activity({
      userId,
      type: type as ActivityType,
      category: category as ActivityCategory,
      data,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    
    // Calculate emissions explicitly before saving to ensure it exists for validation
    // The pre-save hook will also run, but this ensures emissions are set
    try {
      activity.emissions = activity.calculateEmissions();
    } catch (calcError) {
      console.error('Error calculating emissions:', calcError);
      // Set default emissions if calculation fails
      activity.emissions = {
        co2: 0,
        totalCO2e: 0,
        factors: {
          co2PerUnit: 0,
          unit: 'unknown',
          source: 'default',
          lastUpdated: new Date()
        },
        calculationMethod: 'default' as const,
        verified: false
      };
    }
    
    await activity.save();
    
    return NextResponse.json({ 
      message: 'Activity created successfully',
      activity: {
        id: activity.id,
        userId: activity.userId,
        type: activity.type,
        category: activity.category,
        emissions: activity.emissions,
        timestamp: activity.timestamp
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating activity:', error);
    
    // Handle validation errors
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ValidationError' &&
      'errors' in error
    ) {
      const validationError = error as unknown as { errors: Record<string, { message: string }> };
      const errors = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: errors.join(', ')
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create activity',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
