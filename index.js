const fs = require('fs')

const start = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var normalViewBox = '0 0 1024 1024';
var newViewBox = '64 64 896 896';
var fill = 'fill';
var outline = 'outline';
var twotone = 'twotone';
function getNode(viewBox) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    return {
        tag: 'svg',
        attrs: { viewBox: viewBox, focusable: false },
        children: paths.map(function (path) {
            if (Array.isArray(path)) {
                return {
                    tag: 'path',
                    attrs: {
                        fill: path[0],
                        d: path[1]
                    }
                };
            }
            return {
                tag: 'path',
                attrs: {
                    d: path
                }
            };
        })
    };
}
function getIcon(name, theme, icon) {
    return {
        name: name,
        theme: theme,
        icon: icon
    };
}`

const fixIcons = () => {
  const icons = JSON.parse(fs.readFileSync('icons.json'))
  if (!fs.existsSync('node_modules/@ant-design/icons/lib/dist.bak.js')) {
    console.log('Copying dist.js')

    fs.copyFileSync(
      'node_modules/@ant-design/icons/lib/dist.js',
      'node_modules/@ant-design/icons/lib/dist.bak.js'
    )
  }

  var fileContent = fs.readFileSync(
    'node_modules/@ant-design/icons/lib/dist.bak.js',
    'utf8'
  )
  var lines = fileContent.split(/\r?\n/)
  var interestingLines = lines.filter(d => d.startsWith('exports.'))
  var chosenLines = interestingLines.filter(d =>
    icons.some(e => d.includes(`getIcon('${e}',`))
  )
  var newLines = []
  chosenLines.forEach(line => {
    let newLine = line
    if (line.endsWith('));')) {
    } else {
      let index = lines.indexOf(line) + 1
      while (true) {
        var next = lines[index++]
        newLine += next
        if (next == '});') break
      }
    }
    newLines.push(newLine)
  })

  var newFileContent = start
  newLines.forEach(n => (newFileContent = newFileContent + '\n' + n))
  const existing = fs.readFileSync(
    'node_modules/@ant-design/icons/lib/dist.js',
    'utf8'
  )
  if (existing != newFileContent) {
    console.log('updating dist.js')
    fs.writeFileSync(
      'node_modules/@ant-design/icons/lib/dist.js',
      newFileContent,
      'utf8'
    )
  }
}

module.exports = function(bundler) {
  bundler.on('buildStart', entryPoints => {
    fixIcons()
  })

  bundler.on('buildEnd', entryPoints => {
    fixIcons()
  })
}
