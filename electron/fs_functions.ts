import { db } from './firebaseAdmin';


export async function fs_read(collection: string, id?: string) {
    const ref = db.collection(collection);
    if (id) {
      const doc = await ref.doc(id).get();
      if (!doc.exists) return null
      return { id: doc.id, ...doc.data() };
    } else {
      const snapshot = await ref.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }
  
  export async function fs_create(collection: string, data: any, docId?: string) {
    const ref = db.collection(collection);
    let docRef;
    if (docId) {
      docRef = ref.doc(docId);
      await docRef.set(data);
    } else {
      docRef = await ref.add(data);
    }
    return { id: docRef.id, ...data };
  }
  
  export async function fs_update(collection: string, id: string, data: any) {
    const ref = db.collection(collection).doc(id);
    await ref.update(data);
    return { id, ...data };
  }
  
  export async function fs_delete(collection: string, id: string) {
    await db.collection(collection).doc(id).delete();
    return { success: true };
  }