
export interface ConvertedFile {
  id: string;
  name: string;
  size: number;
  data: any[];
  jsonString: string;
  status: 'processing' | 'completed' | 'error';
  insights?: string;
}

export type ConversionFormat = 'array' | 'object_by_first_col' | 'nested';
