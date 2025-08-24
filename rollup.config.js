import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
export default [
    {
        input: 'src/qrcode.js',
        external: ['dijkstrajs'],
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
        external: ['dijkstrajs'],
        output: {
            file: 'build/qrcode.mjs',
            format: 'es'
        },
        plugins: [
            nodeResolve(),
            commonjs(),
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
