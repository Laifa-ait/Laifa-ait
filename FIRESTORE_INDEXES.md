# Olmart Firestore Indexes Configuration — Real Estate (Olma Immo)

This document specifies the required composite indexes for querying the `properties` collection in Olma Immo.

## 🏛️ Properties Collection Composite Indexes

To support complex queries (such as state-based filtering, geolocation geohash searches, and wilaya partition filtering) without hitting Firestore limits or index errors, the following composite indexes must be deployed.

---

### Index 1: Status-Wilaya-Geohash Queries
* **Collection ID**: `real_estate_properties` (or `properties` as mapped in database schemas)
* **Query Scope**: Collection
* **Fields**:
  | Field Path | Order |
  |---|---|
  | `status` | Ascending |
  | `location.wilaya` | Ascending |
  | `location.geohash` | Ascending |

* **Use Case**: Filtering active properties within a specific Algerian Wilaya, and performing range/equality queries on geohashes for regional maps and localized listing results.

---

### Index 2: Status-Geohash Queries
* **Collection ID**: `real_estate_properties` (or `properties` as mapped in database schemas)
* **Query Scope**: Collection
* **Fields**:
  | Field Path | Order |
  |---|---|
  | `status` | Ascending |
  | `location.geohash` | Ascending |

* **Use Case**: Nationwide map/geospatial range query based purely on coordinate bounding boxes (geohashes) filtered by listing status.

---

## 🛠️ How to deploy the indexes

### Method A: Firebase CLI
You can add these definitions into the local `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "real_estate_properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "location.wilaya", "order": "ASCENDING" },
        { "fieldPath": "location.geohash", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "real_estate_properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "location.geohash", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then run the deployment command:
```bash
firebase deploy --only firestore:indexes
```

### Method B: Firebase Console Link
If a query fails during development, Firestore will output a direct link in the application logs:
1. Click the URL provided in the console error.
2. It will automatically populate the exact configuration in the Google Cloud / Firebase console.
3. Click **Create Index** and wait for provisioning (takes ~2-5 minutes).
