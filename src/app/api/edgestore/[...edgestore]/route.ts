import { NextResponse } from 'next/server';

// Check if EdgeStore credentials are available
const hasEdgeStoreCredentials = process.env.EDGE_STORE_ACCESS_KEY && process.env.EDGE_STORE_SECRET_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handler: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let edgeStoreRouter: any;

if (!hasEdgeStoreCredentials) {
  console.warn('EdgeStore credentials not found. File upload functionality is disabled.');
  
  // Return a simple handler that indicates EdgeStore is not configured
  handler = async () => {
    return NextResponse.json(
      { 
        error: 'EdgeStore not configured', 
        message: 'Please add EDGE_STORE_ACCESS_KEY and EDGE_STORE_SECRET_KEY to your environment variables' 
      },
      { status: 503 }
    );
  };
  
  // Create a mock router for type safety
  edgeStoreRouter = {
    publicFiles: null
  };
} else {
  // Only initialize EdgeStore if credentials are available
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initEdgeStore } = require('@edgestore/server');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createEdgeStoreNextHandler } = require('@edgestore/server/adapters/next/app');

  const es = initEdgeStore.create();

  /**
   * This is the main router for the Edge Store buckets.
   */
  edgeStoreRouter = es.router({
    publicFiles: es.fileBucket(),
  });

  handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
  });
}

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;