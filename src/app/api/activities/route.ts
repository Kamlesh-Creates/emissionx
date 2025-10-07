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
    
    const activity = new Activity({
      userId,
      type: type as ActivityType,
      category: category as ActivityCategory,
      data,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    
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
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
