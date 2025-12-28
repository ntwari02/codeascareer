# Inbox Testing Guide

## Test Data Seeded

The database has been seeded with test inbox data. Here's how to test it:

## Test User Credentials

**Seller Account (to view inbox):**
- Email: `seller@test.com`
- Password: `test123`

**Buyer Accounts (for reference):**
- Email: `buyer1@test.com` (Acme Corp)
- Email: `buyer2@test.com` (Global Retailers Ltd)
- Email: `buyer3@test.com` (Startup Hub)
- Password: `test123` (for all)

## Test Data Created

- **4 Threads** with the test seller
- **11 Messages** across all threads
- Thread types: RFQ, Order, Message
- Mix of read/unread messages

## How to Test

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client:**
   ```bash
   cd client
   npm run dev
   ```

3. **Login as test seller:**
   - Go to http://localhost:5173
   - Login with: `seller@test.com` / `test123`
   - Navigate to Seller Dashboard → Inbox

4. **You should see:**
   - 4 threads in the left sidebar
   - Thread 1: "RFQ: 500 units of Wireless Headphones" (unread)
   - Thread 2: "Order #ORD-2847 – Shipping address clarification"
   - Thread 3: "RFQ: Annual subscription & support"
   - Thread 4: "Product inquiry - Wireless Earbuds"

5. **Test Features:**
   - Click on a thread to view messages
   - Send a new message
   - Upload files/images
   - Record voice notes
   - React to messages
   - Edit/delete messages
   - Reply to messages

## Re-seed Data

If you need to reset the test data:

```bash
cd server
npm run seed:inbox
```

This will:
- Clear existing test threads
- Create fresh test users (if they don't exist)
- Create 4 new threads with messages

## API Testing

You can also test the API directly:

```bash
# Get threads (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/seller/inbox/threads

# Get a specific thread
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/seller/inbox/threads/THREAD_ID
```

## Notes

- All test users have password: `test123`
- The seller account is pre-verified and approved
- Threads are created with realistic timestamps (2h ago, 5h ago, yesterday, etc.)
- Messages include both buyer and seller messages

