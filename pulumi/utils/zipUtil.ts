import * as fs from "fs";
import * as archiver from "archiver";

// Function to create a zip file
export function createZipFile(sourceDir: string, outPath: string): Promise<void> {
  const exclude = [
    "node_modules/**",
    ".git/**",
    ".env",
    ".env.*",
    "*.log",
    "*.swp",
    "venv/**",
    "apps/api/uploads/**",
    "apps/api/node_modules/**",
    "apps/client/node_modules/**",
    "pulumi/**",
    "turbo-monorepo.zip",
  ];

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    archive.glob("**/*", {
      cwd: sourceDir,
      ignore: exclude,
      dot: true,
    });

    archive.finalize();
  });
}
