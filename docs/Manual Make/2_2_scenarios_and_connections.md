# 2.2. Scenarios & Connections

In Make, scenarios are automated workflows that connect applications and move data between them automatically.

---

## 2.2.1. Connect an Application

### What are connections?
To allow your scenario to send and receive data from third-party services (such as Airtable, Gmail, Google Sheets, Dropbox, etc.), you must create a connection between Make and that service.

### Connection Types
1. **Standard connections**: The most common type, created using account credentials or OAuth authorization.
2. **Dynamic connections**: An Enterprise-level feature allowing a variable containing multiple connections to be chosen during scenario execution.

### Creating and Managing Connections
- Connections are created inside the Scenario Builder when setting up a module.
- All users within a team can reuse created connections across modules.
- Credentials can require standard OAuth login or specific parameters (API Keys, Client ID/Secret, Username/Password).
- If no pre-built integration exists, you can connect using the **HTTP app**.
- **Updating credentials**: Updating an existing connection automatically updates all modules using it. Ensure updated API keys/OAuth tokens contain all required scopes.
- **Verification**: Check connection status in the left sidebar under **Credentials > Connections > Verify**.

---

## 2.2.2. Scenario Execution & Management

### Execution Flow
1. A scenario starts with a **Trigger module** responding to an event it watches for.
2. If bundles (data) are returned, they pass to subsequent modules one by one.
3. If no bundles are returned by the trigger, execution stops immediately.
4. If all bundles process without unhandled errors, the scenario run is marked as **Successful**.

### Cloning Scenarios
- Scenarios can be cloned within the same team or to another team within the organization.
- Cloning copies module settings and connections (webhooks may need re-configuration).

### Blueprints
- Scenario configurations can be exported as a JSON file (`.json`, max 2 MB) or copied to the clipboard.
- Blueprints can be imported into Make to duplicate scenarios or backed up for future use.

### Scenario Templates
- Pre-configured workflows available publicly or shared within team workspace templates.

### Scenario Sharing
- Scenarios can be shared publicly via a shareable link or social media.
- Public scenario pages include the title, description, interactive preview, additional info, and author profile.
- Viewers can click **+ Use this scenario** to copy the workflow into their own Make account.
- Shared link contents include modules, settings, metadata, and notes (API keys, passwords, and connection credentials are omitted for security).
