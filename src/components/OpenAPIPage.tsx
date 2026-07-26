import { createOpenAPIPage } from 'fumadocs-openapi/ui';

/** Static reference renderer: interactive credential-bearing requests stay disabled. */
export const OpenAPIPage = createOpenAPIPage({
  playground: {
    enabled: false,
  },
});
