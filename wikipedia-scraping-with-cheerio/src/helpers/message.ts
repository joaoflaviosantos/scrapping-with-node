import chalkAnimation from 'chalk-animation'

import sleep from './sleep.js'

interface Props {
  isError: boolean
  message: string
}

export default async function message({ isError = false, message }: Props) {
  let title

  if (isError) {
    title = chalkAnimation.pulse(`${message}`)
  } else {
    title = chalkAnimation.neon(`${message}`)
  }

  await sleep({ ms: 1000 })
  title.stop()
}
