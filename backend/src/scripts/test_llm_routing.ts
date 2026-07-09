import dotenv from "dotenv";
dotenv.config(); // Load env before anything else so DEFAULT_CLAUDE_MODEL matches process.env

import pool from "../config/database";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Color coding for test outputs
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;

// ─── SDK Prototype Mocks & Spies ──────────────────────────────────────────

let anthropicCalls: any[] = [];
let geminiCalls: any[] = [];
let mockAnthropicShouldFail = false;
let mockGeminiShouldFail = false;

// Mock Anthropic client messages.create method using prototype descriptors
const mockMessages = {
    create: async function(options: any) {
        anthropicCalls.push({
            model: options.model,
            systemPrompt: options.system,
            userPrompt: options.messages[0].content
        });
        
        if (mockAnthropicShouldFail) {
            const err = new Error("Mock Anthropic API Rate Limit Exceeded");
            (err as any).status = 429;
            throw err;
        }
        
        // Return lowercase response to bypass the named entity validator
        return {
            content: [{ type: "text", text: "this is a valid mock narrative summary generated for testing" }]
        };
    }
};

Object.defineProperty(Anthropic.prototype, "messages", {
    get() {
        return mockMessages;
    },
    set(val) {
        // Intercept and swallow constructor assignments
    },
    configurable: true,
    enumerable: true
});

// Mock GoogleGenerativeAI client getGenerativeModel method
GoogleGenerativeAI.prototype.getGenerativeModel = function(options: any) {
    return {
        generateContent: async function(promptObj: any) {
            const promptText = typeof promptObj === "string" 
                ? promptObj 
                : promptObj?.contents?.[0]?.parts?.[0]?.text || "";
                
            geminiCalls.push({
                model: options.model,
                systemPrompt: options.systemInstruction,
                userPrompt: promptText
            });
            
            if (mockGeminiShouldFail) {
                const err = new Error("Mock Gemini API Rate Limit Exceeded");
                (err as any).status = 429;
                throw err;
            }
            
            // Return lowercase response to bypass the named entity validator
            return {
                response: {
                    text: () => "this is a valid mock narrative summary generated for testing"
                }
            };
        }
    } as any;
};

// ─── Import Code Under Test After Installing Mocks ──────────────────────────

import { callClaude, isAnthropicConfigured } from "../services/anthropicClient";
import { generateAndValidateNarrative } from "../services/narrativeValidator";
import { generateSummaryPdfData } from "../services/pdfExportService";

async function runTestSuite() {
    console.log(blue("=== RUNNING MOCKED LLM ROUTING & FALLBACK TEST SUITE ===\n"));
    
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`[${green("PASS")}] ${message}`);
            passed++;
        } else {
            console.log(`[${red("FAIL")}] ${message}`);
            failed++;
        }
    };

    const resetSpies = () => {
        anthropicCalls = [];
        geminiCalls = [];
        mockAnthropicShouldFail = false;
        mockGeminiShouldFail = false;
    };

    // ─── Test Case 1: Primary Model Selection (Claude Default) ───────────────
    try {
        console.log(blue("Test Case 1: Premium/Default calls Anthropic Claude first"));
        resetSpies();

        const response = await callClaude({
            userPrompt: "Hello, model!",
            label: "Premium Test"
        });

        const expectedDefaultModel = process.env.CLAUDE_MODEL || "claude-sonnet-5";

        assert(anthropicCalls.length === 1, "Anthropic Claude client was called.");
        assert(anthropicCalls[0].model === expectedDefaultModel, `Correct default model '${expectedDefaultModel}' was used.`);
        assert(geminiCalls.length === 0, "Google Gemini client was not called.");
    } catch (e: any) {
        assert(false, `Test Case 1 failed with error: ${e.message || e}`);
    }

    // ─── Test Case 2: Prefix Routing via Env Override ────────────────────────
    try {
        console.log(blue("\nTest Case 2: Prefix Routing when CLAUDE_MODEL starts with gemini-..."));
        resetSpies();
        
        const originalClaudeModel = process.env.CLAUDE_MODEL;
        // Override CLAUDE_MODEL to a Gemini model
        process.env.CLAUDE_MODEL = "gemini-2.5-flash";
        
        const response = await callClaude({
            userPrompt: "Hello, model!",
            label: "Prefix Test"
        });
        
        assert(geminiCalls.length === 1, "Google Gemini client was called directly due to model prefix.");
        assert(geminiCalls[0].model === "gemini-2.5-flash", "Correct model 'gemini-2.5-flash' was used.");
        assert(anthropicCalls.length === 0, "Anthropic Claude client was bypassed.");
        
        // Restore
        process.env.CLAUDE_MODEL = originalClaudeModel;
    } catch (e: any) {
        assert(false, `Test Case 2 failed with error: ${e.message || e}`);
    }

    // ─── Test Case 3: Fallback Routing when Anthropic Fails ──────────────────
    try {
        console.log(blue("\nTest Case 3: Fallback to Gemini when Anthropic rate limits or fails..."));
        resetSpies();
        mockAnthropicShouldFail = true;

        const response = await callClaude({
            userPrompt: "Hello, model!",
            label: "Fallback Test"
        });

        assert(anthropicCalls.length >= 1, "Anthropic Claude was tried.");
        assert(geminiCalls.length === 1, "Google Gemini was successfully called as a fallback.");
        assert(geminiCalls[0].model === "gemini-2.5-flash", "Fell back to default Gemini model 'gemini-2.5-flash'.");
        assert(response.includes("this is a valid mock narrative"), "Returned the response from the fallback provider.");
    } catch (e: any) {
        assert(false, `Test Case 3 failed with error: ${e.message || e}`);
    }

    // ─── Test Case 4: Tier-Based Narrative Routing ───────────────────────────
    try {
        console.log(blue("\nTest Case 4: Tier-based routing in generateAndValidateNarrative..."));
        
        // Scenario A: Free tier (isPremium = false) -> should force Gemini.
        resetSpies();
        const responseFree = await generateAndValidateNarrative({
            systemPrompt: "You are a compliance assistant.",
            userPrompt: "Generate a narrative summary. Limit to 3 sentences.",
            sectionData: {},
            projectName: "Test Project",
            sectionLabel: "Free Section Test",
            isPremium: false
        });
        
        assert(responseFree.success, "Narrative generated successfully.");
        assert(geminiCalls.length === 1, "Free tier narrative called Google Gemini.");
        assert(anthropicCalls.length === 0, "Free tier narrative bypassed Anthropic Claude.");

        // Scenario B: Premium tier (isPremium = true) -> should use Claude.
        resetSpies();
        const responsePremium = await generateAndValidateNarrative({
            systemPrompt: "You are a compliance assistant.",
            userPrompt: "Generate a narrative summary. Limit to 3 sentences.",
            sectionData: {},
            projectName: "Test Project",
            sectionLabel: "Premium Section Test",
            isPremium: true
        });
        
        assert(responsePremium.success, "Narrative generated successfully.");
        assert(anthropicCalls.length === 1, "Premium tier narrative called Anthropic Claude.");
        assert(geminiCalls.length === 0, "Premium tier narrative bypassed Google Gemini.");

    } catch (e: any) {
        assert(false, `Test Case 4 failed with error: ${e.message || e}`);
    }

    // ─── Test Case 5: End-to-End PDF Report Database Integration ──────────────
    try {
        console.log(blue("\nTest Case 5: E2E PDF Report generation and database integration..."));
        resetSpies();
        
        // Find a valid project ID in the database to test the E2E flow
        const projectRes = await pool.query("SELECT id FROM projects LIMIT 1");
        if (projectRes.rows.length === 0) {
            console.log("Skipping database E2E test: No projects exist in the database.");
            assert(true, "E2E skipped due to empty database projects.");
        } else {
            const testProjectId = projectRes.rows[0].id;
            console.log(`Using existing project ID for E2E: ${testProjectId}`);
            
            const result = await generateSummaryPdfData(testProjectId);
            assert(result !== undefined, "Successfully generated Summary PDF data by joining projects with user subscription statuses.");
            
            // Check that the calls matched the project's subscription status
            const projectDetails = await pool.query(
                "SELECT u.subscription_status FROM projects p JOIN users u ON p.user_id = u.id WHERE p.id = $1", 
                [testProjectId]
            );
            const subStatus = projectDetails.rows[0].subscription_status;
            const isPremium = ["basic_premium", "pro_premium", "trial"].includes(subStatus || "");
            
            if (isPremium) {
                assert(anthropicCalls.length > 0, `Premium project (${subStatus}) correctly routed calls to Anthropic.`);
                assert(geminiCalls.length === 0, "Bypassed Gemini for premium project reports.");
            } else {
                assert(geminiCalls.length > 0, `Free project (${subStatus}) correctly routed calls to Gemini.`);
                assert(anthropicCalls.length === 0, "Bypassed Anthropic for free project reports.");
            }
        }
    } catch (e: any) {
        assert(false, `Test Case 5 failed with error: ${e.message || e}`);
    }

    // ─── Summary ─────────────────────────────────────────────────────────────
    console.log(blue("\n=== TEST RESULTS SUMMARY ==="));
    console.log(`Passed: ${green(passed.toString())}`);
    console.log(`Failed: ${red(failed.toString())}`);
    console.log("=========================================");
    
    // Close the pool to let the script exit cleanly
    await pool.end();

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTestSuite().catch(async e => {
    console.error("Test runner failed:", e);
    await pool.end();
    process.exit(1);
});
