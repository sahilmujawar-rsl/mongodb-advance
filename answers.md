# MongoDB Advanced Assignment: Answers

## Task 5.2: `explain("executionStats")`

Query:

```javascript
db.employees
  .find({ departmentId: 10 })
  .sort({ name: 1 })
  .explain("executionStats")
```

Values recorded from the actual output on my local machine:

| Metric | Actual value |
|---|---|
| Winning plan stage | `IXSCAN` |
| `nReturned` | `2` |
| `totalDocsExamined` | `2` |
| `totalKeysExamined` | `2` |

## Task 7: MongoDB Advanced Concepts (MCQs)

| Q | Answer | Explanation |
|---|---|---|
| 1 | **B** | Schema validation rejects documents that do not follow the required fields or data types. |
| 2 | **B** | `$elemMatch` checks that multiple conditions match the same array object. |
| 3 | **C** | `arrayFilters` update only the array elements that match a condition. |
| 4 | **A** | `bulkWrite()` sends several write operations together. |
| 5 | **C** | `$lookup` joins documents from another collection. |
| 6 | **B** | `IXSCAN` means MongoDB used an index. |
| 7 | **C** | `abortTransaction()` rolls back uncommitted transaction changes. |
| 8 | **B** | `w: "majority"` waits for a majority of voting data-bearing replica-set members to acknowledge the write. |
| 9 | **C** | When a Primary fails, eligible members hold an election for a new Primary. |
| 10 | **B** | A good shard key is high-cardinality, distributes traffic, and matches common queries. |
| 11 | **A** | Change Streams let an application listen for inserts, updates, replacements, and deletes. |
| 12 | **C** | Use TLS, restricted network access, and least-privilege credentials. |