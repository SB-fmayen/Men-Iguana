'use client';

import { collection, query } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';
import type { Firestore } from 'firebase/firestore';
import type { FirestoreMenuCategory, FirestoreMenuItem } from '@/lib/menu-firestore';

export function useMenuCollections(firestore: Firestore) {
  const categoriesQuery = useMemoFirebase(() => query(collection(firestore, 'categories')), [firestore]);
  const itemsQuery = useMemoFirebase(() => query(collection(firestore, 'menu_items')), [firestore]);

  const categoriesState = useCollection<FirestoreMenuCategory>(categoriesQuery);
  const itemsState = useCollection<FirestoreMenuItem>(itemsQuery);

  return {
    categories: categoriesState.data,
    items: itemsState.data,
    isLoading: categoriesState.isLoading || itemsState.isLoading,
    categoriesError: categoriesState.error,
    itemsError: itemsState.error,
  };
}
