import { cache } from "react";
import { fetchPublicProfile } from "@/lib/firebase-public-profile";

// Share the Firestore read between page rendering and metadata in one request.
export const getPublicProfile = cache(fetchPublicProfile);
