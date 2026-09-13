# Luật kết hợp cho đề xuất sản phẩm dựa trên bảng chi tiết đơn hàng
import json
import pickle
import re
from pathlib import Path

import pandas as pd
import mysql.connector
import yaml
from mlxtend.frequent_patterns import apriori
from mlxtend.frequent_patterns import association_rules

# ======================================
# CONFIG
# ======================================

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent.parent
CONFIG_PATH = REPO_ROOT / "src" / "main" / "resources" / "application.yaml"
OUTPUT_DIR = REPO_ROOT / "src" / "main" / "resources" / "recommendation" / "product"
OUTPUT_JSON = OUTPUT_DIR / "association_rules.json"
OUTPUT_MODEL = OUTPUT_DIR / "model.pkl"
MIN_SUPPORT = 0.01
MIN_CONFIDENCE = 0.10
SQL_QUERY = """
SELECT order_id, product_id
FROM tbl_order_details
ORDER BY created_date DESC
LIMIT 50
"""

# ======================================
# HELPERS
# ======================================

def load_db_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        config = yaml.safe_load(f)

    ds = config["spring"]["datasource"]
    url = ds["url"]
    match = re.search(r"jdbc:mysql://([^:/?]+)(?::(\d+))?/([^?]+)", url)
    if not match:
        raise ValueError(f"Invalid JDBC URL: {url}")

    host = match.group(1)
    port = int(match.group(2) or 3306)
    database = match.group(3)

    return {
        "host": host,
        "port": port,
        "database": database,
        "user": ds["username"],
        "password": ds["password"],
        "charset": "utf8mb4",
        "use_unicode": True,
    }


def fetch_data():
    db_config = load_db_config()
    conn = mysql.connector.connect(**db_config)
    try:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(SQL_QUERY)
            rows = cursor.fetchall()
    finally:
        conn.close()

    if not rows:
        raise Exception("No rows returned from the database query.")

    df = pd.DataFrame(rows)
    required_columns = {"order_id", "product_id"}
    if not required_columns.issubset(df.columns):
        raise Exception(f"Query must return columns: {required_columns}")

    return df


def ensure_output_dir():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


print("Loading dataset from MySQL...")

df = fetch_data()
ensure_output_dir()

print(f"Rows: {len(df)}")
print(df.head())

# ======================================
# CREATE BASKET
# ======================================

print("\nCreating basket...")

basket = (
    df.groupby(["order_id", "product_id"])
      .size()
      .unstack(fill_value=0)
)

# Pandas 3.x compatible
basket = (basket > 0)

print(f"Basket shape: {basket.shape}")

# ======================================
# APRIORI
# ======================================

print("\nTraining Apriori...")

frequent_itemsets = apriori(
    basket,
    min_support=MIN_SUPPORT,
    use_colnames=True
)

print(
    f"Frequent itemsets found: {len(frequent_itemsets)}"
)

if frequent_itemsets.empty:
    raise Exception(
        "No frequent itemsets found. "
        "Try reducing MIN_SUPPORT."
    )

# ======================================
# RULE GENERATION
# ======================================

print("\nGenerating rules...")

rules = association_rules(
    frequent_itemsets,
    metric="confidence",
    min_threshold=MIN_CONFIDENCE
)

if rules.empty:
    fallback_confidence = 0.01
    print(
        f"No rules found at confidence {MIN_CONFIDENCE}. "
        f"Retrying with fallback confidence {fallback_confidence}..."
    )
    rules = association_rules(
        frequent_itemsets,
        metric="confidence",
        min_threshold=fallback_confidence
    )

if rules.empty:
    print(
        "Still no association rules found after fallback. "
        "Saving empty rule set."
    )
else:
    rules = rules.sort_values(
        by=["confidence", "lift"],
        ascending=False
    )

print(f"Rules found: {len(rules)}")

# ======================================
# EXPORT JSON FOR SPRING BOOT
# ======================================

print("\nExporting JSON...")

json_rules = []

for _, row in rules.iterrows():

    json_rules.append({
        "antecedent": sorted(
            [int(x) for x in row["antecedents"]]
        ),

        "consequent": sorted(
            [int(x) for x in row["consequents"]]
        ),

        "confidence": round(
            float(row["confidence"]),
            6
        ),

        "support": round(
            float(row["support"]),
            6
        ),

        "lift": round(
            float(row["lift"]),
            6
        )
    })

with open(
    OUTPUT_JSON,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        json_rules,
        f,
        ensure_ascii=False,
        indent=4
    )

print(
    f"JSON saved -> {OUTPUT_JSON}"
)

# ======================================
# SAVE MODEL
# ======================================

print("\nSaving model...")

model = {
    "frequent_itemsets": frequent_itemsets,
    "rules": rules,
    "min_support": MIN_SUPPORT,
    "min_confidence": MIN_CONFIDENCE
}

with open(OUTPUT_MODEL, "wb") as f:
    pickle.dump(model, f)
    
print( f"Model saved -> {OUTPUT_MODEL}" )

# ======================================
# PREVIEW
# ======================================

print("\nTop 10 rules:\n")

for rule in json_rules[:10]:
    print(rule)

print("\nTraining completed successfully.")