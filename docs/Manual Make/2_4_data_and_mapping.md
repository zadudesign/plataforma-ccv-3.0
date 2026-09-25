# 2.4. Data & Mapping

Building effective scenarios requires understanding how data is structured, converted, mapped, and filtered across modules.

---

## 2.4.1. Item Data Types

Make supports several distinct data types for module fields:
- **Text (String)**: Letters, numbers, and special characters.
- **Number**: Numerical values (integers or floats), validated for range limits where applicable.
- **Boolean**: Logical `true` / `false` (Yes/No) options.
- **Date and time**: Specific calendar dates and timestamps (supports ISO 8601 text).
- **Buffer (Binary data)**: Raw file data or encoded content.
- **Collection**: A key-value group containing various data types (like a box with labeled items).
- **Array**: An ordered list of elements of the same data type or collections.

---

## 2.4.2. Type Coercion

When a module receives a data type different from what it expects, Make attempts automatic conversion (**Type coercion**):
- *Text expected*: Numbers, booleans, dates (ISO 8601), and simple arrays convert to string automatically.
- *Boolean expected*: `1` or non-empty strings evaluate to `true` (`Yes`), `0` or `"false"` evaluate to `false` (`No`).
- *Array expected*: Non-array values are wrapped into a single-element array.
- If automatic conversion is impossible, Make throws a validation error.

---

## 2.4.3. Mapping

### What is mapping?
Mapping is the process of dragging or selecting dynamic values from preceding modules into the fields of a subsequent module.

### How to Map
- Click any field in a module setting to open the mapping panel.
- To populate the mapping panel with actual output structure, run the scenario/module once so Make learns the output schema.

---

## 2.4.4. Filtering

- Filters are placed on the links connecting two modules.
- A filter checks whether bundles fulfill specified conditions (using text, number, date, or logical operators combined with AND/OR rules).
- Bundles meeting the filter criteria pass through; non-matching bundles are stopped without causing a scenario error.

---

## 2.4.5. Mapping Arrays & Working with Files

### Mapping Arrays
- Use functions like `map()` to extract specific item values from an array of collections.

### Working with Files
- File-handling modules output two main items: **File Name** and **Data** (binary buffer).
- When uploading or moving files between services (e.g., Google Drive, Dropbox), map both the file name and the binary data buffer.
