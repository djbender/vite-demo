import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/v1/upload", "routes/api.upload.tsx"),
  route("api/v1/upload/:filename", "routes/api.upload.$filename.tsx"),
  route("api/v1/bulk-delete", "routes/api.bulk-delete.tsx"),
] satisfies RouteConfig;
