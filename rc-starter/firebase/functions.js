
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
export const processImage = httpsCallable(functions, 'processImage');