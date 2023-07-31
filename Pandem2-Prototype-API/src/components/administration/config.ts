/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { existsSync } from 'fs-extra';
import { ISkeleton } from '../../server/interfaces/skeleton';
import { FastifyReply, FastifyRequest } from 'fastify';
import { resolve, join } from 'path';

/**
 * Expose frontend application
 * @param skeleton
 */
export const exposeFE = (skeleton: ISkeleton) => {
  // route any not handled paths to FE index
  skeleton.service.server.route({
    method: 'get',
    url: '*',
    handler: (request: FastifyRequest, reply: FastifyReply) => {
      const distPath = resolve(__dirname, './../../../client/dist');
      const indexPath = join(distPath, '/index.html');
      const requestedFile = (request.params as { '*': string })['*'];
      const requestedFilePath = join(distPath, requestedFile);

      if (!existsSync(indexPath)) {
        return reply.status(404).send();
      }

      if (!existsSync(requestedFilePath)) {
        return reply.sendFile('index.html', distPath, {
          cacheControl: false
        });
      } else {
        return reply.sendFile(requestedFile, distPath, {
          cacheControl: false
        });
      }
    }
  });
};