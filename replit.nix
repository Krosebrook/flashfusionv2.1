{ pkgs }: {
  deps = [
    # Node.js 18 LTS for running the React application
    pkgs.nodejs-18_x
    
    # npm package manager
    pkgs.nodePackages.npm
    
    # TypeScript language server for IDE support
    pkgs.nodePackages.typescript-language-server
    
    # Additional build tools
    pkgs.nodePackages.vite
  ];
}
