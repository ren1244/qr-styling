import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license';
import { readFileSync } from "node:fs";
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgText = readFileSync(path.resolve(__dirname, './package.json'), { encoding: "utf-8" });
const pkg = JSON.parse(pkgText);
const externalArray = Object.keys(pkg.dependencies || {});

export default [
    {
        input: 'src/index.js',
        external: externalArray,
        output: {
            file: 'build/index.cjs',
            format: 'cjs',
        },
        plugins: [
            nodeResolve(),
            commonjs(),
        ]
    },
    {
        input: 'src/index.js',
        output: {
            file: 'build/browser.esm.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            terser(),
            license({
                sourcemap: true,
                banner: {
                    commentStyle: 'regular',
                    content: `${pkg.name} v${pkg.version}
This prebuilt ESM version for browsers includes third-party libraries.  
See THIRD_PARTY_LICENSES.txt for details.`
                },
                thirdParty: {
                    multipleVersions: true,
                    output: {
                        file: path.resolve(__dirname, './build/THIRD_PARTY_LICENSES.txt'),
                    }
                }
            })
        ]
    }
];

