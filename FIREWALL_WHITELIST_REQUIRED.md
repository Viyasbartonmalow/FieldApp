# Network Configuration for AppSync (IT Whitelist Required)

## Issue Summary

**Error:** `WebSocket connection failed: ERR_CONNECTION_RESET`

This error indicates that WebSocket (WSS) connections to AWS AppSync are being blocked by the network firewall or proxy.

---

## What's Being Blocked

### AppSync Endpoints (MUST BE WHITELISTED)

| Service | Domain | Port | Protocol | Purpose |
|---------|--------|------|----------|---------|
| **AppSync API** | `26uedpbc5ncrvdo75m25cqmdqy.appsync-api.us-west-2.amazonaws.com` | 443 | HTTPS | GraphQL queries & mutations |
| **AppSync Realtime** | `26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com` | 443 | WSS (WebSocket Secure) | Real-time DataStore sync |
| **AWS Region** | `*.appsync-api.us-west-2.amazonaws.com` | 443 | HTTPS + WSS | All AppSync services in us-west-2 |

---

## Firewall Configuration

### For Palo Alto Networks Firewalls
```
Security Policy > Application Rules:
- Add application: "appsyncdatastore"
- Or whitelist custom apps:
  - appsync-api
  - appsync-realtime
  - awsappsync
```

### For Microsoft Proxy / Threat Management Gateway
```
Web Access Rules:
- Allow HTTPS to: *.appsync-api.us-west-2.amazonaws.com
- Allow WSS (WebSocket Secure) to: *.appsync-realtime-api.us-west-2.amazonaws.com
```

### For Cisco ASA / Fortigate / Generic Firewall
```
Outbound Rules:
- Protocol: TCP
- Destination Port: 443 (HTTPS and WSS both use port 443)
- Destination: 
  - 26uedpbc5ncrvdo75m25cqmdqy.appsync-api.us-west-2.amazonaws.com
  - 26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com
- Action: Allow
```

### For Proxy Auto-Config (PAC) Files
```javascript
// Add to PAC file BYPASS list (no proxy):
if (shExpMatch(host, "*.appsync-api.us-west-2.amazonaws.com") ||
    shExpMatch(host, "*.appsync-realtime-api.us-west-2.amazonaws.com")) {
  return "DIRECT";
}
```

---

## Technical Background

### Why WebSocket Fails

1. **WebSocket Handshake** initiates as HTTP UPGRADE request
2. **Firewall/Proxy intercepts** and blocks connection
3. **Result:** `ERR_CONNECTION_RESET` error

### Symptoms When Blocked

- ✅ REST API calls work (`POST /graphql` requests)
- ❌ WebSocket connections fail (`wss://...`)
- ❌ DataStore sync hangs (no real-time updates)
- ✅ App still works via HTTP fallback (slower)

---

## Testing Before Whitelist

### Test WebSocket Connectivity (from affected network)

**Windows PowerShell:**
```powershell
# Test DNS resolution
nslookup 26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com

# Test HTTPS (should work - 200 or 400 response)
Invoke-WebRequest -Uri "https://26uedpbc5ncrvdo75m25cqmdqy.appsync-api.us-west-2.amazonaws.com/graphql" -ErrorAction SilentlyContinue

# Test WebSocket (requires advanced tools)
# Option 1: Open browser DevTools and check Console for connection errors
# Option 2: Use wscat tool: npx wscat -c "wss://26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com/graphql"
```

**Linux/Mac:**
```bash
# Test DNS
nslookup 26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com

# Test HTTPS
curl -v https://26uedpbc5ncrvdo75m25cqmdqy.appsync-api.us-west-2.amazonaws.com/graphql

# Test WebSocket
npx wscat -c "wss://26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com/graphql"
```

---

## After Whitelist Configuration

### User Verification Steps

1. **Clear browser cache:**
   - F12 → Storage → IndexedDB → Delete database
   - F12 → Application → Clear site data

2. **Hard refresh page:**
   - `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

3. **Check console for success:**
   ```
   [DataStore] ✅ Ready with WebSocket sync
   [projectDataStore] ✅ SUCCESS: Loaded 1960 projects from LOCAL DataStore
   ```

4. **Test project dropdown:**
   - Should show all 1960 projects instantly
   - No "Loading..." spinner
   - No "0 projects" error

---

## Current Workaround (If Whitelist Delayed)

Users can currently:
- ✅ See projects via AppSync HTTP fallback
- ✅ Load data (slower, ~2-5s instead of instant)
- ❌ No real-time sync updates
- ⚠️ Not recommended for production

### How Fallback Works
```
1. WebSocket connection fails → 5-10s timeout
2. Falls back to HTTP POST query
3. Projects load from AppSync via standard HTTPS
4. UI shows: "FALLBACK SUCCESS: Loaded from AppSync"
```

---

## AWS API Gateway Configuration (Reference)

If your firewall also needs AWS endpoint configuration:

**AppSync endpoints that need access:**
```
Service: appsync
Region: us-west-2
Endpoint: https://appsync-api.us-west-2.amazonaws.com
Realtime: https://appsync-realtime-api.us-west-2.amazonaws.com
```

**AWS IP Ranges:** Check https://ip-ranges.amazonaws.com/ip-ranges.json
- Look for: `"service": "APPSYNC"`
- Region: `"region": "us-west-2"`

---

## Verification Checklist for IT

- [ ] DNS resolves for both AppSync endpoints
- [ ] HTTPS (port 443) allowed to AppSync endpoints
- [ ] WSS (WebSocket Secure) allowed to realtime endpoint
- [ ] No proxy intercepting UPGRADE requests
- [ ] No DLP (Data Loss Prevention) blocking AWS domains
- [ ] SSL inspection (if enabled) not interfering with WebSocket

---

## Contact Information

**For technical support:**
- AWS AppSync Documentation: https://docs.aws.amazon.com/appsync/
- AWS Support: Check AWS Console → Support Center
- Application Team: [Your contact info]

**Timeline:**
- Status: Blocking users from accessing real-time data
- Priority: High (affects app functionality)
- Workaround: Available (HTTP fallback, slower)

---

## Summary for IT Ticket

**Ticket Title:** Whitelist AppSync WebSocket Endpoints - US-West-2

**Description:**
The Field App requires WebSocket connectivity to AWS AppSync for real-time data synchronization. Currently, WebSocket connections to the following domains are being blocked:

1. `26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com` (Port 443 WSS)
2. `26uedpbc5ncrvdo75m25cqmdqy.appsync-api.us-west-2.amazonaws.com` (Port 443 HTTPS)

**Action Required:**
Add outbound firewall rules allowing:
- Destination: `*.appsync-api.us-west-2.amazonaws.com`
- Destination: `*.appsync-realtime-api.us-west-2.amazonaws.com`
- Protocol: TCP/443 (HTTPS and WSS)
- Action: Allow

**Impact if blocked:** Users cannot sync data from DynamoDB in real-time. App falls back to slower HTTP polling.

**Test after implementation:** https://26uedpbc5ncrvdo75m25cqmdqy.appsync-realtime-api.us-west-2.amazonaws.com/graphql should be accessible via WSS.
