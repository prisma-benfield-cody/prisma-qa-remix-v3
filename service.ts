import node from "@prisma/composer/node";
import { compute } from "@prisma/composer-prisma-cloud";

export default compute({
  name: "app",
  build: node({
    module: import.meta.url,
    // Ship the whole app tree; entry is the Remix Node server.
    dir: ".",
    entry: "server.ts",
  }),
});
