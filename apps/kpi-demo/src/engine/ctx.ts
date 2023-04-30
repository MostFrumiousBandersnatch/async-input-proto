import React from 'react';

import { OrchestratorContextType } from '@async-input/widget';
import { KPIData } from 'engine/interpreter';

export const kpiOrchContext =
  React.createContext<OrchestratorContextType<KPIData>>(null);
