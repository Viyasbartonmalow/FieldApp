import { Amplify } from 'aws-amplify'
import amplifyconfig from './amplifyconfiguration.json'

// Configure Amplify as early as possible so category modules (DataStore/Auth)
// do not initialize before configuration is available.
// Note: WebSocket subscriptions may fail on networks with strict firewall rules.
// Fallback to HTTP polling via AppSync is automatically provided.
Amplify.configure(amplifyconfig)
