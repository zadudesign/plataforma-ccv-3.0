# 2.1. Credits & Operations

In Make, credits and operations are related but distinct concepts. Operations count the activities performed in your scenarios, while credits are what you pay for those activities. Understanding both helps you better manage your Make usage.

---

## 2.1.1. Credits

### What are credits?
Credits are the currency you buy and consume to use Make. Only features triggered by scenario runs (apps, modules, and some in-app features) or the AI agent's chat use credits. Your credit usage can vary based on the number of operations, tokens, and other usage-based factors.

### Credit Usage Types
Credit usage in Make is either fixed or dynamic:
- **Fixed credit usage**: Apps use a set number of credits per run.
- **Dynamic credit usage**: Some AI and advanced apps use a varying number of credits per run based on actual consumption (such as token consumption, file size, page count, or processing time).

### How Credits are Charged by App Type
- **Non-AI apps**: 1 operation equals 1 credit (unless tagged with a specific fixed rate like 2 or 10 credits).
- **Third-party AI apps with custom connection** (e.g., OpenAI, Anthropic Claude, Gemini): You pay Make for credits based on operations (1 operation = 1 credit), and pay your AI provider directly for token usage.
- **Built-in AI apps & Automatic AI provider connections**: Make connects to the AI provider automatically. Credits are consumed based on tokens, operations, and other usage-based factors. Key features using automatic or built-in connections include:
  - Make AI Agents
  - Make AI Toolkit
  - Make AI Web Search
  - Make AI Content Extractor
  - The Simple Text Prompt module in OpenAI, Google Gemini AI, Groq, and Anthropic Claude apps.

---

## 2.1.2. Operations

### What are operations?
An operation is a single module run to process data or check for new data. When you run a scenario, each module runs one or more times, resulting in 1 or more operations.

### Operations and Bundles
A module's number of operations depends on the number of bundles it processes:
- **Standard modules**: Process each bundle separately. For example, sending 5 emails in Gmail = 5 operations.
- **Trigger modules (Exception)**: Run once to check for or retrieve data, regardless of the number of bundles returned (e.g., Google Sheets > Watch New Rows checking for new rows = 1 operation).
- **Multiplying effect**: Bundles returned by earlier modules cause subsequent modules to run once for each bundle. For instance, a trigger returning 10 bundles followed by 3 modules results in 31 total operations (1 + 10 + 10 + 10).

### What are bundles?
Bundles are containers of related data items (such as a contact containing name, email, etc.).
- **Input bundles**: Data a module receives.
- **Output bundles**: Data a module outputs after processing.

### Viewing Operations and Credits
In the Scenario Builder:
- Click the white bubble above any module after a run to expand and inspect individual operations and processed bundles.
- The checkmark icon indicates the operation count.
- The coin icon indicates the credits consumed by those operations.
