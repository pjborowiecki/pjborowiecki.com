import { CONSTANTS } from "~/src/constants"

const ERROR_VALUES = Object.values(CONSTANTS.ERRORS) as string[]

export function isKnownError(message: string): message is (typeof CONSTANTS.ERRORS)[keyof typeof CONSTANTS.ERRORS] {
  return ERROR_VALUES.includes(message)
}
