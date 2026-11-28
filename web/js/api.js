// Picks the real (Supabase) backend, or the demo backend when config.js is empty.
// Both expose: getUser, signIn, signOut, setGrade, lookup, listWords, updateWord, deleteWord.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js?v=0.1.28-tp82ly";
import * as supabase from "./supabase.js?v=0.1.28-tp82ly";
import * as demo from "./demo.js?v=0.1.28-tp82ly";

// Add "?demo" to the page address to try the demo backend even when config.js is filled in.
export const DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY || new URLSearchParams(location.search).has("demo");
export const api = DEMO ? demo : supabase;
