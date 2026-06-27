import { Type, Schema } from "@google/genai";
import { logger } from "./logger";

// Validate API Input Payloads
export function validateInputPayload(req: any, res: any, next: any) {
  if (req.method !== 'POST') return next();

  if (typeof req.body !== 'object' || req.body === null) {
    logger.warn(`Invalid input: Body must be an object at ${req.path}`);
    return res.status(400).json({ error: "Invalid request", details: ["Body must be a JSON object"] });
  }

  const { tasks, habits, history, messages } = req.body;

  if (tasks !== undefined && !Array.isArray(tasks)) {
    logger.warn(`Invalid input: tasks must be an array at ${req.path}`);
    return res.status(400).json({ error: "Invalid request", details: ["tasks must be an array"] });
  }
  if (habits !== undefined && !Array.isArray(habits)) {
    logger.warn(`Invalid input: habits must be an array at ${req.path}`);
    return res.status(400).json({ error: "Invalid request", details: ["habits must be an array"] });
  }
  if (history !== undefined && !Array.isArray(history)) {
    logger.warn(`Invalid input: history must be an array at ${req.path}`);
    return res.status(400).json({ error: "Invalid request", details: ["history must be an array"] });
  }
  if (messages !== undefined && !Array.isArray(messages)) {
    logger.warn(`Invalid input: messages must be an array at ${req.path}`);
    return res.status(400).json({ error: "Invalid request", details: ["messages must be an array"] });
  }

  // Length constraints
  const payloadStr = JSON.stringify(req.body);
  if (payloadStr.length > 1024 * 1024) { // 1MB
    logger.warn(`Invalid input: Payload exceeds 1MB at ${req.path}`);
    return res.status(400).json({ error: "Invalid request", details: ["Payload exceeds 1MB limit"] });
  }

  next();
}

// Strict Output Validation
export function validateAIOutput(parsed: any, schema: Schema | undefined): void {
  if (!schema) return; // No schema provided

  function walk(data: any, sch: Schema, path: string) {
    if (sch.type === Type.OBJECT) {
      if (typeof data !== 'object' || data === null) {
        throw new Error(`Output schema violation at ${path}: expected object`);
      }
      if (sch.required) {
        for (const req of sch.required) {
          if (!(req in data)) {
            throw new Error(`Output schema violation at ${path}: missing required field '${req}'`);
          }
        }
      }
      if (sch.properties) {
        for (const key in sch.properties) {
          if (key in data) {
            walk(data[key], sch.properties[key], `${path}.${key}`);
          }
        }
      }
    } else if (sch.type === Type.ARRAY) {
      if (!Array.isArray(data)) {
        throw new Error(`Output schema violation at ${path}: expected array`);
      }
      if (sch.items) {
        for (let i = 0; i < data.length; i++) {
          walk(data[i], sch.items, `${path}[${i}]`);
        }
      }
    } else if (sch.type === Type.STRING) {
      if (typeof data !== 'string') {
        throw new Error(`Output schema violation at ${path}: expected string, got ${typeof data}`);
      }
      
      // Strict Enum Validation for critical fields
      if (path.endsWith("confidenceBand")) {
        const allowed = ["Very High", "High", "Moderate", "Low", "Insufficient Evidence"];
        if (!allowed.includes(data)) throw new Error(`Invalid enum at ${path}: ${data}`);
      }
      if (path.endsWith("evidenceQuality")) {
        const allowed = ["Strong", "Moderate", "Limited", "None"];
        if (!allowed.includes(data)) throw new Error(`Invalid enum at ${path}: ${data}`);
      }
    } else if (sch.type === Type.INTEGER || sch.type === Type.NUMBER) {
      if (typeof data !== 'number') {
        throw new Error(`Output schema violation at ${path}: expected number`);
      }
    } else if (sch.type === Type.BOOLEAN) {
      if (typeof data !== 'boolean') {
        throw new Error(`Output schema violation at ${path}: expected boolean`);
      }
    }
  }

  walk(parsed, schema, 'root');
}
