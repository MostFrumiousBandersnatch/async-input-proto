import React from 'react';

export interface InputContextType {
  debug: boolean;
}

export const InputContext = React.createContext<InputContextType | null>(null);


