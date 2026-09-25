# 2.3. Apps & Modules

Apps and modules are the fundamental building blocks used to create automated scenarios in Make.

---

## 2.3.1. Introduction to Make Apps

### What are Make apps?
Make apps are integrations of third-party APIs or built-in tools. Each app consists of specific modules designed to perform actions or fetch data.

### Types of Make Apps
- **Verified apps**: Apps built and verified by Make developers or verified third parties.
- **Community apps**: Apps developed by partners and community power users.
- **Custom apps**: Apps created by users via the developer web interface (available as Private apps within an organization or Public apps via invite link).

---

## 2.3.2. Types of Modules

Modules act like building blocks in a scenario. Each module performs a specific function:

1. **Triggers**: Watch for events or retrieve new data. Can be **Instant triggers** (webhooks) or **Scheduled triggers**.
2. **Searches**: Search for objects based on conditions. Most searches return up to 3,200 objects or 5 MB of data per run.
3. **List modules**: Retrieve all data from a service without filtering.
4. **Actions**: Process, transform, create, update, or delete data retrieved from a service.
5. **Tools**: Built-in utilities that do not require external API connections (e.g., Iterator, Aggregator, Router, Data store, Compose string, Set variable).

---

## 2.3.3. Module Settings & Builder Status Indicators

### Settings
- **Standard fields**: Frequently used required or optional fields.
- **Advanced fields**: Complex technical settings toggled via *Advanced settings*.
- **Map toggle**: Enables mapping dynamic items from preceding modules into the field.

### Builder Status Indicators
When configuring modules in the Scenario Builder:
- **Checkmark**: All required fields are filled correctly and changes are saved.
- **Black star**: All fields filled correctly, but changes are not saved yet.
- **Exclamation point (!)**: Invalid input or required field missing.
- **Grey star**: Module settings have not been opened yet.

---

## 2.3.4. Updating Legacy Modules

- As external services update their Application Programming Interfaces (APIs), older app versions become deprecated.
- Deprecated modules are marked as **Legacy modules**.
- Users should replace legacy modules with updated module versions to ensure scenario stability and access new API features.
