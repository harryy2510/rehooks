const { src, dest, task, series } = require('gulp')
const filter = require('gulp-filter')
const babel = require('gulp-babel')
const jeditor = require('gulp-json-editor')
const rimraf = require('gulp-rimraf')
const shell = require('gulp-shell')
const tsc = require('gulp-typescript')
const env = require('gulp-env')
const tsconfig = require('./tsconfig.json')
const babelConfig = require('./babel.config')

const envs = env.set({
    NODE_ENV: 'production'
})

task(
    'release',
    shell.task(
        `standard-version --no-verify && gulp build && npm publish ${tsconfig.compilerOptions.outDir} --access public && (git push --follow-tags origin master || true)`
    )
)

task('clean', () =>
    src([tsconfig.compilerOptions.outDir], {
        read: false,
        allowEmpty: true
    }).pipe(rimraf())
)

task('copy:package', () => {
    const deps = []
    const exactDeps = ['react', 'react-dom']
    return src('./package.json')
        .pipe(
            jeditor((json) => {
                const packages = Object.keys(json.dependencies || {}).filter(
                    (k) => deps.some((d) => k.startsWith(d)) || exactDeps.some((d) => d === k)
                )
                if (packages.length) {
                    json.peerDependencies = json.peerDependencies || {}
                    packages.forEach((p) => {
                        delete json.dependencies[p]
                        json.peerDependencies[p] = '*'
                    })
                }
                delete json.private
                delete json.devDependencies
                delete json.scripts
                delete json.husky
                return json
            })
        )
        .pipe(dest(tsconfig.compilerOptions.outDir))
})

task('dts', () => {
    return src(['./src/lib/**/*'])
        .pipe(envs)
        .pipe(
            filter([
                '**/*.ts',
                '**/*.tsx',
                '**/*.js',
                '**/*.jsx',
                '!**/setupTests.*',
                '!**/react-app-env.*'
            ])
        )
        .pipe(tsc({ ...tsconfig.compilerOptions, noEmit: false, isolatedModules: false }))
        .dts.pipe(dest(tsconfig.compilerOptions.outDir))
})

task(
    'build',
    series('clean', 'copy:package', 'dts', () =>
        src(['./src/lib/**/*'])
            .pipe(filter(['**', '!**/setupTests.*', '!**/react-app-env.*']))
            .pipe(babel(babelConfig))
            .pipe(dest(tsconfig.compilerOptions.outDir))
    )
)
