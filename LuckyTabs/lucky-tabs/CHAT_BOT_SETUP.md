# AI Chat Bot Setup Instructions

## Firebase Function Setup (Required for LLM features)

1. **Deploy the box advisor function:**
   ```bash
   cd functions
   firebase functions:secrets:set OPENAI_API_KEY
   # Enter your OpenAI API key when prompted
   firebase deploy --only functions:boxAdvisor
   ```

2. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/account/api-keys
   - Create a new secret key
   - Use it in the Firebase secret setup above

3. **Test the API endpoint:**
   - After deployment, the function will be available at:
   - `https://<region>-<project-id>.cloudfunctions.net/boxAdvisor`
   - Update the client code if your URL differs from `/api/box-advisor`

## Client Configuration

The chat bot will work with rule-based responses even without the LLM setup. The hybrid approach:

- **Fast rule-based responses** for common queries (always works)
- **LLM-enhanced responses** for complex questions (requires Firebase Function)

## Architecture Benefits

✅ **Security**: API keys are server-side only  
✅ **Performance**: 90% of queries use fast local rules  
✅ **Reliability**: Always works, even if LLM is down  
✅ **Cost Control**: Only complex queries use paid API  
✅ **Structured Data**: JSON responses for better UI integration  

## Troubleshooting

- Chat bot shows generic responses? LLM function may be down
- "AI Analysis" prefix missing? Check Firebase Function logs
- Rule-based responses work? System is functioning normally

## Usage Examples

**Rule-based (instant):**
- "Which box has the best odds?"
- "What's the safest box?"
- "Compare my boxes"

**LLM-enhanced (if available):**
- "Explain why this box is better for beginners"
- "What's your gambling strategy for tonight?"
- "Help me understand risk vs reward"