import { domains } from '../src/content/store'
import type { Block, Formula, Topic } from '../src/content/types'

export interface TextField {
  /** Where the string came from, so a failure names it. */
  where: string
  text: string
}

/** Every string in the content that may contain inline math between `$…$`. */
export function allTextFields(): TextField[] {
  const fields: TextField[] = []
  const add = (where: string, text: string | undefined) => {
    if (text) fields.push({ where, text })
  }

  for (const domain of domains) {
    add(`domain ${domain.id} title`, domain.title)
    for (const topic of domain.topics) {
      add(`topic ${topic.id} title`, topic.title)
      add(`topic ${topic.id} summary`, topic.summary)
      topic.blocks.forEach((block, i) => {
        const at = `topic ${topic.id} block ${i} (${block.type})`
        switch (block.type) {
          case 'text':
          case 'heading':
          case 'tip':
          case 'warning':
            add(at, block.text)
            break
          case 'formula':
            add(`${at} caption`, block.caption)
            add(`${at} condition`, block.condition)
            add(`${at} question`, block.question)
            break
          case 'example':
            add(`${at} title`, block.title)
            add(`${at} problem`, block.problem)
            block.steps.forEach((step, j) => add(`${at} step ${j}`, step.text))
            break
          case 'numworks':
            block.steps.forEach((step, j) => add(`${at} step ${j}`, step))
            add(`${at} note`, block.note)
            break
          case 'table':
            add(`${at} caption`, block.caption)
            block.headers.forEach((h, j) => add(`${at} header ${j}`, h))
            block.rows.forEach((row, j) =>
              row.forEach((cell, k) => add(`${at} row ${j} cell ${k}`, cell)),
            )
            break
          case 'graph':
            break
        }
      })
    }
  }
  return fields
}

/** Every display formula, with a label naming where it lives. */
export function allFormulas(): { where: string; formula: Formula }[] {
  const out: { where: string; formula: Formula }[] = []
  for (const domain of domains) {
    for (const topic of domain.topics) {
      for (const block of topic.blocks) {
        if (block.type === 'formula') out.push({ where: `${topic.id}/${block.id}`, formula: block })
      }
    }
  }
  return out
}

/** Every `latex` on an example step — display math that is not a Formula block. */
export function allStepLatex(): TextField[] {
  const out: TextField[] = []
  for (const domain of domains) {
    for (const topic of domain.topics) {
      topic.blocks.forEach((block, i) => {
        if (block.type !== 'example') return
        block.steps.forEach((step, j) => {
          if (step.latex) out.push({ where: `${topic.id} block ${i} step ${j}`, text: step.latex })
        })
      })
    }
  }
  return out
}

export function allTopics(): Topic[] {
  return domains.flatMap((d) => d.topics)
}

export function allBlocks(): Block[] {
  return allTopics().flatMap((t) => t.blocks)
}

/** The odd segments of a `$`-split string are inline math. */
export function inlineMathSegments(text: string): string[] {
  return text.split('$').filter((_, i) => i % 2 === 1)
}
