// Picks the real (Supabase) backend, or the demo backend when config.js is empty.
// Both expose: getUser, signIn, signOut, setGrade, lookup, listWords, updateWord, deleteWord.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import * as supabase from "./supabase.js";
import * as demo from "./demo.js";

// Add "?demo" to the page address to try the demo backend even when config.js is filled in.
export const DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY || new URLSearchParams(location.search).has("demo");
export const api = DEMO ? demo : supabase;
