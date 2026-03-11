#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = path.join(
  process.env.HOMEDRIVE || '',
  process.env.HOMEPATH || '',
  '.firebase',
  'serviceAccountKey.json'
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const CATEGORIES = [
  'Lasaña',
  'Entradas',
  'Hamburguesas',
  'Pizzas Personales (1 Ingrediente)',
  'Pizzas Personales de Especialidad',
  'Pizzas Personales Premium',
  'Pizzas Grandes (1 Ingrediente)',
  'Pizzas Grandes de Especialidad',
  'Pizzas Grandes de Especialidad Premium',
  'Don Calzone - Tradicionales',
  'Don Calzone - Especialidades',
  'Don Calzone - Premium',
  'Enrollado - Tradicionales',
  'Enrollado - Especialidades',
  'Enrollado - Premium',
  'Cono Pizza - Tradicionales',
  'Cono Pizza - Especialidades',
  'Cono Pizza - Premium',
  'Tortillas de Harina',
  'Tortillas de Harina - Especialidad',
  'Shukos',
  'Shukos - Especialidades',
  'Extras',
  'Bebidas',
];

async function restore() {
  try {
    const snapshot = await db.collection('categories').get();
    const existingNames = new Set(snapshot.docs.map((doc) => doc.data().name));

    let maxOrder = -1;
    snapshot.docs.forEach((doc) => {
      const order = doc.data().order || 0;
      if (order > maxOrder) maxOrder = order;
    });

    let restored = 0;
    for (const categoryName of CATEGORIES) {
      if (!existingNames.has(categoryName)) {
        const [parentCandidate, subcategoryCandidate] = categoryName.split(' - ');
        const isSubmenuCategory = parentCandidate === 'Don Calzone' || parentCandidate === 'Enrollado';

        const slug = categoryName
          .toLowerCase()
          .replace(/ñ/g, 'n')
          .replace(/á/g, 'a')
          .replace(/é/g, 'e')
          .replace(/í/g, 'i')
          .replace(/ó/g, 'o')
          .replace(/ú/g, 'u')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '');

        maxOrder++;

        await db.collection('categories').add({
          name: categoryName,
          slug: slug,
          parentCategory: isSubmenuCategory ? parentCandidate : null,
          subcategory: isSubmenuCategory ? subcategoryCandidate : null,
          order: maxOrder,
          isActive: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`✓ Restaurada: ${categoryName}`);
        restored++;
      }
    }

    console.log('');
    console.log(`✅ Se restauraron ${restored} categorías`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

restore();
