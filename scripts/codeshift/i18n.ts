/*
 Usage: jscodeshift --extensions=tsx --parser=tsx --run-in-band -t ./scripts/codeshift/i18n.ts ./packages/client/components/
 Collect strings and wrap them in translation hook
 Running in-band is necessary as the transform also collects and writes the existing translations to i18n/en.json
*/

import {Transform, ASTPath, Function} from 'jscodeshift/src/core'
import { visit } from "ast-types"
import fs from 'fs'

const getFunctionName = (fd: ASTPath<Function>) => {
  if (fd.value.type === 'ArrowFunctionExpression') {
    return fd.parentPath.value.id?.name
  }
  if (fd.value.type === 'FunctionDeclaration') {
    return fd.value.id.name
  }
}

const isUpperCase = (s: string) => /^[A-Z].*$/.test(s)

var camelSentence = function camelSentence(str) {
  return  (" " + str).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr)
  {
    return chr.toUpperCase();
  }).replace(/[^0-9A-Z]+/gi,"")
}

const isComponent = (fd: ASTPath<Function>) => {
  return isUpperCase(getFunctionName(fd))
}

const readTranslations = () => {
  try {
    const data = fs.readFileSync('static/translations/en.json')
    return JSON.parse(data.toString())
  } catch(e) {// does not exist
    return {}
  }
}
const translations = readTranslations()
const writeTranslations = () => {
  fs.writeFileSync('static/translations/en.json', JSON.stringify(translations, undefined, 2))
}
const addTranslation = (component: string, key: string, text: string) => {
  translations[component] = {
    ...translations[component],
    [key]: text
  }
}

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {source} = fileInfo

  const root = j(source)

  const fdeclarations = root.find(j.Function)
  let addImport = false

  fdeclarations.forEach(fd => {
    if (isComponent(fd)) {
      let addHook = false
      const translationComments = [] as string[]

      visit(fd.node, {
        visitLiteral(fe) {
          const text = fe.value.value?.toString().trim()
          const key = camelSentence(text)

          // skip whitespace
          if (!text || !key) return false

          const component = getFunctionName(fd)

          const callExpression = j.callExpression.from({
            callee: j.identifier('t'),
            arguments: [
              j.literal(`${component}.${key}`)
            ]
          })

          if (fe.value.type === 'JSXText') {
            addHook = true
            fe.replace(j.jsxExpressionContainer.from({
              expression: callExpression
            }))
            addTranslation(component, key, text)
          }
          else if(fe.value.type === 'StringLiteral' && fe.parent.value.type === 'JSXExpressionContainer') {
            addHook = true
            fe.replace(callExpression)
            addTranslation(component, key, text)
          }
          // likelihood is high that this is display text, let's add a comment to the hook
          else if(text.includes(' ')) {
            // just add a comment as otherwise we need to check for attributes etc.
            translationComments.push(`FIXME i18n: ${text}`)
          }
          return false
        }
      })

      if (addHook) {
        addImport = true

        const hook = j.variableDeclaration.from({
          kind: 'const',
          declarations: [
            j.variableDeclarator.from({
              id: j.objectPattern([
                j.objectProperty.from({
                  key: j.identifier('t'),
                  value: j.identifier('t'),
                  shorthand: true
                })
              ]),
              init: j.callExpression.from({
                callee: j.identifier('useTranslation'),
                arguments: []
              }),
            })
          ]
        })
        if (translationComments.length) {
          hook.comments = translationComments.map((comment) => (j.commentLine(comment)))
        }

        // put useTranslation after props deconstruction
        // this will fail for funcitons without a body, i.e. () => (<></>) but it's not worth fixing for a one shot script
        const firstBlock = fd.value.body.body[0]
        const firstDeclaration = firstBlock.type === "VariableDeclaration" && firstBlock.declarations[0]
        if ((firstDeclaration as any)?.init?.name === 'props') {
          fd.value.body.body.unshift(firstBlock)
          fd.value.body.body[1] = hook
        }
        else {
          fd.value.body.body.unshift(hook)
        }
      }
    }
  })
  if (addImport) {
    const i18nextImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('useTranslation'))],
      j.stringLiteral('react-i18next'),
    );

    const imports = root.find(j.ImportDeclaration)
    if (imports.length) {
      j(imports.at(0).get()).insertBefore(i18nextImport)
    } else {
      root.get().node.program.body.unshift(i18nextImport)
    }
  }

  writeTranslations()
  return root.toSource()
}

module.exports = transform
module.exports.parser = 'tsx'; 
