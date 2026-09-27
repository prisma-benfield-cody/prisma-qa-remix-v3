import { module } from "@prisma/composer";
import app from "./service.ts";

export default module("qa-remix-v3", ({ provision }) => {
  provision(app);
});
