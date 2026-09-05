import type { FacilitateurCompte } from "./facilitateur";
import type { ParentProgramme } from "./parent";
import type { SuperviseurCompte } from "./superviseur";

export interface FacilitateurSession {
  token: string;
  compte: FacilitateurCompte;
}

export interface SuperviseurSession {
  token: string;
  compte: SuperviseurCompte;
}

export interface ParentSession {
  token: string | null;
  langue: string;
  programme?: ParentProgramme;
}
