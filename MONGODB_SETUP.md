# MongoDB Atlas Setup Instructions

## Step 1: Create .env.local File

Create a file named `.env.local` in your project root directory with the following content:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/emissionx?retryWrites=true&w=majority

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

## Step 2: Replace the MongoDB URI

Replace the following parts in your MongoDB URI:
- `your-username` - Your MongoDB Atlas username
- `your-password` - Your MongoDB Atlas password
- `your-cluster` - Your MongoDB Atlas cluster name

## Step 3: Test the Connection

Once you've created the `.env.local` file with your MongoDB Atlas credentials, run:

```bash
node scripts/setup-demo-data.js
```

This will:
1. Connect to your MongoDB Atlas database
2. Create a demo user with ID `demoUser123`
3. Add sample activities and achievements

## Step 4: View the Profile

After the demo data is created, you can:
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3002/profile`
3. See the demo user profile with data

## Troubleshooting

### If you get connection errors:
1. Make sure your MongoDB Atlas cluster is running
2. Check that your IP address is whitelisted in MongoDB Atlas
3. Verify your username and password are correct
4. Ensure the database name is `emissionx`

### If the .env.local file isn't being read:
1. Make sure the file is in the project root directory
2. Restart your development server after creating the file
3. Check that there are no extra spaces or characters in the file

## MongoDB Atlas Security

Make sure to:
1. Use a strong password
2. Whitelist your IP address in MongoDB Atlas
3. Use environment variables (never commit credentials to git)
4. Consider using MongoDB Atlas's built-in authentication

## Example MongoDB URI Format

```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/emissionx?retryWrites=true&w=majority
```

Where:
- `myuser` is your MongoDB username
- `mypassword` is your MongoDB password
- `cluster0.abc123` is your cluster identifier
- `emissionx` is the database name
