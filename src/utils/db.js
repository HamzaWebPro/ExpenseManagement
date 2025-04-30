// src/utils/db.js
'use client'

import { openDB } from 'idb'

const DB_NAME = 'UserSystemDB'
const STORE_NAME = 'UserSystemStore'
const DB_VERSION = 1

let dbPromise = null

if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export const dbAdd = async item => {
  if (!dbPromise) return
  const db = await dbPromise
  await db.add(STORE_NAME, item)
}

export const dbGetAll = async () => {
  if (!dbPromise) return []
  const db = await dbPromise
  return db.getAll(STORE_NAME)
}

export const dbUpdate = async item => {
  if (!dbPromise) return
  const db = await dbPromise
  await db.put(STORE_NAME, item)
}

export const dbDelete = async id => {
  if (!dbPromise) return
  const db = await dbPromise
  await db.delete(STORE_NAME, id)
}
