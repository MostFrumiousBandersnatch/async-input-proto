import React from 'react';

export interface InputContextType {
  debug: boolean;
  placeholder: string;
  hint?: string;
  debounceTime?: number;
}

export const InputContext = React.createContext<InputContextType | null>(null);


