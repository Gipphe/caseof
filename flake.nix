{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages = {
          caseof = pkgs.buildNpmPackage {
            pname = "caseof";
            version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
            src = ./.;
            npmDepsHash = "sha256-d2ZISACfy9rY19VY+AWi/p+DUHjz/Wf5wm7E6nWzDXI=";
          };
          default = self.packages.${system}.caseof;
        };

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.nodejs_24 ];
        };

        checks = {
          build = self.packages.x86_64-linux.caseof;

          tests = self.packages.x86_64-linux.caseof.overrideAttrs {
            name = "npm-test";
            installPhase = /* bash */ ''
              rm -rf "$out"
              npm run test:coverage && touch "$out"
            '';
          };

          fmt = self.packages.x86_64-linux.caseof.overrideAttrs {
            name = "npm-fmt-check";
            installPhase = /* bash */ ''
              rm -rf "$out"
              npm run fmt:check && touch "$out"
            '';
          };
        };
      }
    );
}
