import {spawnSync} from 'node:child_process';
import {cpSync,existsSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
const root=process.cwd(),generated=resolve(root,'src/preview-routes');
const require=createRequire(import.meta.url),vite=resolve(dirname(require.resolve('vite/package.json')),'bin/vite.js');
function run(command,args){const result=spawnSync(command,args,{cwd:root,env:process.env,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)throw new Error('Build command failed with status '+result.status);}
// Compile and test the complete server source before constructing a frontend-only preview.
run('pnpm',['run','build:server']);
if(existsSync(generated))rmSync(generated,{recursive:true});
cpSync(resolve(root,'src/routes'),generated,{recursive:true,filter:path=>!/[+]server\.[cm]?[jt]s$|[+]page\.server\.[cm]?[jt]s$|[+]layout\.server\.[cm]?[jt]s$/.test(path)});
const layout=resolve(generated,'+layout.ts');
if(existsSync(layout))throw new Error('Review the existing root loader before enabling the static preview.');
writeFileSync(layout,"export const prerender = true;\nexport const trailingSlash = 'always';\n");
try{run(process.execPath,[vite,'build','--mode','cocoding-preview']);}
finally{rmSync(generated,{recursive:true});}
