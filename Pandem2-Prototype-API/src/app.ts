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
import { Skeleton } from './server/index';
import * as Path from 'path';
import { createMiddleware } from './components/auth';
import { DailyDataGenerator } from './schedulers/DailyDataGenerator';
import { validateImportSources } from './components/import/PandemSourceManager';
import { ISkeleton } from './server/interfaces/skeleton';
import { mkdirSync } from 'fs';
import fastifyStatic from '@fastify/static';
import { exposeFE } from './components/administration/config';

export const App = new Skeleton({
  rootPath: Path.resolve(__dirname),
  core: {
    externalServiceConfig: {
      enabled: false
    },
    database: {
      enabled: true
    },
    routesAuthentication: {
      enabled: true,
      middleware: createMiddleware
    },
    swagger: {
      enabled: true,
      // additional swagger options besides the informational ones from config
      // as described at https://swagger.io/specification/
      options: {
        // initialize security definitions; all secured APIs support Bearer Auth
        security: [
          {
            BearerAuth: []
          }
        ],
        components: {
          // define the security scheme for Bearer Auth
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'jwt'
            }
          }
        }
      }
    },
    scheduler: {
      enabled: false,
      interval: 30,
      tasks: {
        dailyDataGenerator: {
          noWorker: true,
          // try to generate data every hour
          interval: 60 * 60,
          action: async () => {
            const dailyGenerator = new DailyDataGenerator();
            await dailyGenerator.generate();
          }
        }
      }
    }
  },
  plugins: {
    /**
     * Validate importSources.config.json at startup
     */
    importSourcesValidation: {
      before: 'serviceRoutesRegistration',
      action: () => {
        validateImportSources();
      }
    },
    addStaticProfilePictureFolder: {
      action: (skeleton: ISkeleton) => {
        // Creates directory if it doesn't exit
        const dirPath = Path.join(__dirname, './../uploads');
        mkdirSync(dirPath, { recursive: true });
        skeleton.service.server.register(fastifyStatic, {
          root: dirPath,
          prefix: '/api/public/'
        });
      }
    },
    /**
     * Expose frontend application
     */
    exposeFE: {
      action: (skeleton: ISkeleton) => {
        exposeFE(skeleton);
      }
    }
  }
});

// run app startup routine
App.start();
