import { keywords, typeKeywords } from '@/utils/spx'
import type { Project } from '../project'
import type { Stage } from '../stage'
import type { Sprite } from '../sprite'

function validateAssetName(name: string) {
  if (name === '') return { en: 'The name must not be blank', zh: '名字不可为空' }
  if (name.length > 100)
    return {
      en: 'The name is too long (maximum is 100 characters)',
      zh: '名字长度超出限制（最多 100 个字符）'
    }
  // spx code is go+ code, and the asset name will compiled to an identifier of go+
  // so asset name rules is depend on the identifier rules of go+.
  const regex = /^[\u4e00-\u9fa5a-zA-Z_][\u4e00-\u9fa5a-zA-Z0-9_]*$/
  if (!regex.test(name)) return { en: 'Invalid name', zh: '格式不正确' }
  if (typeKeywords.includes(name)) return { en: 'Conflict with keywords', zh: '与关键字冲突' }
  if (keywords.includes(name)) return { en: 'Conflict with keywords', zh: '与关键字冲突' }
}

export const spriteNameTip = {
  en: 'The sprite name can only contain ASCII letters, digits, and the character _.',
  zh: '精灵名称只能包含英文字母、数字及下划线'
}

export function validateSpriteName(name: string, project: Project | null) {
  const err = validateAssetName(name)
  if (err != null) return err
  if (project != null) {
    if (project.sprites.find((s) => s.name === name))
      return { en: `Sprite with name ${name} already exists`, zh: '存在同名的精灵' }
    if (project.sounds.find((s) => s.name === name))
      return { en: `Sound with name ${name} already exists`, zh: '存在同名的声音' }
  }
}

export const costumeNameTip = {
  en: 'The costume name can only contain ASCII letters, digits, and the character _.',
  zh: '造型名称只能包含英文字母、数字及下划线'
}

export function validateCostumeName(name: string, sprite: Sprite | null) {
  const err = validateAssetName(name)
  if (err != null) return err
  if (sprite != null && sprite.costumes.find((c) => c.name === name))
    return { en: `Costume with name ${name} already exists`, zh: '存在同名的造型' }
}

export const soundNameTip = {
  en: 'The sound name can only contain ASCII letters, digits, and the character _.',
  zh: '声音名称只能包含英文字母、数字及下划线'
}

export function validateSoundName(name: string, project: Project | null) {
  // Now same validation logic for sprite & sound
  return validateSpriteName(name, project)
}

export const backdropNameTip = {
  en: 'The backdrop name can only contain ASCII letters, digits, and the character _.',
  zh: '背景名称只能包含英文字母、数字及下划线'
}

export function validateBackdropName(name: string, stage: Stage | null) {
  const err = validateAssetName(name)
  if (err != null) return err
  if (stage != null && stage.backdrops.find((b) => b.name === name))
    return { en: `Backdrop with name ${name} already exists`, zh: '存在同名的背景' }
}

function upFirst(str: string) {
  return str[0].toUpperCase() + str.slice(1)
}

/** Convert any string to valid asset name, empty string may be returned */
export function normalizeAssetName(src: string, cas: 'camel' | 'pascal') {
  src = src
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^[^a-zA-Z]+/, '') // remove invalid starting such as numbers
  const parts = src.split('_').filter((p) => !!p)
  if (parts.length === 0) return ''
  const [firstpart, ...otherParts] = parts
  const result = [
    cas === 'pascal' ? upFirst(firstpart) : firstpart,
    ...otherParts.map(upFirst)
  ].join('')
  return result.slice(0, 20) // 20 should be enough, it will be hard to read with too long name
}

function getValidName(base: string, isValid: (name: string) => boolean) {
  let name: string
  for (let i = 1; ; i++) {
    name = i === 1 ? base : base + i
    if (isValid(name)) return name
    if (i > 10000) throw new Error(`unexpected infinite loop with base ${base}`) // for debug purpose
  }
}

export function getSpriteName(project: Project | null, base = '') {
  base = normalizeAssetName(base, 'pascal') || 'Sprite'
  return getValidName(base, (n) => validateSpriteName(n, project) == null)
}

export function ensureValidSpriteName(name: string, project: Project | null) {
  if (validateSpriteName(name, project) == null) return name
  return getSpriteName(project, name)
}

export function getCostumeName(sprite: Sprite | null, base = '') {
  base = normalizeAssetName(base, 'camel') || 'costume'
  return getValidName(base, (n) => validateCostumeName(n, sprite) == null)
}

export function ensureValidCostumeName(name: string, sprite: Sprite | null) {
  if (validateCostumeName(name, sprite) == null) return name
  return getCostumeName(sprite, name)
}

export function getSoundName(project: Project | null, base = '') {
  base = normalizeAssetName(base, 'camel') || 'sound'
  return getValidName(base, (n) => validateSoundName(n, project) == null)
}

export function ensureValidSoundName(name: string, project: Project | null) {
  if (validateSoundName(name, project) == null) return name
  return getSoundName(project, name)
}

export function getBackdropName(stage: Stage | null, base = '') {
  base = normalizeAssetName(base, 'camel') || 'backdrop'
  return getValidName(base, (n) => validateBackdropName(n, stage) == null)
}

export function ensureValidBackdropName(name: string, stage: Stage | null) {
  if (validateBackdropName(name, stage) == null) return name
  return getBackdropName(stage, name)
}