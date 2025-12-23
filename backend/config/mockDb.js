// ============ MOCK DATABASE FOR DEVELOPMENT ============
// Provides Firestore-compatible API with in-memory storage

export class MockDB {
  constructor() {
    this.collections = {
      users: new Map(),
      otps: new Map(),
      orders: new Map(),
      products: new Map(),
    };
    this.docId = 0;
  }

  // Generate unique IDs
  generateId() {
    return String(++this.docId);
  }

  // Get collection
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Map();
    }
    return new MockCollection(this, name);
  }
}

class MockCollection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this.data = db.collections[name];
    this.query = { where: [], orderBy: [], limit: null };
  }

  // Add document
  async add(data) {
    const id = this.db.generateId();
    this.data.set(id, { ...data, id });
    return { id };
  }

  // Get document by ID
  doc(id) {
    return new MockDocument(this.db, this.name, id);
  }

  // Query: WHERE clause
  where(field, operator, value) {
    const newCollection = new MockCollection(this.db, this.name);
    newCollection.query = { ...this.query };
    newCollection.query.where.push({ field, operator, value });
    return newCollection;
  }

  // Query: ORDER BY
  orderBy(field, direction = "asc") {
    const newCollection = new MockCollection(this.db, this.name);
    newCollection.query = { ...this.query };
    newCollection.query.orderBy.push({ field, direction });
    return newCollection;
  }

  // Query: LIMIT
  limit(count) {
    const newCollection = new MockCollection(this.db, this.name);
    newCollection.query = { ...this.query };
    newCollection.query.limit = count;
    return newCollection;
  }

  // Execute query and get results
  async get() {
    let results = Array.from(this.data.values());

    // Apply WHERE filters
    for (const filter of this.query.where) {
      results = results.filter((doc) => {
        const fieldValue = doc[filter.field];
        switch (filter.operator) {
          case "==":
            return fieldValue === filter.value;
          case ">":
            return fieldValue > filter.value;
          case "<":
            return fieldValue < filter.value;
          case ">=":
            return fieldValue >= filter.value;
          case "<=":
            return fieldValue <= filter.value;
          default:
            return true;
        }
      });
    }

    // Apply ORDER BY
    for (const order of this.query.orderBy) {
      results.sort((a, b) => {
        const aVal = a[order.field];
        const bVal = b[order.field];
        if (order.direction === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Apply LIMIT
    if (this.query.limit) {
      results = results.slice(0, this.query.limit);
    }

    // Return Firestore-compatible response
    return {
      empty: results.length === 0,
      docs: results.map((doc) => ({
        id: doc.id,
        data: () => doc,
        exists: true,
      })),
    };
  }
}

class MockDocument {
  constructor(db, collectionName, docId) {
    this.db = db;
    this.collectionName = collectionName;
    this.docId = docId;
    this.data = db.collections[collectionName];
  }

  async get() {
    const doc = this.data.get(this.docId);
    return {
      exists: !!doc,
      data: () => doc || {},
      id: this.docId,
    };
  }

  async update(fields) {
    const doc = this.data.get(this.docId);
    if (!doc) throw new Error(`Document ${this.docId} not found`);
    Object.assign(doc, fields);
    return { id: this.docId };
  }

  async set(data) {
    this.data.set(this.docId, { ...data, id: this.docId });
    return { id: this.docId };
  }

  async delete() {
    this.data.delete(this.docId);
  }
}
