# MongoDB Cold Start Optimization Guide

## Problem: 10-15 Second Cold Starts

MongoDB cold starts in serverless environments can be slow due to:
1. DNS resolution (1-2 seconds)
2. TCP connection establishment (1-2 seconds)
3. MongoDB handshake and authentication (1-3 seconds)
4. Connection pool initialization (1-2 seconds)
5. Serverless function cold start (2-5 seconds)

**Total: 6-14 seconds** (combining MongoDB + Vercel cold starts)

## ✅ Optimizations Applied

### 1. Connection Pooling
- `maxPoolSize: 1` - Single connection reduces overhead
- `minPoolSize: 1` - Keep connection alive between invocations
- `maxIdleTimeMS: 30000` - Close idle connections after 30s

### 2. Timeout Optimization
- `serverSelectionTimeoutMS: 5000` - Fail fast if server unavailable
- `connectTimeoutMS: 10000` - Connection timeout set to 10s
- `socketTimeoutMS: 45000` - Socket timeout for long operations

### 3. Connection Keep-Alive
- `heartbeatFrequencyMS: 10000` - Keep connection alive with heartbeats
- Connection cached globally across invocations

### 4. Network Optimization
- `family: 4` - Force IPv4 (faster DNS resolution)
- `directConnection: false` - Use connection pool (faster for Atlas)

### 5. Retry Configuration
- `retryWrites: true` - Retry write operations automatically
- `retryReads: true` - Retry read operations automatically

## 🚀 Additional Optimization Strategies

### Strategy 1: Connection Warming (Recommended)

Create a simple endpoint to keep functions warm:

```typescript
// app/api/warm/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/models';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'warmed', timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
```

Then set up a cron job (using Vercel Cron or external service) to ping this endpoint every 5 minutes:
- Vercel Cron: Add to `vercel.json`
- External: Use cron-job.org or similar to ping `/api/warm`

### Strategy 2: Use Vercel Edge Config (For Static Data)

For data that doesn't change often, consider caching in Vercel Edge Config instead of MongoDB.

### Strategy 3: Optimize MongoDB Connection String

Add these parameters to your MongoDB URI:

```
mongodb+srv://user:pass@cluster.mongodb.net/emissionx?
  retryWrites=true&
  w=majority&
  maxPoolSize=1&
  minPoolSize=1&
  connectTimeoutMS=10000&
  socketTimeoutMS=45000
```

### Strategy 4: Use MongoDB Atlas Serverless Instance

MongoDB Atlas Serverless instances are optimized for serverless workloads:
- Faster connection times
- Auto-scaling
- Better for unpredictable traffic

Upgrade in MongoDB Atlas Dashboard → Configuration → Cluster Type → Serverless

### Strategy 5: Implement Response Caching

Cache responses that don't change frequently:

```typescript
// In API routes
export const revalidate = 60; // Revalidate every 60 seconds
```

## 📊 Expected Performance

After optimizations:
- **First request (cold start)**: 3-5 seconds
- **Subsequent requests (warm)**: 100-500ms
- **With connection warming**: 100-500ms (even after idle)

## 🔧 Monitoring

### Check Cold Start Times

1. Go to Vercel Dashboard → Analytics
2. Check Function Duration metrics
3. Look for cold starts vs warm starts

### MongoDB Atlas Monitoring

1. MongoDB Atlas Dashboard → Metrics
2. Check connection metrics
3. Monitor connection pool usage

## ⚡ Quick Wins

1. **Enable MongoDB Atlas Serverless** (if not already)
2. **Set up connection warming endpoint** (see Strategy 1)
3. **Use Vercel Cron** to ping warming endpoint every 5 minutes
4. **Monitor and adjust** connection pool settings based on usage

## 📝 Vercel Cron Setup

Create `vercel.json` in project root:

```json
{
  "crons": [{
    "path": "/api/warm",
    "schedule": "*/5 * * * *"
  }]
}
```

This keeps your functions warm by pinging every 5 minutes.

## 🎯 Target Performance

- **Cold Start**: < 5 seconds (MongoDB connection + Vercel cold start)
- **Warm Start**: < 500ms (cached connection)
- **With Warming**: < 500ms (maintained connection)

## Troubleshooting

### Still seeing 10-15s cold starts?

1. **Check Vercel region**: Deploy to same region as MongoDB
2. **Check MongoDB region**: Use MongoDB in same region as Vercel
3. **Enable connection warming**: Most important optimization
4. **Upgrade MongoDB**: Use Serverless tier for better performance
5. **Check DNS**: Use IPv4 (already configured)

### Connection Timeouts

If you see timeout errors:
- Increase `connectTimeoutMS` to 15000
- Check MongoDB Atlas Network Access
- Verify firewall rules

---

**Note**: The 10-15 second cold starts are likely a combination of:
- Vercel function cold start (2-5s)
- MongoDB connection (3-5s)
- First request overhead (1-2s)

The MongoDB optimizations help, but connection warming is the most effective solution for eliminating cold starts.

