
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

export const processImage = httpsCallable(functions, 'processImage');