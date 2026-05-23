
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface IntelligenceReport {
  phoneNumber: string;
  carrier: string;
  lineType: 'Mobile' | 'Landline' | 'VoIP' | 'Prepaid' | 'Virtual';
  location: {
    city: string;
    region: string;
    country: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
  };
  historicalTrace?: {
    timestamp: string;
    estimatedLat: number;
    estimatedLng: number;
    confidence: number;
    sourceType: string;
    context: string;
  };
  reputation: {
    score: number; // 0-100
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    flags: string[];
  };
  ownership: {
    name: string;
    associatedEmails: string[];
    socialPresence: string[];
  };
  ipInfo?: {
    ipAddress: string;
    isp: string;
    location: string;
  };
  communicationLogs?: Array<{
    timestamp: string;
    type: 'SMS' | 'Call';
    direction: 'Incoming' | 'Outgoing';
    metadata?: string;
  }>;
  summary: string;
  sources: { title: string; url: string }[];
}

export enum AnalysisStep {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  NETWORK_QUERY = 'NETWORK_QUERY',
  GEOLOCATION = 'GEOLOCATION',
  TEMPORAL_LINK = 'TEMPORAL_LINK',
  OSINT_SCRAPING = 'OSINT_SCRAPING',
  FINALIZING = 'FINALIZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
