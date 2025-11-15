import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/models';

interface RegisterRequest {
  name: string;
  email: string;
}

interface LoginRequest {
  email: string;
}

interface AuthResponse {
  userId: string;
  message?: string;
}

// Registration endpoint
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const action = url.searchParams.get('action'); // 'register' or 'login'

    const body = await request.json();

    // Handle Registration
    if (action === 'register') {
      const { name, email }: RegisterRequest = body;

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

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { message: 'An account with this email already exists. Please login instead.' },
          { status: 409 }
        );
      }

      // Create new user (defaults will be set by pre-save middleware)
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
      });

      await newUser.save();

      const response: AuthResponse = {
        userId: newUser._id.toString(),
        message: 'Account created successfully! Welcome to EmissionX!',
      };

      return NextResponse.json(response, { status: 201 });
    }

    // Handle Login
    if (action === 'login') {
      const { email }: LoginRequest = body;

      // Validate input
      if (!email) {
        return NextResponse.json(
          { message: 'Email is required' },
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
      
      if (!existingUser) {
        return NextResponse.json(
          { message: 'No account found with this email. Please register first.' },
          { status: 404 }
        );
      }

      // User exists, return their ID
      const response: AuthResponse = {
        userId: existingUser._id.toString(),
        message: 'Welcome back!',
      };

      return NextResponse.json(response);
    }

    // Invalid action
    return NextResponse.json(
      { message: 'Invalid action. Use ?action=register or ?action=login' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Auth error:', error);

    // Handle duplicate email error (MongoDB duplicate key error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

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
