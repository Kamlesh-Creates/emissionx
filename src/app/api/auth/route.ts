import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/models';

interface AuthRequest {
  name: string;
  email: string;
}

interface AuthResponse {
  userId: string;
  message?: string;
  isNewUser?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: AuthRequest = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // User exists, return their ID
      const response: AuthResponse = {
        userId: existingUser._id.toString(),
        message: 'Welcome back!',
        isNewUser: false,
      };
      return NextResponse.json(response);
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      preferences: {
        units: 'metric',
        currency: 'USD',
        notifications: {
          email: true,
          push: false,
        },
      },
      profile: {
        bio: '',
        location: '',
        website: '',
      },
      stats: {
        totalEmissions: 0,
        monthlyAverage: 0,
        yearlyTotal: 0,
        streak: 0,
        lastActivityDate: null,
        achievements: [],
      },
    });

    await newUser.save();

    const response: AuthResponse = {
      userId: newUser._id.toString(),
      message: 'Account created successfully!',
      isNewUser: true,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Auth error:', error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: `Validation error: ${errors.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
