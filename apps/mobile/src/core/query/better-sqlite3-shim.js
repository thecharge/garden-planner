// Intentional shim: the device runtime never constructs a better-sqlite3
// database. The in-memory JS repository in repository.ts is used instead.
// If this module is ever actually invoked at runtime (it shouldn't be), the
// thrown error pinpoints the import path.
module.exports = function BetterSqlite3Stub() {
  throw new Error(
    "better-sqlite3 is a Node-only dependency and is not available on the device runtime. " +
    "The mobile app uses the pure-JS repository at apps/mobile/src/core/query/repository.ts."
  );
};
module.exports.default = module.exports;
