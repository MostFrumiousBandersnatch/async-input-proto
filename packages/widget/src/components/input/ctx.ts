import React from 'react';

export interface InputContextType {
  debug: boolean;
  hint?: string;
  debounceTime?: number;
}

export const InputContext = React.createContext<InputContextType | null>(null);


