const fs = require('fs');
const { execSync } = require('child_process');

// Read the current package.json file
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Increment the version (you can choose 'patch', 'minor', or 'major')
const versionType = process.argv[2] || 'patch';
const currentVersion = packageJson.version;

const newVersion = incrementVersion(currentVersion, versionType);
packageJson.version = newVersion;

// Write the updated package.json back to the file
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

// Run npm version command to update the package.json and create a git tag
execSync(`npm version ${versionType}`, { stdio: 'inherit' });

console.log(`Version updated to ${newVersion}`);

function incrementVersion(version, type) {
  const parts = version.split('.');
  switch (type) {
    case 'major':
      parts[0] = String(parseInt(parts[0]) + 1);
      parts[1] = '0';
      parts[2] = '0';
      break;
    case 'minor':
      parts[1] = String(parseInt(parts[1]) + 1);
      parts[2] = '0';
      break;
    case 'patch':
    default:
      parts[2] = String(parseInt(parts[2]) + 1);
      break;
  }
  return parts.join('.');
}
