type ToolkitModule = typeof import('@rork-ai/toolkit-sdk');

let cachedToolkitModule: ToolkitModule | null = null;

export const loadToolkitModule = async (): Promise<ToolkitModule> => {
  if (cachedToolkitModule) {
    return cachedToolkitModule;
  }

  cachedToolkitModule = await import('@rork-ai/toolkit-sdk');
  return cachedToolkitModule;
};
