// Authentication
export interface AuthCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  AccessToken: string;
  ExpiresIn: number;
  Scope: string;
  TokenType: string;
}

export interface AuthErrorResponse {
  title: string;
  status: number;
  detail: string;
}

// Symbols
export interface Symbol {
  name: string;  // Mapped from API's PascalCase "Name" field
  type: string;  // Mapped from API's PascalCase "Type" field
  description?: string;  // Mapped from API's PascalCase "Description" field
}

export interface rawApiSymbol {
  Name: string; 
  Type: string; 
  Description?: string;  
}

export interface SymbolValue {
  symbolName: string;
  stVal: number;
  t: string; // Parsed timestamp string (from API's nested `t.value` field, formatted for display)
  lastUpdated: Date;
  rawData?: Record<string, unknown>; // Full API response — use this to access additional fields like `range`, `units`, `multiplier`, `d`, and the quality object `q`
}

// Historical data
export interface SymbolHistoryPoint {
  value: number;
  timestamp: Date;
  formattedTime: string;
}

export interface SymbolHistory {
  symbolName: string;
  dataPoints: SymbolHistoryPoint[];
  maxPoints: number;
}

// Connection and Polling State
export interface ConnectionStatus {
  isConnected: boolean;
  lastConnection?: Date;
  error?: string;
}

export interface PollingState {
  isPolling: boolean;
  interval: number;
  lastPoll?: Date;
}

export interface ApiError {
  message: string;
  status?: number;
  timestamp: Date;
  cancelled?: boolean;
}