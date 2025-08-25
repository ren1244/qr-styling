import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
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
        input: 'src/qrcode.js',
        external: externalArray,
        output: {
            file: 'build/qrcode.cjs',
            format: 'cjs'
        },
        plugins: [
            nodeResolve(),
            commonjs()
        ]
    },
    {
        input: 'src/qrcode.js',
        output: {
            file: 'build/browser.esm.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            terser(),
        ]
    },
    {
        input: 'src/qrcode.js',
        output: {
            file: 'build/browser.umd.js',
            format: 'umd',
            sourcemap: true,
            name: 'qrcode',
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            terser(),
        ]
    }
];
