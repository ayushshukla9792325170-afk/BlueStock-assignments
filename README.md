# API Data Analysis

Fetch data from a public REST API, inspect the JSON response, and convert it to CSV for analysis.

## Quick Start

```bash
node fetch_and_convert.js
```

This will:
1. Call the [JSONPlaceholder /users](https://jsonplaceholder.typicode.com/users) API
2. Save the raw JSON to `data/users_raw.json`
3. Print an inspection summary (record count, field names, types)
4. Flatten nested objects and export to `data/users.csv`

## Project Structure

```
api-data-analysis/
├── README.md
├── .gitignore
├── fetch_and_convert.js   # Main script
└── data/
    ├── users_raw.json     # Raw API response
    └── users.csv          # Flattened CSV output
```

## Version History

Maintained via Git. Each meaningful change is committed with a descriptive message.
