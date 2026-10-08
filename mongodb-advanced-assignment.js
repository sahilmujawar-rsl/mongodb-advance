// Task 1: Schema Validation and Data Creation

// Step 1: Select the company database.
use company_advance

// Step 2: Create the employees collection with schema validation.
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "departmentId", "experience", "active"],
      properties: {
        name: { bsonType: "string" },
        departmentId: { bsonType: "int" },
        experience: { bsonType: "int" },
        active: { bsonType: "bool" },
      },
    },
  },
});

show dbs

// Step 3: Insert the three starting employee documents.
db.employees.insertMany([
  {
    _id: 1,
    name: "John",
    departmentId: 10,
    skills: ["Java", "MongoDB"],
    experience: 4,
    active: true,
    certifications: [
      { name: "MongoDB", status: "Expired", expiryYear: 2026 },
    ],
  },
  {
    _id: 2,
    name: "Alice",
    departmentId: 10,
    skills: ["Python", "MongoDB"],
    experience: 6,
    active: true,
    certifications: [
      { name: "MongoDB", status: "Active", expiryYear: 2028 },
    ],
  },
  {
    _id: 3,
    name: "David",
    departmentId: 20,
    skills: ["Communication"],
    experience: 3,
    active: false,
    certifications: [
      { name: "Communication", status: "Active", expiryYear: 2027 },
    ],
  },
]);

// Step 4: Attempt to insert a document that violates the validator.
db.employees.insertOne({
  _id: 99,
  name: 123,
  departmentId: "HR",
  experience: "one",
  active: "yes",
});

// Verify the employee documents.
db.employees.find();

// Task 2: Advanced Array Queries and Updates

// 2.1 Find an employee with a MongoDB certification whose status is Active.
db.employees.find({
  certifications: {
    $elemMatch: { name: "MongoDB", status: "Active" },
  },
});

// 2.2 Change John's MongoDB certification status using the positional operator.
db.employees.updateOne(
  { name: "John", "certifications.name": "MongoDB" },
  { $set: { "certifications.$.status": "Active" } },
);

// 2.3 Set matching certification elements to Renewal Due.
db.employees.updateMany(
  {},
  { $set: { "certifications.$[cert].status": "Renewal Due" } },
  {
    arrayFilters: [
      { "cert.name": "MongoDB", "cert.expiryYear": { $lt: 2027 } },
    ],
  },
);

// Verify the final certification statuses.
db.employees.find({name:"John"});

// Task 3: Bulk Write Operations

// Update John and Alice, then insert Emma in one bulkWrite() call.
db.employees.bulkWrite([
  {
    updateOne: {
      filter: { name: "John" },
      update: { $inc: { experience: 1 } },
    },
  },
  {
    updateOne: {
      filter: { name: "Alice" },
      update: { $set: { active: false } },
    },
  },
  {
    insertOne: {
      document: {
        _id: 4,
        name: "Emma",
        departmentId: 20,
        skills: ["Excel"],
        experience: 2,
        active: true,
        certifications: [
          { name: "Excel", status: "Active", expiryYear: 2026 },
        ],
      },
    },
  },
]);

// Verify the bulk write results.
db.employees.find();

// Task 4: Advanced Aggregation

// Step 1: Create the departments collection and insert its documents.
db.departments.insertMany([
  { _id: 10, name: "Engineering" },
  { _id: 20, name: "HR" },
]);

// 4.1 Join employees with departments and return sorted employee names.
db.employees.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "departmentId",
      foreignField: "_id",
      as: "department",
    },
  },
  { $unwind: "$department" },
  {
    $project: {
      _id: 0,
      name: 1,
      departmentName: "$department.name",
    },
  },
  { $sort: { name: 1 } },
]);

// 4.2 Count employees for each skill and sort by count, then skill name.
db.employees.aggregate([
  { $unwind: "$skills" },
  {
    $group: {
      _id: "$skills",
      employeeCount: { $sum: 1 },
    },
  },
  { $sort: { employeeCount: -1, _id: 1 } },
]);

// 4.3 Return active employee names and their count using $facet.
db.employees.aggregate([
  { $match: { active: true } },
  {
    $facet: {
      employees: [
        { $project: { _id: 0, name: 1 } },
        { $sort: { name: 1 } },
      ],
      summary: [{ $count: "totalActiveEmployees" }],
    },
  },
]);

// Task 5: Indexing and Query Performance

// 5.1 Create and verify the compound index.
db.employees.createIndex({ departmentId: 1, name: 1 });
db.employees.getIndexes();

// 5.2 Run the required query with execution statistics.
db.employees
  .find({ departmentId: 10 })
  .sort({ name: 1 })
  .explain("executionStats");

// 5.2 Recorded explain output from the mongosh session:
/*
company_advance> db.employees
| .find({ departmentId: 10 })
| .sort({ name: 1 })
| .explain("executionStats");
{
  explainVersion: '1',
  queryPlanner: {
    namespace: 'company_advance.employees',
    parsedQuery: { departmentId: { '$eq': 10 } },
    indexFilterSet: false,
    queryHash: 'E5A42DED',
    planCacheShapeHash: 'E5A42DED',
    planCacheKey: 'D43CA850',
    optimizationTimeMillis: 0,
    optimizationTimeMicros: 288,
    maxIndexedOrSolutionsReached: false,
    maxIndexedAndSolutionsReached: false,
    maxScansToExplodeReached: false,
    prunedSimilarIndexes: false,
    winningPlan: {
      isCached: false,
      stage: 'FETCH',
      nss: 'company_advance.employees',
      inputStage: {
        stage: 'IXSCAN',
        nss: 'company_advance.employees',
        keyPattern: { departmentId: 1, name: 1 },
        indexName: 'departmentId_1_name_1',
        isMultiKey: false,
        multiKeyPaths: { departmentId: [], name: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { departmentId: [ '[10, 10]' ], name: [ '[MinKey, MaxKey]' ] }
      }
    },
    rejectedPlans: []
  },
  executionStats: {
    executionSuccess: true,
    nReturned: 2,
    executionTimeMillis: 0,
    executionTimeMicros: 477,
    totalKeysExamined: 2,
    totalDocsExamined: 2,
    executionStages: {
      isCached: false,
      stage: 'FETCH',
      nReturned: 2,
      executionTimeMillisEstimate: 0,
      works: 3,
      advanced: 2,
      needTime: 0,
      needYield: 0,
      saveState: 0,
      restoreState: 0,
      isEOF: 1,
      nss: 'company_advance.employees',
      docsExamined: 2,
      alreadyHasObj: 0,
      inputStage: {
        stage: 'IXSCAN',
        nReturned: 2,
        executionTimeMillisEstimate: 0,
        works: 3,
        advanced: 2,
        needTime: 0,
        needYield: 0,
        saveState: 0,
        restoreState: 0,
        isEOF: 1,
        nss: 'company_advance.employees',
        keyPattern: { departmentId: 1, name: 1 },
        indexName: 'departmentId_1_name_1',
        isMultiKey: false,
        multiKeyPaths: { departmentId: [], name: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { departmentId: [ '[10, 10]' ], name: [ '[MinKey, MaxKey]' ] },
        keysExamined: 2,
        seeks: 1,
        dupsTested: 0,
        dupsDropped: 0,
        peakTrackedMemBytes: 0
      }
    }
  },
  queryShapeHash: 'F97540F1DD3FFABEF64399D3895E64BACBF8FF3853D89F8CFD2205B9E2DE51D8',
  command: {
    find: 'employees',
    filter: { departmentId: 10 },
    sort: { name: 1 },
    '$db': 'company_advance'
  },
  serverInfo: {
    host: 'Sahils-Mac-mini.local',
    port: 27017,
    version: '9.0.2',
    gitVersion: 'c4d309807b94ac30edcca32e35e88a9598eadfc8'
  },
  serverParameters: {
    internalQueryFacetMaxOutputDocSizeBytes: 104857600,
    internalLookupStageIntermediateDocumentMaxSizeBytes: 104857600,
    internalQueryProhibitBlockingMergeOnMongoS: 0,
    internalQueryFrameworkControl: 'trySbeRestricted',
    internalQueryPlannerIgnoreIndexWithCollationForRegex: 1
  },
  ok: 1
}
*/

// 5.3 Create a session and its TTL index.
db.createCollection("sessions");

db.sessions.insertOne({
  _id: 1,
  userName: "John",
  expiresAt: new Date(Date.now() + 600000),
});

db.sessions.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

db.sessions.getIndexes();
db.sessions.find();
