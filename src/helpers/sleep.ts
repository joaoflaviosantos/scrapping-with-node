interface Props {
  ms: number
}

const sleep = ({ ms }: Props) => new Promise((r) => setTimeout(r, ms))

export default sleep
