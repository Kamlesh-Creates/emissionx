import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId)
      .select('name email stats.totalEmissions stats.achievements stats.monthlyAverage stats.yearlyTotal stats.streak createdAt')
      .lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: userId } = await params;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update emissions if provided
    if (body.totalEmissions !== undefined) {
      // Store previous calculation date before updating
      const previousLastCalc = user.stats.lastCalculation;
      
      user.stats.totalEmissions += body.totalEmissions;
      const today = new Date();
      user.stats.lastCalculation = today;
      
      // Update streak based on previous calculation date
      if (previousLastCalc) {
        const diffTime = today.getTime() - previousLastCalc.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.stats.streak += 1;
        } else if (diffDays > 1) {
          user.stats.streak = 1;
        }
      } else {
        user.stats.streak = 1;
      }
    }

    await user.save();
    
    return NextResponse.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id.toString(),
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}