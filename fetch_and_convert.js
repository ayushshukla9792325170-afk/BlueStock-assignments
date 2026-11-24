/**
 * fetch_and_convert.js
 *
 * 1. Calls the JSONPlaceholder /users API
 * 2. Saves the raw JSON response
 * 3. Inspects and summarises the data
 * 4. Converts it to CSV for analysis
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_URL = "https://jsonplaceholder.typicode.com/users";
const OUT_DIR = __dirname;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    });
  });
}

/** Flatten nested objects into dot-notation keys */
function flattenObject(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

/** Convert an array of objects to CSV string */
function toCSV(data) {
  const flattened = data.map((row) => flattenObject(row));
  const headers = [...new Set(flattened.flatMap((r) => Object.keys(r)))];

  const escape = (val) => {
    const str = val == null ? "" : String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const lines = [
    headers.map(escape).join(","),
    ...flattened.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n") + "\n";
}

async function main() {
  console.log(`\n📡  Fetching data from ${API_URL} ...\n`);
  const data = await fetchJSON(API_URL);

  // ---- Save raw JSON ----
  const jsonPath = path.join(OUT_DIR, "data", "users_raw.json");
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`✅  Raw JSON saved  → ${jsonPath}`);

  // ---- Inspect the response ----
  console.log(`\n🔍  Inspection Summary`);
  console.log(`    Records : ${data.length}`);
  console.log(`    Type    : Array of Objects`);

  const sample = data[0];
  const flat = flattenObject(sample);
  console.log(`    Fields  : ${Object.keys(flat).length} (after flattening nested objects)`);
  console.log(`    Columns :`);
  for (const [key, value] of Object.entries(flat)) {
    console.log(`      - ${key} (${typeof value})  e.g. ${JSON.stringify(value)}`);
  }

  // ---- Convert to CSV ----
  const csv = toCSV(data);
  const csvPath = path.join(OUT_DIR, "data", "users.csv");
  fs.writeFileSync(csvPath, csv);
  console.log(`\n✅  CSV saved        → ${csvPath}`);
  console.log(`    Rows (excl. header): ${data.length}`);
  console.log(`\n--- First 3 CSV lines ---`);
  csv.split("\n").slice(0, 4).forEach((l) => console.log("  " + l));
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
