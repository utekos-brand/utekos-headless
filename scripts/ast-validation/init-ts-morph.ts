import { Project } from 'ts-morph'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Genererer en skuddsikker, absolutt bane uansett hvor scriptet trigges fra
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tsConfigPath = path.resolve(__dirname, '../../tsconfig.json')

const project = new Project({
  tsConfigFilePath: tsConfigPath,
  skipFileDependencyResolution: false
})

const sourceFiles = project.getSourceFiles()
console.log(`[System Check]: Vellykket innlasting av ${sourceFiles.length} kildefiler.`)
