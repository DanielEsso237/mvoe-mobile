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

export * from './common';
export * from './superviseur';
export * from './facilitateur';
export * from './parent';
export * from './session';
