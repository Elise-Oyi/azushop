import {
  Firestore,
  CollectionReference,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { db } from "../config/firebase.ts";

interface ListOptions {
  limit?: number;
  pageToken?: string;
  includeTotal?: boolean;
}

export class FirestoreRepo<T extends object> {
  private collection: CollectionReference;
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = db.collection(this.collectionName);
  }

  //-- create a new document
  async create(data: Partial<T>) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...data };
  }

  //-- get one by doc id
  async getById(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  //-- return all
  async list(options: ListOptions = {}) {
    let query = this.collection.orderBy("createdAt", "desc");

    if (options?.pageToken) {
      const snapshot = await this.collection.doc(options.pageToken).get();
      if (snapshot.exists) query = query.startAfter(snapshot);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();

    const items = snapshot.docs.map(
      (doc: QueryDocumentSnapshot) =>
        ({ id: doc.id, ...doc.data() } as T & { id: string })
    );

    let total: number | undefined;
    if (options.includeTotal) {
      const agg = await this.collection.count().get();
      total = agg.data().count;
    }

    const nextPageToken =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;

    return { items, total, nextPageToken };
  }

  //-- return first doc that matches
    async getByField(field: string, value: unknown) {
    const snapshot = await this.collection.where(field, "==", value).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  //-- return all doc that matches
  async findManyByField(field: string, value: unknown) {
    const snapshot = await this.collection.where(field, "==", value).get();
    return snapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as T & { id: string })
    );
  }


   async update(id: string, data: Partial<T>) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return { id, ...data };
  }

  async delete(id: string) {
    await this.collection.doc(id).delete();
    return { success: true };
  }
}
