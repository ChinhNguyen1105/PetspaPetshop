import json
import pickle


JSON_FILE = "association_rules.json"
MODEL_FILE = "model.pkl"


# ==========================
# LOAD JSON
# ==========================

with open(JSON_FILE, "r", encoding="utf-8") as f:
    json_rules = json.load(f)

print(f"Loaded JSON rules: {len(json_rules)}")


# ==========================
# LOAD MODEL
# ==========================

with open(MODEL_FILE, "rb") as f:
    model = pickle.load(f)

rules_df = model["rules"]

print(f"Loaded PKL rules: {len(rules_df)}")


# ==========================
# JSON RECOMMEND
# ==========================

def recommend_from_json(products):

    result = []

    product_set = set(products)

    for rule in json_rules:

        antecedent = set(rule["antecedent"])

        if antecedent.issubset(product_set):

            for item in rule["consequent"]:

                if item not in product_set:

                    result.append({
                        "productId": item,
                        "confidence": rule["confidence"]
                    })

    result.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    return result


# ==========================
# PKL RECOMMEND
# ==========================

def recommend_from_model(products):

    result = []

    product_set = set(products)

    for _, row in rules_df.iterrows():

        antecedent = set(
            int(x)
            for x in row["antecedents"]
        )

        if antecedent.issubset(product_set):

            consequents = [
                int(x)
                for x in row["consequents"]
            ]

            for item in consequents:

                if item not in product_set:

                    result.append({
                        "productId": item,
                        "confidence": float(
                            row["confidence"]
                        )
                    })

    result.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    return result


# ==========================
# TEST LOOP
# ==========================

while True:

    raw = input(
        "\nInput product ids (1,2,3) or q: "
    )

    if raw.lower() == "q":
        break

    try:

        products = [
            int(x.strip())
            for x in raw.split(",")
        ]

        print("\nInput:")
        print(products)

        json_result = recommend_from_json(
            products
        )

        model_result = recommend_from_model(
            products
        )

        print("\n========== JSON ==========")

        for item in json_result[:20]:
            print(item)

        print("\n========== MODEL ==========")

        for item in model_result[:20]:
            print(item)

        # Compare

        same = (
            [
                (
                    x["productId"],
                    round(x["confidence"], 6)
                )
                for x in json_result
            ]
            ==
            [
                (
                    x["productId"],
                    round(x["confidence"], 6)
                )
                for x in model_result
            ]
        )

        print("\n========== CHECK ==========")

        if same:
            print("MATCH")
        else:
            print("MISMATCH")

    except Exception as e:
        print("ERROR:", e)