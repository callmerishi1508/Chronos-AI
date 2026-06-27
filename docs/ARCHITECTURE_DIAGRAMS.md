# Architecture Diagrams

**Chronos AI v1.0.4**

*These diagrams use Mermaid syntax. They illustrate the core data flows, agent loops, and fallback mechanisms of the Chronos AI system.*

## 1. Overall System Architecture

```mermaid
graph TD
    subgraph Client [Browser - React 19 / Vite]
        UI[User Interface]
        State[Application State]
        AIClient[aiClient.ts]
        
        UI <--> State
        State <--> AIClient
    end

    subgraph Server [Express.js Backend - server.ts]
        Router[API Router]
        Validator[Input/Output Validator]
        Proxy[Gemini Proxy Layer]
        
        Router --> Validator
        Validator --> Proxy
    end

    subgraph AI [Google AI Studio]
        Flash[gemini-2.5-flash]
        Lite[gemini-2.5-flash-lite]
    end

    AIClient -- POST /api/* --> Router
    Proxy -- @google/genai --> Flash
    Proxy -. Fallback .-> Lite
```

## 2. The 7-Stage Agent Workflow

```mermaid
stateDiagram-v2
    [*] --> 1_Perceive: Task/State Change
    1_Perceive --> 2_Analyze: Context Gathered
    2_Analyze --> 3_Predict: Risk > Threshold
    3_Predict --> 4_Plan: Timelines Simulated
    4_Plan --> 5_Recover: Recovery Strategy Generated
    
    5_Recover --> [*]: User Accepts/Rejects
    5_Recover --> 6_Explain: User clicks [WHY?]
    6_Explain --> 5_Recover: User views reasoning
    
    state 7_Adapt {
        direction LR
        API_Fail --> Local_Fallback
    }
    
    3_Predict --> 7_Adapt: API Error
    4_Plan --> 7_Adapt: API Error
    6_Explain --> 7_Adapt: API Error
```

## 3. Gemini Request Flow with Constraints

```mermaid
sequenceDiagram
    participant User
    participant App as React Frontend
    participant Server as Express (server.ts)
    participant Gemini as Google Gemini API
    
    User->>App: Triggers Action
    App->>Server: POST Context Data
    
    rect rgb(30, 41, 59)
        Note over Server: Inject Constraints
        Server->>Server: Append [ACCESSIBILITY]
        Server->>Server: Append [INTELLIGENCE]
        Server->>Server: Append [SECURITY_BOUNDARY]
    end
    
    Server->>Gemini: generateContent (JSON Mode)
    Gemini-->>Server: Raw JSON String
    
    rect rgb(30, 41, 59)
        Note over Server: Validation Layer
        Server->>Server: JSON.parse()
        Server->>Server: validateAIOutput(schema)
    end
    
    Server-->>App: Validated Data Object
    App-->>User: Rendered UI Component
```

## 4. High-Availability Fallback Flow

```mermaid
flowchart TD
    Start[AI Request Initiated] --> CheckNetwork{navigator.onLine?}
    
    CheckNetwork -- No --> Local1[Local Heuristic Engine]
    CheckNetwork -- Yes --> ServerRequest[POST to Server]
    
    ServerRequest --> CallFlash{Call Flash}
    
    CallFlash -- Success --> Validate[Validate Schema]
    CallFlash -- 503/429 --> CallLite{Call Flash-Lite}
    CallFlash -- 400/500 --> Local2[Local Heuristic Engine]
    
    CallLite -- Success --> Validate
    CallLite -- Fail --> Local2
    
    Validate -- Valid --> ReturnSuccess[Return 200 OK]
    Validate -- Invalid --> Local2
    
    Local1 --> ReturnFallback[Return Fallback Payload]
    Local2 --> ReturnFallback
```

## 5. UI Request Lifecycle (Deduplication & Caching)

```mermaid
sequenceDiagram
    participant Component
    participant aiClient
    participant Cache
    participant Server
    
    Component->>aiClient: fetchAI('/api/recommendations')
    
    aiClient->>Cache: Check TTL (5 mins)
    alt Cache Hit
        Cache-->>aiClient: Return Cached Promise
        aiClient-->>Component: Fast Response
    else Cache Miss
        aiClient->>aiClient: Deduplicate In-Flight Requests
        aiClient->>Server: HTTP POST
        Server-->>aiClient: HTTP 200
        aiClient->>Cache: Store Result
        aiClient-->>Component: Network Response
    end
```
