// moves one item of a list to a new spot
export function moveItem<T>(list: T[], from: number, to: number) {
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
}
