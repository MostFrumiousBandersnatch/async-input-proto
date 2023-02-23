import React from 'react';

export interface InputContextType {
  debug: boolean;
  hint?: string;
}

export const InputContext = React.createContext<InputContextType | null>(null);


