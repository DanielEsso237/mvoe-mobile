export type UserSpace = 'facilitateur' | 'superviseur' | 'parent';

export interface SpaceConfig {
  id: UserSpace;
  label: string;
  subtitle: string;
  letter: string;
  route: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}